<script>
  import { pb } from '../services/pocketbase';
  import { Link, navigate } from 'svelte-routing';

  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let role = 'Customer';
  let agreeTerms = false;
  let agreePolicy = false;
  let error = '';

  async function signup() {
    if (password !== confirmPassword) {
      error = "Passwords don't match";
      return;
    }

    if (!agreeTerms || !agreePolicy) {
      error = "You must agree to the Terms and Privacy Policy";
      return;
    }

    try {
      const userData = {
        name,
        email,
        password,
        passwordConfirm: confirmPassword,
        role,
        agreed_terms: agreeTerms,
        agreed_policy: agreePolicy
      };
      
      const createdUser = await pb.collection('users').create(userData);
      
      if (createdUser) {
        // Login after successful signup
        await login(email, password);
      } else {
        error = "Failed to create user. Please try again.";
      }
    } catch (e) {
      console.error('Signup error:', e);
      if (e.data && e.data.data) {
        error = Object.entries(e.data.data)
          .map(([key, value]) => `${key}: ${value.message}`)
          .join(', ');
      } else {
        error = e.message || "An unexpected error occurred. Please try again.";
      }
    }
  }

  async function login(email, password) {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      if (authData) {
        navigate('/');
      } else {
        error = "Login failed after signup. Please try logging in manually.";
      }
    } catch (e) {
      console.error('Login error:', e);
      error = "Login failed after signup. Please try logging in manually.";
    }
  }
</script>

<div class="max-w-md mx-auto mt-8">
  <h2 class="text-2xl mb-4 font-bold text-center">Sign Up for Grably</h2>
  {#if error}
    <p class="text-red-500 mb-4">{error}</p>
  {/if}
  <form on:submit|preventDefault={signup} class="space-y-4">
    <div>
      <label for="name" class="block mb-1">Name</label>
      <input id="name" bind:value={name} type="text" class="w-full p-2 border rounded" required>
    </div>
    <div>
      <label for="email" class="block mb-1">Email</label>
      <input id="email" bind:value={email} type="email" class="w-full p-2 border rounded" required>
    </div>
    <div>
      <label for="password" class="block mb-1">Password</label>
      <input id="password" bind:value={password} type="password" class="w-full p-2 border rounded" required>
    </div>
    <div>
      <label for="confirmPassword" class="block mb-1">Confirm Password</label>
      <input id="confirmPassword" bind:value={confirmPassword} type="password" class="w-full p-2 border rounded" required>
    </div>
    <div>
      <label for="role" class="block mb-1">Role</label>
      <select id="role" bind:value={role} class="w-full p-2 border rounded">
        <option value="Customer">Customer</option>
        <option value="DataProvider">Data Provider</option>
      </select>
    </div>
    <div>
      <label class="inline-flex items-center">
        <input type="checkbox" bind:checked={agreeTerms} class="mr-2">
        <span>I agree to the <Link to="/terms" class="text-blue-500 hover:underline">Terms and Conditions</Link></span>
      </label>
    </div>
    <div>
      <label class="inline-flex items-center">
        <input type="checkbox" bind:checked={agreePolicy} class="mr-2">
        <span>I agree to the <Link to="/privacy" class="text-blue-500 hover:underline">Privacy Policy</Link></span>
      </label>
    </div>
    <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Sign Up</button>
  </form>
</div>