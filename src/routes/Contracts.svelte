<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { pb } from '../services/pocketbase';
  import ContractCard from '../components/ContractCard.svelte';

  let contracts = [];
  let loading = true;
  let error = null;
  let userRole = '';

  onMount(async () => {
    if (!pb.authStore.isValid) {
      navigate('/login');
      return;
    }
    
    userRole = pb.authStore.model.role;
    
    try {
      let filter = userRole === 'Admin' ? '' : 'status = "Active"';
      const records = await pb.collection('Contract').getList(1, 50, {
        sort: '-created',
        expand: 'creator',
        filter: filter
      });
      contracts = records.items;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  function handleContractClick(event) {
    const contractId = event.detail.contractId;
    navigate(`/contract/${contractId}`);
  }
</script>

<div class="container mx-auto px-4">
  <h1 class="text-3xl font-bold mb-6">
    {userRole === 'Admin' ? 'All Contracts:' : 'Available Tasks:'}
  </h1>

  {#if loading}
    <p class="text-center">Loading contracts...</p>
  {:else if error}
    <p class="text-red-500 text-center">{error}</p>
  {:else if contracts.length === 0}
    <p class="text-center">No {userRole === 'Admin' ? '' : 'active'} contracts found.</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each contracts as contract (contract.id)}
        <ContractCard {contract} {userRole} on:select={handleContractClick} />
      {/each}
    </div>
  {/if}
</div>