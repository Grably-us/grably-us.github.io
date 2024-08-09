<script>
    export let imageUrl;
    export let color;
    export let altText = ''; // Optional alt text for the main image
  </script>
  
  <div class="relative cursor-pointer transition-transform transform hover:scale-105 active:scale-95" data-color={color}>
    <img src={imageUrl} alt={altText} class="w-full h-auto rounded-lg relative z-10" />
    <div class="absolute inset-0 flex flex-wrap">
      {#each Array(8) as _, index}
        <img src={imageUrl} alt="" class="absolute w-full h-auto rounded-lg opacity-0 animate-fade" style="animation-delay: {(index % 2) * 750}ms;" />
      {/each}
    </div>
  </div>
  
  <style>
    :global(.animate-fade:nth-child(odd)) {
      animation: fade-left 3s linear infinite;
    }
  
    :global(.animate-fade:nth-child(even)) {
      animation: fade-right 3s linear infinite;
    }
  
    @keyframes fade-left {
      from {
        transform: scale(1) translateX(0%);
        opacity: 1;
      }
      to {
        transform: scale(0.8) translateX(-30%);
        opacity: 0;
      }
    }
  
    @keyframes fade-right {
      from {
        transform: scale(1) translateX(0%);
        opacity: 1;
      }
      to {
        transform: scale(0.8) translateX(30%);
        opacity: 0;
      }
    }
  </style>
  