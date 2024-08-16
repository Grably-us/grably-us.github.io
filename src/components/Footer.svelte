<script>
  import { Link } from 'svelte-routing';
</script>

<footer class="bg-gray-800 text-white py-6 px-4">
  <div class="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
    <div class="mb-4 md:mb-0">
      <p>&copy; 2024 Grably. All rights reserved.</p>
    </div>
    <div class="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
      <a href="mailto:hello@grably.us" class="text-gray-300 hover:text-white transition-colors duration-200">
        Contact us: hello@grably.us
      </a>
      <Link to="/terms" class="text-gray-300 hover:text-white transition-colors duration-200">Terms</Link>
      <Link to="/privacy" class="text-gray-300 hover:text-white transition-colors duration-200">Privacy</Link>
    </div>
  </div>
</footer>