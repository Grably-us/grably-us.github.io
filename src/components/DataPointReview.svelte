<script>
    import { pb } from '../services/pocketbase';
  
    export let dataPoint;
  
    async function updateDataPointStatus(newStatus) {
      try {
        await pb.collection('DataPoint').update(dataPoint.id, { status: newStatus });
        dataPoint.status = newStatus;
      } catch (err) {
        console.error(`Failed to update datapoint status: ${err.message}`);
      }
    }
  
    async function addDataPointComment(comment) {
      try {
        await pb.collection('DataPoint').update(dataPoint.id, { comment });
        dataPoint.comment = comment;
      } catch (err) {
        console.error(`Failed to add comment: ${err.message}`);
      }
    }
  
    function getFileUrl(dataPoint) {
      return pb.files.getUrl(dataPoint, dataPoint.data);
    }
  </script>
  
  <div class="bg-white shadow-md rounded-lg p-4 mb-4">
    <h4 class="text-lg font-semibold mb-2">{dataPoint.description}</h4>
    
    {#if dataPoint.data}
      {#if dataPoint.data.startsWith('image/')}
        <img src={getFileUrl(dataPoint)} alt="Data point" class="max-w-full h-auto mb-2" />
      {:else if dataPoint.data.startsWith('video/')}
      <video src={getFileUrl(dataPoint)} controls class="max-w-full h-auto mb-2">
        <track kind="captions" src="path/to/captions.vtt" srclang="en" label="English">
        Your browser does not support the video tag.
      </video>
      {:else}
        <a href={getFileUrl(dataPoint)} target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">
          View File
        </a>
      {/if}
    {/if}
  
    <p><strong>Status:</strong> {dataPoint.status}</p>
    <p><strong>Tags:</strong> {dataPoint.tags?.join(', ')}</p>
    
    <div class="mt-2">
      <button on:click={() => updateDataPointStatus('Accepted')} class="bg-green-500 text-white px-2 py-1 rounded mr-2">
        Accept
      </button>
      <button on:click={() => updateDataPointStatus('Declined')} class="bg-red-500 text-white px-2 py-1 rounded">
        Decline
      </button>
    </div>
    
    <div class="mt-2">
      <textarea bind:value={dataPoint.comment} class="w-full p-2 border rounded" placeholder="Add a comment..."></textarea>
      <button on:click={() => addDataPointComment(dataPoint.comment)} class="mt-2 bg-blue-500 text-white px-2 py-1 rounded">
        Add Comment
      </button>
    </div>
  </div>