<script>
    import { pb } from '../services/pocketbase';
    import { navigate } from 'svelte-routing';
  
    let name = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    let error = '';
    let role = '';

  
    async function signup() {
      if (password !== confirmPassword) {
        error = "Passwords don't match";
        return;
      }
  
      try {
        const data = {
          name,
          email,
          password,
          passwordConfirm: confirmPassword,
          role: role,
        };
        await pb.collection('users').create(data);
        await pb.collection('users').authWithPassword(email, password);
        navigate('/contracts');
      } catch (e) {
        error = e.message;
      }
    }
  </script>
  
  <h2 class="text-2xl mb-4 font-bold text-center">Sign Up for Grably</h2>
  {#if error}
    <p class="text-red-500 mb-4">{error}</p>
  {/if}
  <form on:submit|preventDefault={signup}>
    <div class="mb-4">
      <label for="name" class="block mb-2">Name</label>
      <input id="name" bind:value={name} type="text" class="w-full p-2 border rounded" required>
    </div>
    <div class="mb-4">
      <label for="email" class="block mb-2">Email</label>
      <input id="email" bind:value={email} type="email" class="w-full p-2 border rounded" required>
    </div>
    <div class="mb-4">
      <label for="password" class="block mb-2">Password</label>
      <input id="password" bind:value={password} type="password" class="w-full p-2 border rounded" required>
    </div>
    <div class="mb-4">
      <label for="confirmPassword" class="block mb-2">Confirm Password</label>
      <input id="confirmPassword" bind:value={confirmPassword} type="password" class="w-full p-2 border rounded" required>
    </div>
    <div class="mb-4">
      <label for="role" class="block mb-2">Role</label>
      <select id="role" bind:value={role} class="w-full p-2 border rounded">
        <option value="user">Customer</option>
        <option value="admin">DataProvider</option>
      </select>
    </div>
    <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Sign Up</button>
  </form>