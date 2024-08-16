<script>
  import { link } from 'svelte-routing';
  import { pb } from '../services/pocketbase';
  import { onMount } from 'svelte';
  import Profile from './Profile.svelte';
  import { fade } from 'svelte/transition';
  import { ensureWalletExists } from '../services/WalletService';

  export let userRole;
  export let segment;
  export let user;
  export let walletBalance = 0;

  let showProfile = false;
  let loading = true;
  let error = null;

  onMount(async () => {
    if (pb.authStore.isValid) {
      try {
        const userId = pb.authStore.model.id;
        const wallet = await ensureWalletExists(userId);
        walletBalance = wallet.token_balance;
        user = pb.authStore.model;
      } catch (err) {
        console.error('Error fetching wallet:', err);
        error = 'Unable to fetch wallet information. Please try refreshing the page.';
      } finally {
        loading = false;
      }
    } else {
      loading = false;
    }
  });

  function toggleProfile() {
    showProfile = !showProfile;
  }

  function handleNewContractAction(event) {
    if (userRole === 'DataProvider') {
      event.preventDefault();
    }
  }

  function getAvatarUrl(user) {
    if (user?.avatar) {
      return pb.files.getUrl(user, user.avatar);
    }
    return `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>')}`;
  }
</script>

<header class="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm text-white p-2 z-10">
  <div class="container mx-auto flex justify-center items-center">
    <h1 class="text-xl font-bold flex-shrink-0">Grably</h1>
    
    <nav class="flex-grow flex justify-between items-center mx-4">
      <a href="/" use:link class="menu-item group" class:active={segment === undefined}>
        <svg viewBox="0 0 24 24" class="icon"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        <span class="tooltip">Home</span>
      </a>
      <a href="/contracts" use:link class="menu-item group" class:active={segment === 'contracts'}>
        <svg viewBox="0 0 24 24" class="icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
        <span class="tooltip">Contracts</span>
      </a>
      <a
        href="/new-contract"
        use:link
        class="menu-item group"
        class:active={segment === 'new-contract'}
        class:disabled={userRole === 'DataProvider'}
        on:click|preventDefault={handleNewContractAction}
      >
        <svg viewBox="0 0 24 24" class="icon"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        <span class="tooltip">New Contract</span>
      </a>
    </nav>
    
    {#if loading}
      <p>Loading...</p>
    {:else if error}
      <p class="text-red-300">{error}</p>
    {:else if user}
      <button
        type="button"
        class="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-3 py-1 hover:bg-opacity-30 transition-colors duration-200 flex-shrink-0"
        on:click={toggleProfile}
      >
        <img
          src={getAvatarUrl(user)}
          alt="User avatar"
          class="w-8 h-8 rounded-full"
        />
        <div class="text-left">
          <p class="font-semibold text-xs">{user.name || 'User'}</p>
          <p class="text-xs opacity-80">Balance: ${walletBalance.toFixed(2)}</p>
        </div>
      </button>
    {/if}
  </div>
</header>

{#if showProfile}
  <div transition:fade>
    <Profile {user} {walletBalance} on:close={() => showProfile = false} />
  </div>
{/if}

<style>
.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.icon {
  width: 32px;
  height: 32px;
  fill: white;
  transition: all 0.3s ease;
}

.menu-item:hover .icon {
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
}

.tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: none;
  white-space: nowrap;
}

.menu-item:hover .tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(-5px);
}

.menu-item.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.active {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>