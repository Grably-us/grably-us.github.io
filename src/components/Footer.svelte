<script>
  import { Link } from 'svelte-routing';
</script>

<footer class="bg-gray-800 text-white p-4">
  <div class="container mx-auto text-center">
    <p>&copy; 2024 Grably. All rights reserved.</p>
    <div class="mt-2">
      <Link to="/terms" class="text-blue-300 hover:underline mx-2">Terms and Conditions</Link>
      <Link to="/privacy" class="text-blue-300 hover:underline mx-2">Privacy Policy</Link>
    </div>
  </div>
</footer>