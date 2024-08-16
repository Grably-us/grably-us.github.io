<script>
  import { pb } from '../services/pocketbase';
  import { createEventDispatcher, onMount } from 'svelte';

  export let contract;
  const dispatch = createEventDispatcher();

  let progressPercentage = 0;

  onMount(() => {
    calculateProgressPercentage();
  });

  $: if (contract) {
    calculateProgressPercentage();
  }

  function calculateProgressPercentage() {
    progressPercentage = (contract.total_collected / contract.amount_requested) * 100 || 0;
  }

  function getThumbnailUrl(contract) {
    if (contract?.thumbnail) {
      return pb.files.getUrl(contract, contract.thumbnail);
    }
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="#f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="#999" dominant-baseline="middle" text-anchor="middle">No Image</text></svg>');
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }

  function handleInteraction() {
    dispatch('select', { contractId: contract.id });
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleInteraction();
    }
  }
</script>

<div 
  class="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300"
  on:click={handleInteraction}
  on:keydown={handleKeyDown}
  role="button"
  tabindex="0"
  aria-label="View details for contract: {contract.title}"
>
  <div class="flex items-start">
    <img 
      src={getThumbnailUrl(contract)} 
      alt=""
      class="w-16 h-16 object-cover rounded-lg mr-4"
    />
    <div class="flex-grow">
      <h2 class="text-lg font-bold mb-1">{contract.title}</h2>
      <p class="text-sm font-semibold mb-1">Active</p>
      <div class="w-full bg-gray-200 rounded-full h-2 mb-1">
        <div class="bg-blue-600 h-2 rounded-full" style="width: {progressPercentage}%"></div>
      </div>
      <p class="text-xs text-gray-600">Progress: {contract.total_collected} / {contract.amount_requested}</p>
    </div>
  </div>
  
  <div class="mt-3">
    <p class="text-sm font-bold">Deadline: {formatDate(contract.deadline)}</p>
    <p class="text-sm">
      <span class="font-bold">You make:</span> 
      <img src="/grably-icon.png" alt="Grably icon" class="inline-block w-4 h-4 mx-1" />
      <span class="text-blue-600 font-bold">{contract.price_per_point}</span> per Data Point
    </p>
  </div>
</div>