<script>
  import { pb } from '../services/pocketbase';
  import { onMount } from 'svelte';
  import { navigate, Link } from 'svelte-routing';
  import MarkdownRenderer from '../components/MarkdownRenderer.svelte';

  export let id;
  
  let contract = null;
  let fileInput;
  let uploadStatus = '';
  let progress = 0;
  let uploadErrors = [];
  let dataBatches = [];
  let totalFilesUploaded = 0;
  let userFilesUploaded = 0;
  let error = null;
  let individualContribution = 0;
  let totalContribution = 0;
  let isContractCreator = false;
  let userRole = '';
  let showDeleteConfirmation = false;

  onMount(async () => {
    userRole = pb.authStore.model.role;
    await loadContract();
  });

  async function loadContract() {
    try {
      contract = await pb.collection('Contract').getOne(id, {
        expand: 'creator,DataBatch_via_contract.DataPoint_via_batch'
      });

      isContractCreator = contract.creator === pb.authStore.model.id;

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

  async function approveContract() {
    try {
      await pb.collection('Contract').update(id, { status: 'Active' });
      contract.status = 'Active';
    } catch (err) {
      error = `Error approving contract: ${err.message}`;
    }
  }
  
  function calculateStats() {

    totalFilesUploaded = 0;
    userFilesUploaded = 0;
    individualContribution = 0;
    totalContribution = contract.total_collected || 0;

    if (dataBatches.length > 0) {
      dataBatches.forEach((batch, index) => {

        if (batch.expand && batch.expand['DataPoint_via_batch']) {
          const dataPoints = batch.expand['DataPoint_via_batch'];

          dataPoints.forEach(dataPoint => {

            totalFilesUploaded++;
            if (dataPoint.owner === pb.authStore.model.id) {
              userFilesUploaded++;
              individualContribution++;

            }
          });
        } else {
          console.log(`Batch has no data points`);
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
        formData.append('contract', id);  // Add this line to include the contract ID

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

  function confirmDelete() {
    showDeleteConfirmation = true;
  }

  async function deleteContract() {
    try {
      await pb.collection('Contract').delete(id);
      navigate('/contracts');
    } catch (e) {
      console.error('Error deleting contract:', e);
      error = e.message;
    }
  }

  $: progressPercentage = (totalContribution / (contract?.amount_requested || 1)) * 100 || 0;
  $: individualProgressPercentage = (individualContribution / (contract?.amount_requested || 1)) * 100 || 0;
  $: remainingFiles = Math.max(0, (contract?.amount_requested || 0) - totalFilesUploaded);
</script>

<div class="container mx-auto px-4 py-8">
  {#if error}
    <p class="text-red-500">{error}</p>
  {:else if contract}
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <Link to="/contracts" class="mr-4">
          <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="white" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
        </Link>
        <img 
          src={getThumbnailUrl(contract)} 
          alt="Contract thumbnail" 
          class="w-24 h-24 object-cover rounded-full ml-4"
        />
        <h1 class="text-3xl font-bold ml-4">{contract.title}</h1>
      </div>
      {#if userRole === 'Admin' || isContractCreator}
        <button 
          on:click={confirmDelete}
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete Contract
        </button>
      {/if}
    </div>
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <MarkdownRenderer htmlContent={contract.description} />
      <p class="mb-2"><strong>Status:</strong> Active</p>
      <p class="mb-2"><strong>Deadline:</strong> {formatDate(contract.deadline)}</p>
      <p class="mb-2 flex items-center">
        <strong>Amount Requested:</strong> 
        {contract.amount_requested}
      </p>
      <p class="mb-2 flex items-center">
        <strong>Accepted Data Types:</strong> 
        {contract.accepted_data_types}
      </p>
      <p class="mb-2 flex items-center">
        <strong>Price Per Point:</strong> 
        <img src="/grably-icon.png" alt="Grably icon" class="inline-block w-4 h-4 mx-1" />
        {contract.price_per_point}
      </p>
      <p class="mb-2"><strong>Creator:</strong> {contract.expand?.creator?.name || 'Unknown'}</p>
      {#if userRole === 'Admin' && contract.status !== 'Active'}
      <button 
        on:click={approveContract}
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
      >
        Approve Contract
      </button>
    {/if}
    <div class="mt-6">
      <h2 class="text-xl font-semibold mb-4">Contract Progress</h2>
      <div class="w-full bg-gray-200 rounded-full h-8 mb-2 overflow-hidden">
        <div class="bg-green-400 h-8 rounded-full relative" style="width: {progressPercentage}%">
          <div class="absolute top-0 left-0 bg-blue-600 h-8 striped-progress" style="width: {(individualProgressPercentage / progressPercentage) * 100}%"></div>
        </div>
      </div>
      <div class="flex justify-between text-sm text-gray-600 mb-4">
        <span>Your contribution: {individualContribution} files ({individualProgressPercentage.toFixed(2)}%)</span>
        <span>Total progress: {totalContribution} / {contract.amount_requested} files ({progressPercentage.toFixed(2)}%)</span>
      </div>
      
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

    {#if isContractCreator}
      <div class="bg-white shadow-md rounded-lg p-6 mt-6">
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
                <Link to={`/batch/${batch.id}`} class="text-blue-500 hover:underline">
                  Review Batch
                </Link>
              </li>
            {/each}
          </ul>
        {:else}
          <p>No data batches uploaded yet.</p>
        {/if}
      </div>
    {/if}

    {#if showDeleteConfirmation}
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="delete-modal">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3 text-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Confirmation</h3>
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete this contract? This action cannot be undone and all associated data will be permanently deleted.
              </p>
            </div>
            <div class="items-center px-4 py-3">
              <button
                id="delete-btn"
                class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 mb-2"
                on:click={deleteContract}
              >
                Delete
              </button>
              <button
                id="cancel-btn"
                class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                on:click={() => showDeleteConfirmation = false}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  {:else}
    <p>Loading contract details...</p>
  {/if}
</div>


<style>
  @keyframes moveStripes {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 50px 50px;
    }
  }

  .striped-progress {
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent 100%
    );
    background-size: 50px 50px;
    animation: moveStripes 2s linear infinite;
  }
</style>