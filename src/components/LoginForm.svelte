<script>
  import { pb } from '../services/pocketbase';
  
  export let setView;
  export let onLoginSuccess;
  
  let email = '';
  let password = '';
  let resendMessage = '';
  let error = '';

  async function login() {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      if (authData) {
        if (!authData.record.verified) {
          error = "Please verify your email before logging in.";
          resendMessage = "Didn't receive the email? Click here to resend.";
        } else {
          onLoginSuccess(authData.record); 
        }
      }
    } catch (userError) {
      error = userError.message;
    }
  }
  
  async function resendVerification() {
    try {
      await pb.collection('users').requestVerification(email);
      resendMessage = 'Verification email sent. Please check your inbox.';
      setView('check-email');
    } catch (err) {
      resendMessage = `Error: ${err.message}`;
    }
  }
</script>

<h2 class="text-2xl mb-4 font-bold text-center">Login to Grably</h2>
<form on:submit|preventDefault={login}>
  {#if error}
    <p class="text-red-500 mb-4">{error}</p>
  {/if}
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

{#if resendMessage}
  <p class="mb-2">{resendMessage}</p>
  <button on:click={resendVerification} class="text-blue-500 underline">Resend verification email</button>
{/if}