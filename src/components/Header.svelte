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
    loading = true;
    if (pb.authStore.isValid) {
      try {
        const userId = pb.authStore.model.id;
        const wallet = await ensureWalletExists(userId);
        walletBalance = wallet.token_balance;
        user = pb.authStore.model;
        userRole = user.role;
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

  function getRoleLabel(role) {
    switch (role) {
      case 'DataProvider':
        return 'Data Provider';
      case 'Customer':
        return 'Customer';
      case 'Admin':
        return 'Administrator';
      default:
        return role;
    }
  }

  function getRoleBorderColor(role) {
    switch (role) {
      case 'DataProvider':
        return 'border-green-500';
      case 'Customer':
        return 'border-blue-500';
      case 'Admin':
        return 'border-red-500';
      default:
        return 'border-gray-500';
    }
  }

  function toggleProfile() {
    showProfile = !showProfile;
  }

  function getAvatarUrl(user) {
    if (user?.avatar) {
      return pb.files.getUrl(user, user.avatar);
    }
    const hash = encodeURIComponent(user.id || user.email || 'default');
    return `https://api.dicebear.com/6.x/identicon/svg?seed=${hash}`;
  }
</script>

{#if loading}
  <header class="fixed top-0 left-0 right-0 bg-white shadow-md text-gray-800 p-4 z-10" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); height: 72px;">
    <div class="container mx-auto flex justify-between items-center h-full">
      <div class="flex items-center">
        <!-- Placeholder for logo -->
        <div class="w-28 h-10 bg-gray-200 rounded"></div>
      </div>
      <div class="flex items-center space-x-6">
        <!-- Placeholder for buttons -->
        <div class="w-24 h-8 bg-gray-200 rounded"></div>
        <div class="w-24 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  </header>
{:else}
<header class="fixed top-0 left-0 right-0 bg-white shadow-md text-gray-800 p-4 z-10" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); height: 72px;">
  <div class="container mx-auto flex justify-between items-center h-full">
    <div class="flex items-center">
      {#if userRole !== 'DataProvider'}
      <a href="/" use:link class="flex-shrink-0 mr-6">
        <img 
          class="t228__imglogo t228__imglogomobile" 
          src="https://static.tildacdn.one/tild3863-3133-4538-a263-356134623965/Group_29.svg" 
          style="max-width: 110px; width: 110px; min-width: 110px; height: auto; display: block;" 
          alt="GRABLY LOGO"
        >
      </a>
      {:else}
      <img 
        class="t228__imglogo t228__imglogomobile" 
        src="https://static.tildacdn.one/tild3863-3133-4538-a263-356134623965/Group_29.svg" 
        style="max-width: 110px; width: 110px; min-width: 110px; height: auto; display: block;" 
        alt="GRABLY LOGO"
      >
      {/if}
      <a href="/contracts" use:link class="nav-button ml-1">
        Available Tasks
      </a>
    </div>
    
    <div class="flex items-center space-x-6">
      {#if userRole !== 'DataProvider'}
        <a
          href="/new-contract"
          use:link
          class="nav-button"
          class:active={segment === 'new-contract'}
        >
          Post a Request
        </a>
      {/if}
      {#if userRole === 'Admin'}
        <a
          href="/tasks"
          use:link
          class="nav-button"
          class:active={segment === 'tasks'}
        >
          Manage Tasks
        </a>
      {/if}
      
      <div class="profile-button-container">
        {#if error}
          <p class="text-red-500">{error}</p>
        {:else if user}
          <button
            type="button"
            class="profile-button {getRoleBorderColor(user.role)}"
            on:click={toggleProfile}
          >
            <img
              src={getAvatarUrl(user)}
              alt="User avatar"
              class="w-8 h-8 rounded-full"
            />
            <div class="text-left mx-2">
              <p class="font-semibold text-sm">{user.name || 'User'}</p>
              <p class="text-xs text-gray-600 flex items-center">
                <img src="/grably-icon.png" alt="Grably icon" class="inline-block w-4 h-4 mr-1" />
                {Math.floor(walletBalance)}
              </p>
            </div>
            <span class="text-xs bg-gray-200 px-2 py-1 rounded-full">{getRoleLabel(user.role)}</span>
          </button>
        {/if}
      </div>
    </div>
  </div>
</header>
{/if}

{#if showProfile}
  <div transition:fade>
    <Profile {user} {walletBalance} on:close={() => showProfile = false} />
  </div>
{/if}

<style>
  .nav-button {
    display: inline-block;
    padding: 0.5rem 1rem;
    color: #000;
    background-color: #ffffff;
    border-radius: 0.975rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s ease-in-out;
    box-shadow: inset 5px 5px 10px rgba(0, 0, 0, 0.1), inset -5px -5px 10px rgba(255, 255, 255, 0.5);
  }

  .nav-button:hover {
    background-color: #e5e7eb;
  }

  .nav-button.active {
    background-color: #e5e7eb;
    font-weight: 600;
  }

  .profile-button-container {
    width: 240px; /* Adjust this value based on your actual profile button width */
  }

  .profile-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background-color: #ffffff;
    border-radius: 0.975rem;
    font-weight: 500;
    transition: all 0.3s ease-in-out;
    box-shadow: inset 5px 5px 10px rgba(0, 0, 0, 0.1), inset -5px -5px 10px rgba(255, 255, 255, 0.5);
    width: 100%;
    height: 48px; /* Set a fixed height */
  }

  .profile-button:hover {
    background-color: #e5e7eb;
  }

  .skeleton {
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>