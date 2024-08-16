<script>
  import { pb } from '../services/pocketbase';
  import { navigate } from 'svelte-routing';
  import { onMount } from 'svelte';

  let title = '';
  let description = '';
  let amount_requested = 0;
  let price_per_point = 0;
  let deadline = '';
  let thumbnail = null;
  let thumbnailPreview = null;
  let error = '';

  onMount(() => {
    if (pb.authStore.model?.role === 'DataProvider') {
      navigate('/');
    }
  });

  async function submitContract(event) {
    event.preventDefault(); // Prevent default form submission
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('amount_requested', amount_requested);
      formData.append('price_per_point', price_per_point);
      formData.append('deadline', deadline);
      formData.append('status', 'Draft');
      formData.append('creator', pb.authStore.model.id);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      const record = await pb.collection('Contract').create(formData);
      navigate('/contracts');
    } catch (e) {
      console.error('Error creating contract:', e);
      error = e.message;
    }
  }

  function handleThumbnailChange(event) {
    const file = event.target.files[0];
    thumbnail = file;
    
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        thumbnailPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      thumbnailPreview = null;
    }
  }
</script>

<div class="container mx-auto max-w-2xl px-4">
  <h1 class="text-3xl font-bold mb-6">Post a Request</h1>
  <form on:submit={submitContract} class="bg-white p-6 rounded shadow-md">
    {#if error}
      <p class="text-red-500 mb-4">{error}</p>
    {/if}
    
    <div class="mb-6 flex justify-center">
      <div class="relative w-32 h-32">
        <input
          type="file"
          id="thumbnail"
          accept="image/*"
          on:change={handleThumbnailChange}
          class="hidden"
        />
        <label
          for="thumbnail"
          class="cursor-pointer absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full overflow-hidden"
        >
          {#if thumbnailPreview}
            <img src={thumbnailPreview} alt="Thumbnail preview" class="w-full h-full object-cover" />
          {:else}
            <span class="text-gray-500">Upload Logo</span>
          {/if}
        </label>
      </div>
    </div>
    
    <div class="mb-4">
      <label for="title" class="block mb-2 font-semibold">Title</label>
      <input id="title" bind:value={title} type="text" class="w-full p-2 border rounded" required>
    </div>
    <div class="mb-4">
      <label for="description" class="block mb-2 font-semibold">Description</label>
      <textarea 
        id="description" 
        bind:value={description} 
        class="w-full p-2 border rounded" 
        rows="6" 
        required
      ></textarea>
    </div>
    <div class="mb-4">
      <label for="amount_requested" class="block mb-2 font-semibold">Amount Requested</label>
      <input id="amount_requested" bind:value={amount_requested} type="number" min="1" class="w-full p-2 border rounded" required>
    </div>
    <div class="mb-4">
      <label for="price_per_point" class="block mb-2 font-semibold">Price Per Point (in Grably Coins)</label>
      <input id="price_per_point" bind:value={price_per_point} type="number" min="0" step="1" class="w-full p-2 border rounded" required>
    </div>
    <div class="mb-4">
      <label for="deadline" class="block mb-2 font-semibold">Deadline</label>
      <input id="deadline" bind:value={deadline} type="date" class="w-full p-2 border rounded" required>
    </div>
    <button type="submit" class="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300">Submit</button>
  </form>
</div>