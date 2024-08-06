<script>
  import { createEventDispatcher } from 'svelte';
  import { pb } from '../services/pocketbase';

  export let user;
  export let walletBalance;

  const dispatch = createEventDispatcher();

  let editMode = false;
  let editedUser = { ...user };
  let error = '';

  function close() {
    dispatch('close');
  }

  async function logout() {
    pb.authStore.clear();
    window.location.href = '/login';
  }

  function toggleEditMode() {
    editMode = !editMode;
    if (!editMode) {
      editedUser = { ...user };
    }
  }

  async function saveChanges() {
    try {
      const updatedUser = await pb.collection('users').update(user.id, editedUser);
      user = updatedUser;
      editMode = false;
      error = '';
    } catch (e) {
      error = e.message;
    }
  }

  function getAvatarUrl(user) {
    if (user.avatar) {
      return pb.files.getUrl(user, user.avatar);
    }
    return `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>')}`;
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg p-8 max-w-md w-full">
    <h2 class="text-2xl font-bold mb-4">User Profile</h2>
    {#if error}
      <p class="text-red-500 mb-4">{error}</p>
    {/if}
    <div class="flex items-center mb-4">
      <img 
        src={getAvatarUrl(user)} 
        alt="User avatar" 
        class="w-20 h-20 rounded-full mr-4 bg-gray-200"
      />
      <div>
        {#if editMode}
          <input bind:value={editedUser.name} class="font-semibold text-xl mb-2 border rounded p-1" />
          <input bind:value={editedUser.email} class="text-gray-600 border rounded p-1" />
        {:else}
          <p class="font-semibold text-xl">{user.name}</p>
          <p class="text-gray-600">{user.email}</p>
        {/if}
      </div>
    </div>
    <p class="mb-4">Role: {user.role}</p>
    <p class="mb-4">Wallet Balance: ${walletBalance.toFixed(2)}</p>
    
    {#if editMode}
    <div class="mb-4">
      <label for="phone" class="block mb-2">Phone</label>
      <input id="phone" bind:value={editedUser.phone} type="tel" class="w-full border rounded p-2" />
    </div>
    <div class="mb-4">
      <label for="agreed_policy" class="inline-flex items-center">
        <input id="agreed_policy" bind:checked={editedUser.agreed_policy} type="checkbox" class="mr-2" />
        <span>Agreed to Policy</span>
      </label>
    </div>
    <div class="mb-4">
      <label for="agreed_terms" class="inline-flex items-center">
        <input id="agreed_terms" bind:checked={editedUser.agreed_terms} type="checkbox" class="mr-2" />
        <span>Agreed to Terms</span>
      </label>
    </div>
  {/if}

    {#if editMode}
      <button 
        on:click={saveChanges}
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
      >
        Save Changes
      </button>
    {:else}
      <button 
        on:click={toggleEditMode}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
      >
        Edit Profile
      </button>
    {/if}
    
    <button 
      on:click={logout}
      class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-2"
    >
      Logout
    </button>
    <button 
      on:click={close}
      class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
    >
      Close
    </button>
  </div>
</div>