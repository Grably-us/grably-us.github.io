<script>
  import { pb } from '../services/pocketbase';
  import Database from 'svelte-icons/fa/FaDatabase.svelte';
  import Robot from 'svelte-icons/fa/FaRobot.svelte';
  import ChartLine from 'svelte-icons/fa/FaChartLine.svelte';
  import Lock from 'svelte-icons/fa/FaLock.svelte';

  let userName = pb.authStore.model?.name || 'Guest';
</script>

<div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
  <div class="container mx-auto px-4 py-16">
    <h1 class="text-5xl font-bold mb-6">Welcome to Grably, {userName}</h1>
    <p class="text-2xl mb-8">Fueling AI Innovation with Highly-Specific, Off-the-Shelf Datasets</p>
    <button class="bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:bg-blue-100 transition duration-300">Explore Datasets</button>
  </div>
</div>

<section class="py-16 bg-gray-100">
  <div class="container mx-auto px-4">
    <h2 class="text-3xl font-bold mb-8 text-center">Why Choose Grably?</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-blue-500 w-12 h-12 mb-4">
          <Database />
        </div>
        <h3 class="text-xl font-semibold mb-2">Vast Data Library</h3>
        <p>Access 2,500TB of image data, 4.5 trillion dialog messages, and more.</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-blue-500 w-12 h-12 mb-4">
          <Robot />
        </div>
        <h3 class="text-xl font-semibold mb-2">AI-Ready Datasets</h3>
        <p>Tailored for AI products and ML research, our data fuels innovation.</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-blue-500 w-12 h-12 mb-4">
          <ChartLine />
        </div>
        <h3 class="text-xl font-semibold mb-2">Diverse & High-Quality</h3>
        <p>Millions of tags and labels ensure real-world data diversity.</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <div class="text-blue-500 w-12 h-12 mb-4">
          <Lock />
        </div>
        <h3 class="text-xl font-semibold mb-2">Ethical Sourcing</h3>
        <p>Full transparency and rights assurance for all our datasets.</p>
      </div>
    </div>
  </div>
</section>

<section class="py-16">
  <div class="container mx-auto px-4">
    <h2 class="text-3xl font-bold mb-8 text-center">Empowering AI Across Industries</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-blue-100 p-6 rounded-lg">
        <h3 class="text-2xl font-semibold mb-4">For AI Products</h3>
        <p class="mb-4">Bridge the gap between concept and reality with our extensive real-world datasets. Grably provides the data you need to make your AI product work efficiently and accurately.</p>
        <button class="text-blue-600 font-semibold hover:underline">Learn More →</button>
      </div>
      <div class="bg-purple-100 p-6 rounded-lg">
        <h3 class="text-2xl font-semibold mb-4">For AI/ML Researchers</h3>
        <p class="mb-4">Don't let a lack of data hold back your groundbreaking ideas. Grably offers diverse, high-quality datasets to fuel your research and push the boundaries of AI.</p>
        <button class="text-purple-600 font-semibold hover:underline">Explore Opportunities →</button>
      </div>
    </div>
  </div>
</section>

<section class="py-16 bg-gray-800 text-white">
  <div class="container mx-auto px-4 text-center">
    <h2 class="text-3xl font-bold mb-8">Ready to Supercharge Your AI?</h2>
    <p class="text-xl mb-8">Join thousands of companies and researchers already benefiting from Grably's datasets.</p>
    <button class="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-100 transition duration-300">Get Started Now</button>
  </div>
</section>

<section class="py-16">
  <div class="container mx-auto px-4">
    <h2 class="text-3xl font-bold mb-8 text-center">What Our Clients Say</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-gray-100 p-6 rounded-lg">
        <p class="mb-4">"Grably's datasets have been instrumental in improving our AI model's accuracy by 40%. Their diverse data is unparalleled."</p>
        <p class="font-semibold">- John Doe, AI Research Lead at TechCorp</p>
      </div>
      <div class="bg-gray-100 p-6 rounded-lg">
        <p class="mb-4">"The speed at which we can access specific datasets through Grably has accelerated our development process significantly."</p>
        <p class="font-semibold">- Jane Smith, CTO at InnovateAI</p>
      </div>
      <div class="bg-gray-100 p-6 rounded-lg">
        <p class="mb-4">"As a researcher, having access to Grably's ethically sourced data has been a game-changer for my work in natural language processing."</p>
        <p class="font-semibold">- Dr. Alex Johnson, ML Researcher</p>
      </div>
    </div>
  </div>
</section>