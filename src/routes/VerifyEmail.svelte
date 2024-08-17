<script>
import { onMount } from 'svelte';
import { pb } from '../services/pocketbase';
import { navigate } from 'svelte-routing';

let verificationStatus = 'Verifying...';

onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');

    if (!token || !email) {
    verificationStatus = 'Invalid verification link.';
    return;
    }

    try {
    await pb.collection('users').confirmVerification(token);
    verificationStatus = 'Email verified successfully!';
    // Optionally, log the user in automatically
    await pb.collection('users').authWithPassword(email, password);
    setTimeout(() => navigate('/'), 2000); // Redirect to home page after 2 seconds
    } catch (error) {
    verificationStatus = `Verification failed: ${error.message}`;
    }
});
</script>

<div class="container mx-auto px-4 py-8">
<h1 class="text-3xl font-bold mb-4">Email Verification</h1>
<p>{verificationStatus}</p>
</div>