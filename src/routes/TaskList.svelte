<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { pb } from '../services/pocketbase';
  import MarkdownRenderer from '../components/MarkdownRenderer.svelte';

  let tasks = [];
  let loading = true;
  let error = null;

  onMount(async () => {
    if (pb.authStore.model?.role !== 'Admin') {
      navigate('/');
    }
    await fetchTasks();
  });

  async function fetchTasks() {
    try {
      const records = await pb.collection('Task').getList(1, 50, {
        sort: '-created',
        expand: 'contract'
      });
      tasks = records.items;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function handleTaskClick(taskId) {
    navigate(`/edit-task/${taskId}`);
  }

  function handleTaskKeyDown(event, taskId) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTaskClick(taskId);
    }
  }

  function getTaskThumbnail(task) {
    if (task?.thumbnail) {
      return pb.files.getUrl(task, task.thumbnail);
    }
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="#f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="#999" dominant-baseline="middle" text-anchor="middle">No Image</text></svg>');
  }
</script>

<div class="container mx-auto px-4">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Tasks</h1>
    <a href="/create-task" class="bg-blue-500 text-white p-4 rounded-full hover:bg-blue-600 transition duration-300 shadow-lg" aria-label="Add new task">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </a>
  </div>

  {#if loading}
    <p class="text-center">Loading tasks...</p>
  {:else if error}
    <p class="text-red-500 text-center">{error}</p>
  {:else if tasks.length === 0}
    <p class="text-center">No tasks found.</p>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each tasks as task (task.id)}
        <div 
          role="button"
          tabindex="0"
          class="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300"
          on:click={() => handleTaskClick(task.id)}
          on:keydown={(event) => handleTaskKeyDown(event, task.id)}
        >
          <div class="flex items-start">
            <img 
              src={getTaskThumbnail(task)} 
              alt=""
              class="w-16 h-16 object-cover rounded-lg mr-4"
            />
            <div class="flex-grow">
              <h2 class="text-lg font-bold mb-1">{task.title}</h2>
              <p class="text-sm font-semibold mb-1">Price: {task.price} Grably Coins</p>
              <p class="text-sm">Importance: {task.importance}</p>
              {#if task.expand?.contract}
                <p class="text-sm text-gray-600">Contract: {task.expand.contract.title}</p>
              {/if}
            </div>
          </div>
          <div class="mt-2 max-h-24 overflow-y-auto">
            <MarkdownRenderer htmlContent={task.description} />
          </div>
          {#if task.for_telegram}
            <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">Telegram</span>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>