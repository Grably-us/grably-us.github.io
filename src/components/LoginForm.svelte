<script>
    import { pb } from '../services/pocketbase';
    import { navigate } from 'svelte-routing';
  
    let email = '';
    let password = '';
    let error = '';
  
    async function login() {
        try {
          await pb.collection('users').authWithPassword(email, password);
          navigate('/');
        } catch (userError) {
          error = userError.message;
        }
      }
  </script>
  
  <h2 class="text-2xl mb-4 font-bold text-center">Login to Grably</h2>
  {#if error}
    <p class="text-red-500 mb-4">{error}</p>
  {/if}
  <form on:submit|preventDefault={login}>
    <div class="mb-4">
      <label for="email" class="block mb-2">Email</label>
      <input id="email" bind:value={email} type="text" class="w-full p-2 border rounded" required>
    </div>
    <div class="mb-4">
      <label for="password" class="block mb-2">Password</label>
      <input id="password" bind:value={password} type="password" class="w-full p-2 border rounded" required>
    </div>
    <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Login</button>
  </form>