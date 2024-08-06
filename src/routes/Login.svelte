<script>
  import { onMount } from 'svelte';
  import { Link, navigate } from 'svelte-routing';
  import { pb } from '../services/pocketbase';
  import { ensureWalletExists } from '../services/walletService';
  import LoginForm from '../components/LoginForm.svelte';
  import SignupForm from '../components/SignUpForm.svelte';
  import PasswordResetForm from '../components/PasswordResetForm.svelte';

  let currentView = 'login';
  function setView(view) {
    currentView = view;
  }
  
  onMount(() => {
    // Any initialization logic can go here
  });
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
  <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
    {#if currentView === 'login'}
      <LoginForm />
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