<script>
    import { pb } from '../services/pocketbase';
  
    let email = '';
    let message = '';
    let error = '';
  
    async function resetPassword() {
      try {
        await pb.collection('users').requestPasswordReset(email);
        message = 'Password reset email sent. Please check your inbox.';
        error = '';
      } catch (e) {
        error = e.message;
        message = '';
      }
    }
  </script>
  
  <h2 class="text-2xl mb-4 font-bold text-center">Reset Password</h2>
  {#if error}
    <p class="text-red-500 mb-4">{error}</p>
  {/if}
  {#if message}
    <p class="text-green-500 mb-4">{message}</p>
  {/if}
  <form on:submit|preventDefault={resetPassword}>
    <div class="mb-4">
      <label for="email" class="block mb-2">Email</label>
      <input id="email" bind:value={email} type="email" class="w-full p-2 border rounded" required>
    </div>
    <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Reset Password</button>
  </form>