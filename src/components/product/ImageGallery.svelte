<script lang="ts">
  let {
    images = [],
    productName = 'Product',
  }: {
    images: string[];
    productName: string;
  } = $props();

  let selectedIndex = $state(0);

  let currentImage = $derived(images[selectedIndex] ?? images[0] ?? '');
  let showThumbnails = $derived(images.length > 1);

  function selectImage(index: number) {
    selectedIndex = index;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (images.length <= 1) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : images.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        selectedIndex = selectedIndex < images.length - 1 ? selectedIndex + 1 : 0;
        break;
    }
  }

  // Keep selectedIndex in bounds if images change
  $effect(() => {
    if (selectedIndex >= images.length) {
      selectedIndex = Math.max(0, images.length - 1);
    }
  });
</script>

<div class="space-y-4">
  <!-- Main image -->
  <div
    class="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
    role="img"
    aria-label="{productName} - Image {selectedIndex + 1} of {images.length}"
    tabindex="0"
    onkeydown={handleKeydown}
  >
    {#if currentImage}
      <div class="flex aspect-square items-center justify-center p-4">
        <img
          src={currentImage}
          alt="{productName} - Image {selectedIndex + 1}"
          class="max-h-full max-w-full object-contain"
          loading="eager"
        />
      </div>
    {:else}
      <div class="flex aspect-square items-center justify-center">
        <div class="text-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="mx-auto mb-2 h-16 w-16" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
          </svg>
          <p class="text-sm">No image available</p>
        </div>
      </div>
    {/if}

    <!-- Navigation arrows (only if multiple images) -->
    {#if showThumbnails}
      <button
        onclick={() => selectImage(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1)}
        class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-700 shadow-md backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onclick={() => selectImage(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0)}
        class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-700 shadow-md backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      <!-- Image counter -->
      <div class="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
        {selectedIndex + 1} / {images.length}
      </div>
    {/if}
  </div>

  <!-- Thumbnail strip -->
  {#if showThumbnails}
    <div
      class="flex gap-2 overflow-x-auto pb-1"
      role="tablist"
      aria-label="Product image thumbnails"
    >
      {#each images as image, i}
        <button
          role="tab"
          aria-selected={i === selectedIndex}
          aria-label="View image {i + 1}"
          onclick={() => selectImage(i)}
          class="h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors {i === selectedIndex
            ? 'border-primary-500 ring-2 ring-primary-500/20'
            : 'border-gray-200 hover:border-gray-400'}"
        >
          <img
            src={image}
            alt="{productName} thumbnail {i + 1}"
            class="h-full w-full object-cover"
            loading="lazy"
          />
        </button>
      {/each}
    </div>
  {/if}
</div>
