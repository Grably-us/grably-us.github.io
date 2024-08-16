<script>
    import { pb } from '../services/pocketbase';
    import { createEventDispatcher } from 'svelte';
    import { Link } from 'svelte-routing';
  
    export let contract;
  
    let expanded = false;
    let userRole = pb.authStore.model?.role || '';
  
    const dispatch = createEventDispatcher();
  
    function toggleExpand() {
      expanded = !expanded;
    }
  
    function handleKeyDown(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        toggleExpand();
      }
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
  
    $: progressPercentage = (contract.total_collected / contract.amount_requested) * 100 || 0;
  </script>
  
  <div 
    class="bg-white shadow-md rounded-lg p-4 cursor-pointer" 
    on:click={toggleExpand}
    on:keydown={handleKeyDown}
    tabindex="0"
    role="button"
    aria-expanded={expanded}
  >
    <div class="flex items-start">
      <img 
        src={getThumbnailUrl(contract)} 
        alt="Contract thumbnail" 
        class="w-20 h-20 object-cover rounded mr-4"
      />
      <div class="flex-grow">
        <h2 class="text-xl font-semibold mb-2">{contract.title}</h2>
        <p class="text-gray-600 mb-2">{contract.status}</p>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-blue-600 h-2.5 rounded-full" style="width: {progressPercentage}%"></div>
        </div>
        <p class="text-sm text-gray-500 mt-1">Progress: ${contract.total_collected || 0} / ${contract.amount_requested}</p>
      </div>
    </div>
    
    {#if expanded}
      <div class="mt-4">
        <p class="mb-2">{@html contract.description}</p>
        <p class="mb-2">Deadline: {formatDate(contract.deadline)}</p>
        <p class="mb-2">Price Per Point: ${contract.price_per_point}</p>
        <Link to={`/contract/${contract.id}`} class="text-blue-500 hover:underline">View Details</Link>
      </div>
    {/if}
  </div>