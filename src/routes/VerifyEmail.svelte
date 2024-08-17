<script>
    import { onMount } from 'svelte';
    import { pb } from '../services/pocketbase';
    import { navigate } from 'svelte-routing';
  
    let verificationStatus = 'Verifying...';
  
    onMount(async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
  
      if (!token) {
        verificationStatus = 'Invalid verification link.';
        return;
      }
  
      try {
        await pb.collection('users').confirmVerification(token);
        verificationStatus = 'Email verified successfully!';
        setTimeout(() => navigate('/login'), 2000); // Redirect to login page after 2 seconds
      } catch (error) {
        console.error('Verification error:', error);
        verificationStatus = `Verification failed: ${error.message}`;
        if (error.data?.data?.token) {
          verificationStatus += ` (${error.data.data.token})`;
        }
      }
    });
  </script>
  
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-4">Email Verification</h1>
    <p>{verificationStatus}</p>
  </div>