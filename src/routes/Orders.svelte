<script>
    import { onMount } from 'svelte';
    import { pb } from '../services/pocketbase';
  
    let orders = [];
  
    onMount(async () => {
      try {
        const records = await pb.collection('orders').getList(1, 50, {
          sort: '-created',
        });
        orders = records.items;
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    });
  </script>
  
  <div class="container mx-auto">
    <h1 class="text-2xl font-bold mb-4">Orders</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each orders as order}
        <div class="bg-white p-4 rounded shadow">
          <h2 class="text-xl font-semibold mb-2">{order.title}</h2>
          <p class="text-gray-600 mb-2">Status: {order.status}</p>
          <p class="text-sm text-gray-500">{new Date(order.created).toLocaleString()}</p>
          <div class="mt-4">
            <span class="inline-block bg-green-200 text-green-800 px-2 py-1 rounded text-sm">
              ${order.price}
            </span>
          </div>
        </div>
      {/each}
    </div>
  </div>