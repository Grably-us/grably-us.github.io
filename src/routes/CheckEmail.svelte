<script>
    import { pb } from '../services/pocketbase';
    import { navigate } from 'svelte-routing';
  
    let email = '';
    let message = '';
  
    async function resendVerification() {
      try {
        await pb.collection('users').requestVerification(email);
        message = 'Verification email sent. Please check your inbox.';
      } catch (error) {
        message = `Error: ${error.message}`;
      }
    }
  </script>
  
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-4">Check Your Email</h1>
    <p class="mb-4">We've sent a verification email to your inbox. Please check your email and click on the verification link.</p>
    
    <form on:submit|preventDefault={resendVerification} class="mb-4">
      <p class="mb-2">Didn't receive the email? Enter your email address to resend:</p>
      <input type="email" bind:value={email} placeholder="Enter your email" required class="w-full p-2 border rounded mb-2">
      <button type="submit" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Resend Verification Email</button>
    </form>
  
    {#if message}
      <p class="text-green-500">{message}</p>
    {/if}
  
    <button on:click={() => navigate('/login')} class="text-blue-500 underline mt-4">Back to Login</button>
  </div>