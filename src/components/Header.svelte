<script>
  import { pb } from '../services/pocketbase';
  import { onMount } from 'svelte';
  import Profile from './Profile.svelte';

  let user = null;
  let walletBalance = 0;
  let showProfile = false;
  let loading = true;
  let authStoreModel = null;

  onMount(async () => {
    if (pb.authStore.isValid) {
      user = pb.authStore.model;
      authStoreModel = JSON.parse(JSON.stringify(pb.authStore.model)); // Deep copy for debugging
      if (user.wallet) {
        try {
          const wallet = await pb.collection('Wallet').getOne(user.wallet);
          walletBalance = wallet.token_balance;
        } catch (error) {
          console.error('Error fetching wallet:', error);
        }
      }
    }
    loading = false;
    console.log('Auth Store Model:', authStoreModel);
  });

  function toggleProfile() {
    showProfile = !showProfile;
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      toggleProfile();
    }
  }

  function getAvatarUrl(user) {
    if (user?.avatar) {
      return pb.files.getUrl(user, user.avatar);
    }
    return `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>')}`;
  }
</script>

<header class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-b-lg shadow-lg">
  <div class="container mx-auto flex justify-between items-center">
    <h1 class="text-2xl font-bold">Grably</h1>
    {#if !loading}
      {#if user}
        <div>
          <button
            type="button"
            class="flex items-center cursor-pointer bg-transparent border-none text-white"
            on:click={toggleProfile}
            on:keydown={handleKeyDown}
            aria-haspopup="true"
            aria-expanded={showProfile}
          >
            <img 
              src={getAvatarUrl(user)} 
              alt="User avatar" 
              class="w-10 h-10 rounded-full mr-2 bg-white"
            />
            <div>
              <p class="font-semibold">{user.name || 'User'}</p>
              <p class="text-sm">Balance: ${walletBalance.toFixed(2)}</p>
            </div>
          </button>
        </div>
      {:else}
        <p>Not logged in</p>
      {/if}
    {:else}
      <p>Loading...</p>
    {/if}
  </div>
</header>

{#if showProfile}
  <Profile {user} {walletBalance} on:close={() => showProfile = false} />
{/if}