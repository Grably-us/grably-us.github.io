<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import LoginForm from '../components/LoginForm.svelte';
  import SignupForm from '../components/SignUpForm.svelte';
  import PasswordResetForm from '../components/PasswordResetForm.svelte';
  import { pb } from '../services/pocketbase';

  let currentView = 'login';
  let error = '';

  function setView(view) {
    currentView = view;
    error = ''; // Clear error when changing views
  }
  
  onMount(() => {
    // Check if user is already logged in
    if (pb.authStore.isValid) {
      redirectBasedOnRole(pb.authStore.model.role);
    }

    // Check for OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const authProvider = urlParams.get('provider');
    if (authProvider) {
      handleOAuthRedirect(authProvider);
    }
  });

  function redirectBasedOnRole(role) {
    if (role === 'DataProvider') {
      navigate('/contracts');
    } else {
      navigate('/');
    }
  }

  function handleLoginSuccess(user) {
    redirectBasedOnRole(user.role);
  }

  function handleLoginError(errorMessage) {
    error = errorMessage;
  }

  async function handleOAuthRedirect(provider) {
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider });
      if (authData) {
        redirectBasedOnRole(authData.record.role);
      }
    } catch (err) {
      console.error('OAuth error:', err);
      error = `OAuth login failed: ${err.message}`;
    }
  }
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
  <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
    <div class="flex justify-center mb-6">
      <img src="/grably-icon.png" alt="Grably Logo" class="w-20 h-20" />
    </div>

    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong class="font-bold">Error: </strong>
        <span class="block sm:inline">{error}</span>
      </div>
    {/if}

    {#if currentView === 'login'}
      <LoginForm 
        onLoginSuccess={handleLoginSuccess} 
        onLoginError={handleLoginError}
      />
      <div class="mt-4 text-center">
        <button on:click={() => setView('signup')} class="text-blue-500 hover:underline">Create an account</button>
        <span class="mx-2">|</span>
        <button on:click={() => setView('reset')} class="text-blue-500 hover:underline">Forgot password?</button>
      </div>
    {:else if currentView === 'signup'}
      <SignupForm />
      <div class="mt-4 text-center">
        <button on:click={() => setView('login')} class="text-blue-500 hover:underline">Already have an account? Log in</button>
      </div>
    {:else if currentView === 'reset'}
      <PasswordResetForm />
      <div class="mt-4 text-center">
        <button on:click={() => setView('login')} class="text-blue-500 hover:underline">Back to login</button>
      </div>
    {/if}
  </div>
</div>