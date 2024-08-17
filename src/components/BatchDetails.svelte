<script>
  import { onMount } from 'svelte';
  import { pb } from '../services/pocketbase';
  import { format } from 'date-fns';

  export let batchId;
  
  let batch = null;
  let dataPoints = [];
  let loading = true;
  let error = null;
  let editMode = false;

  onMount(async () => {
    await fetchBatchDetails();
  });

  async function fetchBatchDetails() {
    try {
      batch = await pb.collection('DataBatch').getOne(batchId, {
        expand: 'data_points,owner'
      });
      dataPoints = batch.expand.data_points || [];
      loading = false;
    } catch (err) {
      error = err.message;
      loading = false;
    }
  }

  async function updateBatchStatus(newStatus) {
    try {
      const data = {
        status: newStatus,
        review_date: new Date().toISOString()
      };
      if (newStatus === 'rejected') {
        data.rejection_reason = batch.rejection_reason;
      } else if (newStatus === 'accepted') {
        data.acceptance_reason = batch.acceptance_reason;
      }
      await pb.collection('DataBatch').update(batchId, data);
      batch.status = newStatus;
      batch.review_date = data.review_date;
      editMode = false;
    } catch (err) {
      error = `Failed to update batch status: ${err.message}`;
    }
  }

  async function updateDataPointStatus(dataPointId, newStatus) {
    try {
      const dataPoint = dataPoints.find(dp => dp.id === dataPointId);
      if (!dataPoint) {
        throw new Error('Data point not found');
      }

      const data = {
        status: newStatus,
        review_date: new Date().toISOString()
      };

      if (newStatus === 'Declined') {
        data.rejection_reason = dataPoint.rejection_reason;
      } else if (newStatus === 'Accepted') {
        data.acceptance_reason = dataPoint.acceptance_reason;
      }

      await pb.collection('DataPoint').update(dataPointId, data);
      
      // Update the local state
      dataPoint.status = newStatus;
      dataPoint.review_date = data.review_date;

      // Check if all data points have been reviewed and update batch status accordingly
      const allReviewed = dataPoints.every(dp => dp.status === 'Accepted' || dp.status === 'Declined');
      const allAccepted = dataPoints.every(dp => dp.status === 'Accepted');
      const allRejected = dataPoints.every(dp => dp.status === 'Declined');

      if (allReviewed) {
        if (allAccepted) {
          await updateBatchStatus('accepted');
        } else if (allRejected) {
          await updateBatchStatus('rejected');
        } else {
          await updateBatchStatus('partially_accepted');
        }
      }

    } catch (err) {
      error = `Failed to update data point status: ${err.message}`;
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'accepted':
      case 'Accepted':
        return 'bg-green-100 border-green-500';
      case 'rejected':
      case 'Declined':
        return 'bg-red-100 border-red-500';
      case 'partially_accepted':
        return 'bg-yellow-100 border-yellow-500';
      default:
        return 'bg-gray-100 border-gray-500';
    }
  }

  function getFileUrl(dataPoint) {
    return pb.files.getUrl(dataPoint, dataPoint.data);
  }

  function formatDate(date) {
    return format(new Date(date), 'PPpp');
  }

  function toggleEditMode() {
    editMode = !editMode;
  }

  function getFileType(dataPoint) {
    const fileType = dataPoint.data.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(fileType)) return 'video';
    if (['mp3', 'wav', 'ogg'].includes(fileType)) return 'audio';
    return 'other';
  }
</script>

