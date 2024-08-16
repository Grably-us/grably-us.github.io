<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import LoginForm from '../components/LoginForm.svelte';
  import SignupForm from '../components/SignUpForm.svelte';
  import PasswordResetForm from '../components/PasswordResetForm.svelte';
  import { pb } from '../services/pocketbase';

  let currentView = 'login';
  function setView(view) {
    currentView = view;
  }
  
  onMount(() => {
    // Check if user is already logged in
    if (pb.authStore.isValid) {
      redirectBasedOnRole(pb.authStore.model.role);
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
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
  <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
    {#if currentView === 'login'}
      <LoginForm onLoginSuccess={handleLoginSuccess} />
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