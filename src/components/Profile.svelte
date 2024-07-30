<script>
    import { createEventDispatcher } from 'svelte';
    import { pb } from '../services/pocketbase';
  
    export let user;
    export let walletBalance;
    import { FaSignOutAlt } from 'svelte-icons/fa';
    const dispatch = createEventDispatcher();
  
    function close() {
      dispatch('close');
    }
  
    async function logout() {
      pb.authStore.clear();
      window.location.href = '/login';
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
      <div class="flex items-center mb-4">
        <img 
          src={getAvatarUrl(user)} 
          alt="User avatar" 
          class="w-20 h-20 rounded-full mr-4 bg-gray-200"
        />
        <div>
          <p class="font-semibold text-xl">{user.name}</p>
          <p class="text-gray-600">{user.email}</p>
        </div>
      </div>
      <p class="mb-4">Role: {user.role}</p>
      <p class="mb-4">Wallet Balance: ${walletBalance.toFixed(2)}</p>
      <FaSignOutAlt />
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