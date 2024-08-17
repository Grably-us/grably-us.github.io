<script>
  import { navigate } from 'svelte-routing';
  import { pb } from '../services/pocketbase';
  import { onMount, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let email = '';
  let password = '';
  let error = '';
  export let onLoginSuccess; 
  export let onLoginError;

  onMount(() => {
    // Initialize OAuth providers
    initOAuthProviders();
  });

  async function login() {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      if (authData) {
        onLoginSuccess(authData.record); 
      }
    } catch (userError) {
      error = userError.message;
      onLoginError(error);
    }
  }

  function initOAuthProviders() {
    const googleBtn = document.getElementById('googleAuth');
    const githubBtn = document.getElementById('githubAuth');

    googleBtn.addEventListener('click', () => {
      authWithOAuth('google');
    });

    githubBtn.addEventListener('click', () => {
      authWithOAuth('github');
    });
  }

  async function authWithOAuth(provider) {
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider });
      if (authData) {
        onLoginSuccess(authData.record);
      }
    } catch (err) {
      error = `OAuth login failed: ${err.message}`;
      onLoginError(error);
    }
  }
</script>

<h2 class="text-2xl mb-4 font-bold text-center">Login to Grably</h2>
<form on:submit|preventDefault={login}>
  <div class="mb-4">
      <label for="email" class="block mb-2">Email</label>
      <input id="email" bind:value={email} type="text" class="w-full p-2 border rounded" required>
  </div>
  <div class="mb-4">
      <label for="password" class="block mb-2">Password</label>
      <input id="password" bind:value={password} type="password" class="w-full p-2 border rounded" required>
  </div>
  <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-4">Login</button>
</form>

<div class="flex flex-col space-y-2">
  <button id="googleAuth" class="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600">
    Login with Google
  </button>
  <button id="githubAuth" class="w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-900">
    Login with GitHub
  </button>
</div>