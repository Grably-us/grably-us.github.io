<script>
  import { onMount } from 'svelte';
  import { pb } from '../services/pocketbase';
  import ContractCard from '../components/ContractCard.svelte';

  let contracts = [];
  let loading = true;
  let error = null;
  let isAdmin = false;

  onMount(async () => {
    isAdmin = pb.authStore.model?.role === 'Admin';

    try {
      const records = await pb.collection('Contract').getList(1, 50, {
        sort: '-created',
        expand: 'creator'
      });
      contracts = records.items;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
</script>

<div class="container mx-auto px-4">
  <h1 class="text-3xl font-bold mb-6">Available Tasks:</h1>

  {#if loading}
    <p class="text-center">Loading contracts...</p>
  {:else if error}
    <p class="text-red-500 text-center">{error}</p>
  {:else if contracts.length === 0}
    <p class="text-center">No tasks found.</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each contracts as contract (contract.id)}
        <ContractCard 
          {contract} 
        />
      {/each}
    </div>
  {/if}
</div>