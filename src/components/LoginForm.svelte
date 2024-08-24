<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { pb } from '../services/pocketbase';
  import RoleSelectionModal from './RoleSelectionModal.svelte';
  
  let email = '';
  let password = '';
  let error = '';
  let resendMessage = '';
  let showRoleModal = false;
  let oAuthProvider = '';
  let oAuthData = null;
  
  export let onLoginSuccess; 
  export let onLoginError;
  
  onMount(() => {
    initOAuthProviders();
    checkOAuthRedirect();
  });
  
  function initOAuthProviders() {
    const googleBtn = document.getElementById('googleAuth');
    const githubBtn = document.getElementById('githubAuth');
  
    googleBtn.addEventListener('click', () => authWithOAuth('google'));
    githubBtn.addEventListener('click', () => authWithOAuth('github'));
  }
  
  async function authWithOAuth(provider) {
    try {
      oAuthProvider = provider;
      const authData = await pb.collection('users').authWithOAuth2({ provider });
      handleOAuthResponse(authData);
    } catch (err) {
      console.error('OAuth error:', err);
      error = `OAuth login failed: ${err.message}`;
      onLoginError(error);
    }
  }
  
  function checkOAuthRedirect() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('provider')) {
      oAuthProvider = params.get('provider');
      pb.collection('users').authWithOAuth2Code(
        oAuthProvider,
        params.get('code'),
        params.get('state'),
        params.get('codeVerifier'),
        window.location.origin + '/login'
      )
      .then(result => handleOAuthResponse(result))
      .catch(err => {
        console.error('OAuth redirect error:', err);
        error = `OAuth login failed: ${err.message}`;
        onLoginError(error);
      });
    }
  }
  
  function handleOAuthResponse(authData) {
    if (authData.record.role) {
      // User already has a role, proceed with login
      onLoginSuccess(authData.record);
    } else {
      // New user, show role selection modal
      oAuthData = authData;
      showRoleModal = true;
    }
  }
  
  async function handleRoleSelection(selectedRole) {
    try {
      const updatedUser = await pb.collection('users').update(oAuthData.record.id, {
        role: selectedRole
      });
      onLoginSuccess(updatedUser);
    } catch (err) {
      console.error('Role update error:', err);
      error = `Failed to update user role: ${err.message}`;
      onLoginError(error);
    }
  }
  
  async function login() {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      if (authData) {
        if (!authData.record.verified) {
          error = "Please verify your email before logging in.";
          // Offer to resend verification email
          resendMessage = "Didn't receive the email? Click here to resend.";
        } else {
          onLoginSuccess(authData.record); 
        }
      }
    } catch (userError) {
      error = userError.message;
      onLoginError(error);
    }
  }
  
  async function resendVerification() {
    try {
      await pb.collection('users').requestVerification(email);
      resendMessage = 'Verification email sent. Please check your inbox.';
      navigate('/check-email');
    } catch (err) {
      resendMessage = `Error: ${err.message}`;
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
  
  {#if error}
    <p class="text-red-500 mb-2">{error}</p>
  {/if}
  
  {#if resendMessage}
    <p class="mb-2">{resendMessage}</p>
    <button on:click={resendVerification} class="text-blue-500 underline">Resend verification email</button>
  {/if}
  
  <div class="flex flex-col space-y-2 mt-4">
    <button id="googleAuth" class="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600">
      Login with Google
    </button>
    <button id="githubAuth" class="w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-900">
      Login with GitHub
    </button>
  </div>
  
  {#if showRoleModal}
    <RoleSelectionModal on:selectRole={event => handleRoleSelection(event.detail)} />
  {/if}