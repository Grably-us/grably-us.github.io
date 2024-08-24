<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function selectRole(role) {
    dispatch('selectRole', role);
  }
</script>

<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
  <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
    <div class="mt-3 text-center">
      <h3 class="text-lg leading-6 font-medium text-gray-900">Select Your Role</h3>
      <div class="mt-2 px-7 py-3">
        <p class="text-sm text-gray-500">
          Please choose your role to complete the registration process.
        </p>
      </div>
      <div class="items-center px-4 py-3">
        <button
          id="customerBtn"
          class="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          on:click={() => selectRole('Customer')}
        >
          Customer
        </button>
        <button
          id="providerBtn"
          class="mt-3 px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
          on:click={() => selectRole('DataProvider')}
        >
          Data Provider
        </button>
      </div>
    </div>
  </div>
</div>