<div class="container mx-auto px-4 py-8">
  {#if loading}
    <p class="text-center">Loading batch details...</p>
  {:else if error}
    <p class="text-red-500 text-center">{error}</p>
  {:else}
    <h2 class="text-2xl font-bold mb-4">Batch Details</h2>
    <div class="bg-white shadow-md rounded-lg p-6 mb-6 {getStatusColor(batch.status)} border-l-4">
      <div class="flex justify-between items-center mb-4">
        <p class="text-lg font-semibold">Status: {batch.status}</p>
        <button 
          on:click={toggleEditMode} 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editMode ? 'Cancel Edit' : 'Review Batch'}
        </button>
      </div>
      <p>Description: {batch.description}</p>
      <p>Uploaded by: {batch.expand.owner.name}</p>
      <p>Upload date: {formatDate(batch.created)}</p>
      {#if batch.review_date}
        <p>Reviewed on: {formatDate(batch.review_date)}</p>
      {/if}
      {#if batch.status === 'rejected' && batch.rejection_reason}
        <p class="text-red-600 mt-2">Rejection reason: {batch.rejection_reason}</p>
      {:else if batch.status === 'accepted' && batch.acceptance_reason}
        <p class="text-green-600 mt-2">Acceptance reason: {batch.acceptance_reason}</p>
      {/if}
      
      {#if editMode}
        <div class="mt-4">
          <textarea 
            bind:value={batch.acceptance_reason} 
            placeholder="Enter acceptance reason..." 
            class="w-full p-2 border rounded mb-2"
          ></textarea>
          <button 
            on:click={() => updateBatchStatus('accepted')} 
            class="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
          >
            Accept Batch
          </button>
          
          <textarea 
            bind:value={batch.rejection_reason} 
            placeholder="Enter rejection reason..." 
            class="w-full p-2 border rounded mb-2 mt-4"
          ></textarea>
          <button 
            on:click={() => updateBatchStatus('rejected')} 
            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Reject Batch
          </button>
        </div>
      {/if}
    </div>

    <h3 class="text-xl font-bold mb-4">Data Points</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each dataPoints as dataPoint (dataPoint.id)}
        <div class="bg-white shadow-md rounded-lg p-4 {getStatusColor(dataPoint.status)} border-l-4">
          <h4 class="text-lg font-semibold mb-2">{dataPoint.description}</h4>
          
          {#if dataPoint.data}
            {#if getFileType(dataPoint) === 'image'}
              <img src={getFileUrl(dataPoint)} alt="Data point" class="w-full h-48 object-cover mb-2 rounded" />
            {:else if getFileType(dataPoint) === 'video'}
            <video src={getFileUrl(dataPoint)} controls class="w-full h-48 object-cover mb-2 rounded">
              <track kind="captions" src="path/to/captions.vtt" srclang="en" label="English">
              Your browser does not support the video tag.
            </video>
            {:else if getFileType(dataPoint) === 'audio'}
              <audio src={getFileUrl(dataPoint)} controls class="w-full mb-2">
                Your browser does not support the audio tag.
              </audio>
            {:else}
              <a href={getFileUrl(dataPoint)} target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">
                View File
              </a>
            {/if}
          {/if}

          <p>Status: {dataPoint.status}</p>
          <p>Tags: {dataPoint.tags?.join(', ')}</p>
          
          {#if dataPoint.review_date}
            <p>Reviewed on: {formatDate(dataPoint.review_date)}</p>
          {/if}
          
          {#if dataPoint.status === 'Declined' && dataPoint.rejection_reason}
            <p class="text-red-600 mt-2">Rejection reason: {dataPoint.rejection_reason}</p>
          {:else if dataPoint.status === 'Accepted' && dataPoint.acceptance_reason}
            <p class="text-green-600 mt-2">Acceptance reason: {dataPoint.acceptance_reason}</p>
          {/if}
          
          {#if editMode}
            <div class="mt-2">
              <textarea 
                bind:value={dataPoint.acceptance_reason} 
                placeholder="Enter acceptance reason..." 
                class="w-full p-2 border rounded mb-2"
              ></textarea>
              <button 
                on:click={() => updateDataPointStatus(dataPoint.id, 'Accepted')} 
                class="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600"
              >
                Accept
              </button>
              
              <textarea 
                bind:value={dataPoint.rejection_reason} 
                placeholder="Enter rejection reason..." 
                class="w-full p-2 border rounded mb-2 mt-2"
              ></textarea>
              <button 
                on:click={() => updateDataPointStatus(dataPoint.id, 'Declined')} 
                class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Decline
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>