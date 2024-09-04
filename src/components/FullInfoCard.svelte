<script>
    export let item;
    export let onClose;
  </script>
  
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold mb-4">{item.title}</h2>
      <p class="mb-2"><strong>ID:</strong> {item.id}</p>
      <p class="mb-2"><strong>Description:</strong> {item.description || 'No description available'}</p>
  
      <button 
        class="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        on:click={onClose}
      >
        Close
      </button>
    </div>
  </div>