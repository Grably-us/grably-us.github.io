<script>
    import { pb } from '../services/pocketbase';
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
  
    export let id; // Contract ID passed as a parameter
  
    let contract = null;
    let fileInput;
    let uploadStatus = '';
    let progress = 0;
    let uploadErrors = [];
    let dataBatches = [];
    let totalFilesUploaded = 0;
    let userFilesUploaded = 0;
    let largestFileSize = 0;
    let totalDataSize = 0;
  
    onMount(async () => {
      try {
        contract = await pb.collection('Contract').getOne(id, {
          expand: 'creator,DataBatch_via_contract.DataPoint_via_batch'
        });
        if (contract.expand['DataBatch_via_contract']) {
          dataBatches = contract.expand['DataBatch_via_contract'];
          calculateStats();
        }
      } catch (error) {
        console.error('Error fetching contract:', error);
      }
    });
  
    function calculateStats() {
      totalFilesUploaded = 0;
      userFilesUploaded = 0;
      largestFileSize = 0;
      totalDataSize = 0;
  
      dataBatches.forEach(batch => {
        if (batch.expand['DataPoint_via_batch']) {
          batch.expand['DataPoint_via_batch'].forEach(dataPoint => {
            totalFilesUploaded++;
            if (dataPoint.owner === pb.authStore.model.id) {
              userFilesUploaded++;
            }
            const fileSize = dataPoint.data ? dataPoint.data.size : 0;
            largestFileSize = Math.max(largestFileSize, fileSize);
            totalDataSize += fileSize;
          });
        }
      });
    }
  
    async function handleFileUpload() {
      // ... (existing handleFileUpload code) ...
  
      // After successful upload, recalculate stats
      calculateStats();
    }
  
    function formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    }
  
    function getThumbnailUrl(contract) {
      if (contract.thumbnail) {
        return pb.files.getUrl(contract, contract.thumbnail);
      }
      return 'my-grably-app/public/icon.webp';
    }
  
    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  
    $: progressPercentage = (totalFilesUploaded / contract?.amount_requested) * 100 || 0;
    $: remainingFiles = contract?.amount_requested - totalFilesUploaded || 0;
  </script>
  
  <div class="container mx-auto px-4 py-8">
    {#if contract}
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
        <p class="mb-2"><strong>Creator:</strong> {contract.expand.creator.name}</p>
        
        <div class="mt-6">
          <h2 class="text-xl font-semibold mb-4">Contract Progress</h2>
          <div class="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div class="bg-blue-600 h-4 rounded-full" style="width: {progressPercentage}%"></div>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            {totalFilesUploaded} / {contract.amount_requested} files uploaded ({progressPercentage.toFixed(2)}%)
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
            <div class="bg-gray-100 p-4 rounded-lg">
              <h3 class="font-semibold mb-2">Largest File</h3>
              <p>{formatFileSize(largestFileSize)}</p>
            </div>
            <div class="bg-gray-100 p-4 rounded-lg">
              <h3 class="font-semibold mb-2">Total Data Size</h3>
              <p>{formatFileSize(totalDataSize)}</p>
            </div>
          </div>
  
          <h2 class="text-xl font-semibold mb-4">Upload Files</h2>
          <input type="file" multiple bind:this={fileInput} accept=".txt,.jpg,.mp4,.mp3,.wav" class="mb-4">
          <button on:click={handleFileUpload} class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Upload Files
          </button>
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
              <li class="border-b pb-4">
                <p><strong>Batch ID:</strong> {batch.id}</p>
                <p><strong>Status:</strong> {batch.status}</p>
                <p><strong>Description:</strong> {batch.description}</p>
                <p><strong>Created:</strong> {formatDate(batch.created)}</p>
                <p><strong>Files in Batch:</strong> {batch.expand['DataPoint_via_batch']?.length || 0}</p>
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