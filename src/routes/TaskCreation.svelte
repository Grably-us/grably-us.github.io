<script>
  import { pb } from '../services/pocketbase';
  import { navigate } from 'svelte-routing';
  import { onMount } from 'svelte';

  export let id = null; // If provided, we're editing an existing task

  let title = '';
  let description = '';
  let price = 0;
  let importance = 0;
  let thumbnail = null;
  let thumbnailPreview = null;
  let forTelegram = false;
  let error = '';
  let contracts = [];
  let selectedContract = '';
  let showDeleteConfirmation = false;

  onMount(async () => {
    if (pb.authStore.model?.role !== 'Admin') {
      navigate('/');
    }
    await fetchContracts();
    if (id) {
      await fetchTask(id);
    }
  });

  async function fetchContracts() {
    try {
      const records = await pb.collection('Contract').getList(1, 50, {
        sort: '-created',
      });
      contracts = records.items;
    } catch (e) {
      console.error('Error fetching contracts:', e);
      error = 'Failed to load contracts. Please try again.';
    }
  }

  async function fetchTask(taskId) {
    try {
      const task = await pb.collection('Task').getOne(taskId);
      title = task.title;
      description = task.description;
      price = task.price;
      importance = task.importance;
      forTelegram = task.for_telegram;
      selectedContract = task.contract;
      thumbnailPreview = task.thumbnail ? pb.files.getUrl(task, task.thumbnail) : null;
    } catch (e) {
      console.error('Error fetching task:', e);
      error = 'Failed to load task. Please try again.';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('importance', importance);
      formData.append('for_telegram', forTelegram);
      formData.append('creator', pb.authStore.model.id);
      if (selectedContract) {
        formData.append('contract', selectedContract);
      }
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      if (id) {
        await pb.collection('Task').update(id, formData);
      } else {
        await pb.collection('Task').create(formData);
      }
      navigate('/tasks');
    } catch (e) {
      console.error('Error saving task:', e);
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

  function confirmDelete() {
    showDeleteConfirmation = true;
  }

  async function deleteTask() {
    try {
      await pb.collection('Task').delete(id);
      navigate('/tasks');
    } catch (e) {
      console.error('Error deleting task:', e);
      error = e.message;
    }
  }
</script>

<div class="container mx-auto max-w-2xl px-4">
  <h1 class="text-3xl font-bold mb-6">{id ? 'Edit' : 'Create'} Task</h1>
  <form on:submit={handleSubmit} class="bg-white p-6 rounded shadow-md">
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
              <span class="text-gray-500">Upload Image</span>
            {/if}
          </label>
        </div>
      </div>
      
      <div class="mb-4">
        <label for="title" class="block mb-2 font-semibold">Title</label>
        <input id="title" bind:value={title} type="text" class="w-full p-2 border rounded" required>
      </div>
      <div class="mb-4">
        <label for="description" class="block mb-2 font-semibold">Description (Markdown supported)</label>
        <textarea 
          id="description" 
          bind:value={description} 
          class="w-full p-2 border rounded" 
          rows="6" 
          required
        ></textarea>
      </div>
      <div class="mb-4">
        <label for="price" class="block mb-2 font-semibold">Price (in Grably Coins)</label>
        <input id="price" bind:value={price} type="number" min="0" step="1" class="w-full p-2 border rounded" required>
      </div>
      <div class="mb-4">
        <label for="importance" class="block mb-2 font-semibold">Importance</label>
        <input id="importance" bind:value={importance} type="number" min="0" step="1" class="w-full p-2 border rounded" required>
      </div>
      <div class="mb-4">
        <label for="contract" class="block mb-2 font-semibold">Related Contract</label>
        <select id="contract" bind:value={selectedContract} class="w-full p-2 border rounded">
          <option value="">Select a contract (optional)</option>
          {#each contracts as contract}
            <option value={contract.id}>{contract.title}</option>
          {/each}
        </select>
      </div>
      <div class="mb-4">
        <label class="flex items-center">
          <input type="checkbox" bind:checked={forTelegram} class="mr-2">
          <span>For Telegram</span>
        </label>
      </div>

      <div class="flex justify-between mt-4">
        <button type="submit" class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300">
          {id ? 'Update' : 'Create'} Task
        </button>
        {#if id}
          <button type="button" on:click={confirmDelete} class="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-300">
            Delete Task
          </button>
        {/if}
      </div>
    </form>
  
    {#if showDeleteConfirmation}
      <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="delete-modal">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3 text-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Confirmation</h3>
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
            </div>
            <div class="items-center px-4 py-3">
              <button
                id="delete-btn"
                class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 mb-2"
                on:click={deleteTask}
              >
                Delete
              </button>
              <button
                id="cancel-btn"
                class="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                on:click={() => showDeleteConfirmation = false}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>