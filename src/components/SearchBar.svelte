<script>
    import { onMount } from 'svelte';
    import debounce from 'lodash/debounce';
    import { search, getAvailableIndexes } from '../services/meilisearch';
  
    let searchQuery = '';
    let searchResults = [];
    let showResults = false;
    let errorMessage = '';
    let availableIndexes = [];
    let selectedIndex = 'movies'; // Default to 'movies'
  
    onMount(async () => {
      try {
        availableIndexes = await getAvailableIndexes();
        if (availableIndexes.length > 0 && !availableIndexes.includes(selectedIndex)) {
          selectedIndex = availableIndexes[0];
        }
      } catch (error) {
        console.error('Error fetching indexes:', error);
        errorMessage = 'Failed to load search indexes. Please try again later.';
      }
    });
  
    const performSearch = debounce(async () => {
      if (searchQuery.length < 2) {
        searchResults = [];
        showResults = false;
        errorMessage = '';
        return;
      }
  
      try {
        searchResults = await search(searchQuery, selectedIndex);
        showResults = true;
        errorMessage = '';
      } catch (error) {
        console.error('Search error:', error);
        errorMessage = `Error: ${error.message}. Please try again later.`;
        searchResults = [];
        showResults = false;
      }
    }, 300);
  
    function handleResultClick(result) {
      showResults = false;
    }
  
    function handleClickOutside(event) {
      if (!event.target.closest('.search-container')) {
        showResults = false;
      }
    }
  
    function handleKeyDown(event, result) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleResultClick(result);
      }
    }
  
    $: if (selectedIndex) {
      performSearch();
    }
  
    onMount(() => {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    });
  </script>
  
  <div class="search-container relative flex items-center">
    <select
      bind:value={selectedIndex}
      class="mr-2 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {#each availableIndexes as index}
        <option value={index}>{index}</option>
      {/each}
    </select>
    
    <input
      type="text"
      bind:value={searchQuery}
      on:input={performSearch}
      placeholder="Search..."
      class="w-64 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    
    {#if errorMessage}
      <div class="absolute top-full left-0 z-10 w-full mt-2 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-md" role="alert">
        {errorMessage}
      </div>
    {:else if showResults && searchResults.length > 0}
      <div class="absolute top-full left-0 z-10 w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-y-auto">
        {#each searchResults as result}
          <button
            type="button"
            class="w-full text-left p-2 hover:bg-gray-100 cursor-pointer flex items-center"
            on:click={() => handleResultClick(result)}
            on:keydown={(event) => handleKeyDown(event, result)}
          >
            {#if result.poster}
              <img src={result.poster} alt={result.title} class="w-12 h-18 object-cover mr-2" />
            {:else if result.thumbnail}
              <img src={result.thumbnail} alt={result.title} class="w-12 h-18 object-cover mr-2" />
            {/if}
            <div>
              <p class="font-semibold">{@html result._formatted.title || result.title}</p>
              <p class="text-sm text-gray-600 truncate">{result.overview || result.description}</p>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>
  
  <style>
    .search-container {
      width: 400px;
    }
  </style>