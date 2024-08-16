<script>
  import { pb } from '../services/pocketbase';
  import { onMount } from 'svelte';

  export let id; // Contract ID passed as a parameter

  let contract = null;
  let fileInput;
  let uploadStatus = '';
  let progress = 0;
  let uploadErrors = [];
  let dataBatches = [];
  let totalFilesUploaded = 0;
  let userFilesUploaded = 0;
  let editMode = false;
  let editedContract = {};
  let newThumbnail = null;
  let error = null;
  let individualContribution = 0;
  let totalContribution = 0;

  onMount(async () => {
    await loadContract();
  });

  async function loadContract() {
    try {
      contract = await pb.collection('Contract').getOne(id, {
        expand: 'creator,DataBatch_via_contract.DataPoint_via_batch'
      });

      editedContract = { ...contract };

      if (contract.expand && contract.expand['DataBatch_via_contract']) {
        dataBatches = contract.expand['DataBatch_via_contract'];
      } else {
        dataBatches = [];
      }

      calculateStats();
    } catch (err) {
      error = `Error fetching contract: ${err.message}`;
    }
  }
  
  function calculateStats() {
    totalFilesUploaded = 0;
    userFilesUploaded = 0;
    individualContribution = 0;
    totalContribution = 0;

    if (dataBatches.length > 0) {
      dataBatches.forEach(batch => {
        if (batch.expand && batch.expand['DataPoint_via_batch']) {
          const dataPoints = batch.expand['DataPoint_via_batch'];
          dataPoints.forEach(dataPoint => {
            totalFilesUploaded++;
            totalContribution++;
            if (dataPoint.owner === pb.authStore.model.id) {
              userFilesUploaded++;
              individualContribution++;
            }
          });
        }
      });
    }
  }
  
  async function handleFileUpload() {
    const files = fileInput.files;
    if (!files || files.length === 0) {
      uploadStatus = 'No files selected';
      return;
    }

    uploadStatus = 'Uploading...';
    progress = 0;
    uploadErrors = [];

    try {
      // Create a new DataBatch
      const batch = await pb.collection('DataBatch').create({
        owner: pb.authStore.model.id,
        status: 'pending',
        description: 'Uploaded batch',
        comment: '',
        contract: id
      });

      const dataPoints = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('data', file);
        formData.append('owner', pb.authStore.model.id);
        formData.append('batch', batch.id);
        formData.append('status', 'Pending');
        formData.append('description', `File ${i + 1}: ${file.name}`);
        formData.append('tags', JSON.stringify([file.type])); // Add file type as a tag
        formData.append('comment', '');
        formData.append('rejection_reason', '');

        try {
          const createdDataPoint = await pb.collection('DataPoint').create(formData);
          dataPoints.push(createdDataPoint);
          progress = ((i + 1) / files.length) * 100;
        } catch (error) {
          uploadErrors.push(`Error uploading ${file.name}: ${error.message}`);
        }
      }

      // Update the batch with the created data points
      await pb.collection('DataBatch').update(batch.id, {
        data_points: dataPoints.map(dp => dp.id)
      });

      uploadStatus = 'Upload completed';
      // Refresh the contract data to show the new uploads
      await loadContract();
    } catch (error) {
      uploadStatus = 'Upload failed';
      alert(`Error during upload: ${error.message}`);
    }
  }
  
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }
  
  function getThumbnailUrl(contract) {
    if (contract?.thumbnail) {
      return pb.files.getUrl(contract, contract.thumbnail);
    }
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="#f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="#999" dominant-baseline="middle" text-anchor="middle">No Image</text></svg>');
  }
  
  function getStatusColor(status) {
    switch (status) {
      case 'accepted': return 'bg-green-100';
      case 'rejected': return 'bg-red-100';
      case 'partially_accepted': return 'bg-yellow-100';
      case 'pending':
      default: return 'bg-gray-100';
    }
  }

  $: progressPercentage = (totalContribution / (contract?.amount_requested || 1)) * 100 || 0;
  $: individualProgressPercentage = (individualContribution / (contract?.amount_requested || 1)) * 100 || 0;
  $: remainingFiles = (contract?.amount_requested || 0) - totalFilesUploaded;
