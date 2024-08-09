<script>
  import { Link } from 'svelte-routing';
  import { FaTwitter, FaFacebookF, FaLinkedinIn } from 'svelte-icons/fa';
</script>

<footer class="fixed bottom-0 left-0 right-0 bg-gray-800 text-white py-2 px-4 z-20">
  <div class="container mx-auto flex justify-between items-center text-sm">
    <p>&copy; 2024 Grably. All rights reserved.</p>
    <div class="flex items-center space-x-4">
      <Link to="/terms" class="text-gray-300 hover:text-white transition-colors duration-200">Terms</Link>
      <Link to="/privacy" class="text-gray-300 hover:text-white transition-colors duration-200">Privacy</Link>
      <div class="flex space-x-2">
        <a href="grably.us" class="text-gray-300 hover:text-white transition-colors duration-200">
          <div class="w-5 h-5">
            <FaTwitter />
          </div>
        </a>
        <a href="grably.us" class="text-gray-300 hover:text-white transition-colors duration-200">
          <div class="w-5 h-5">
            <FaFacebookF />
          </div>
        </a>
        <a href="grably.us" class="text-gray-300 hover:text-white transition-colors duration-200">
          <div class="w-5 h-5">
            <FaLinkedinIn />
          </div>
        </a>
      </div>
    </div>
  </div>
</footer>