</script>

<div class="container mx-auto px-4 py-8">
  {#if error}
    <p class="text-red-500">{error}</p>
  {:else if contract}
    <div class="flex items-center mb-6">
      <img 
        src={getThumbnailUrl(contract)} 
        alt="Contract thumbnail" 
        class="w-24 h-24 object-cover rounded-full mr-4"
      />
      <h1 class="text-3xl font-bold">{contract.title}</h1>
    </div>
    
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <p class="mb-4">{@html contract.description}</p>
      <p class="mb-2"><strong>Status:</strong> {contract.status}</p>
      <p class="mb-2"><strong>Deadline:</strong> {formatDate(contract.deadline)}</p>
      <p class="mb-2"><strong>Amount Requested:</strong> ${contract.amount_requested}</p>
      <p class="mb-2"><strong>Price Per Point:</strong> ${contract.price_per_point}</p>
      <p class="mb-2"><strong>Creator:</strong> {contract.expand?.creator?.name || 'Unknown'}</p>
      
      <div class="mt-6">
        <h2 class="text-xl font-semibold mb-4">Contract Progress</h2>
        <div class="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div class="bg-blue-600 h-4 rounded-full" style="width: {individualProgressPercentage}%"></div>
          <div class="bg-green-400 h-4 rounded-full" style="width: {progressPercentage - individualProgressPercentage}%; margin-top: -1rem;"></div>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          Your contribution: {individualContribution} files ({individualProgressPercentage.toFixed(2)}%)
          <br>
          Total progress: {totalContribution} / {contract.amount_requested} files ({progressPercentage.toFixed(2)}%)
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-gray-100 p-4 rounded-lg">
            <h3 class="font-semibold mb-2">Your Contributions</h3>
            <p>{userFilesUploaded} files uploaded</p>
          </div>
          <div class="bg-gray-100 p-4 rounded-lg">
            <h3 class="font-semibold mb-2">Remaining</h3>
            <p>{remainingFiles} files needed</p>
          </div>
        </div>

        {#if pb.authStore.model?.role === 'DataProvider' || pb.authStore.model?.role === 'Admin'}
        <h2 class="text-xl font-semibold mb-4">Upload Files</h2>
        <input 
          type="file" 
          multiple 
          bind:this={fileInput} 
          accept=".wav,.mp3,.mp4,.png,.heic,.jpg,.jpeg"
          class="mb-4"
        >
        <button on:click={handleFileUpload} class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Upload Files
        </button>
      {/if}
        {#if uploadStatus}
          <p class="mt-2 {uploadStatus.includes('failed') ? 'text-red-500' : 'text-green-500'}">
            {uploadStatus}
          </p>
        {/if}
        {#if progress > 0}
          <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div class="bg-blue-600 h-2.5 rounded-full" style="width: {progress}%"></div>
          </div>
        {/if}
        {#if uploadErrors.length > 0}
          <div class="mt-4">
            <h3 class="text-lg font-semibold mb-2">Upload Errors:</h3>
            <ul class="list-disc pl-5">
              {#each uploadErrors as error}
                <li class="text-red-500">{error}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Uploaded Batches</h2>
      {#if dataBatches.length > 0}
        <ul class="space-y-4">
          {#each dataBatches as batch}
            <li class="border-b pb-4 {getStatusColor(batch.status)}">
              <p><strong>Batch ID:</strong> {batch.id}</p>
              <p><strong>Status:</strong> {batch.status}</p>
              <p><strong>Description:</strong> {batch.description}</p>
              <p><strong>Created:</strong> {formatDate(batch.created)}</p>
              <p><strong>Files in Batch:</strong> {batch.expand?.['DataPoint_via_batch']?.length || 0}</p>
              {#if batch.status === 'rejected' && batch.rejection_reason}
                <p class="text-red-600"><strong>Rejection Reason:</strong> {batch.rejection_reason}</p>
              {/if}
            </li>
          {/each}
        </ul>
      {:else}
        <p>No data batches uploaded yet.</p>
      {/if}
    </div>
  {:else}
    <p>Loading contract details...</p>
  {/if}
</div>