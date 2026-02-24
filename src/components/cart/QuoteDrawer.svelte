<script lang="ts">
  import { slide, fade } from 'svelte/transition';
  import { useStore } from '$lib/utils/nanostores.svelte';
  import {
    quoteItems,
    removeFromQuote,
    updateQuantity,
    clearQuote,
    quoteItemCount,
    type QuoteItem,
  } from '$lib/stores/cart';

  let isOpen = $state(false);
  let drawerEl: HTMLDivElement | undefined = $state(undefined);

  const itemsStore = useStore(quoteItems);
  const countStore = useStore(quoteItemCount);

  let itemsList = $derived.by(() => {
    const raw = itemsStore.value;
    return Object.values(raw)
      .filter(Boolean)
      .map((v) => JSON.parse(v) as QuoteItem);
  });

  let itemCount = $derived(countStore.value);

  // Close on Escape key
  $effect(() => {
    if (!isOpen) return;
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        isOpen = false;
      }
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  });

  // Body scroll lock when open
  $effect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  });

  // Focus trap when open
  $effect(() => {
    if (!isOpen || !drawerEl) return;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !drawerEl) return;

      const focusable = Array.from(
        drawerEl.querySelectorAll<HTMLElement>(focusableSelector)
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleTab);

    // Focus the close button on open
    const closeBtn = drawerEl.querySelector<HTMLElement>('[data-close-btn]');
    closeBtn?.focus();

    return () => document.removeEventListener('keydown', handleTab);
  });

  function handleQuantityChange(sku: string, newQty: number) {
    if (newQty < 1) return;
    updateQuantity(sku, newQty);
  }

  function handleQuantityInput(sku: string, e: Event) {
    const target = e.target as HTMLInputElement;
    const val = parseInt(target.value, 10);
    if (!isNaN(val) && val >= 1) {
      updateQuantity(sku, val);
    }
  }

  function handleRemove(sku: string) {
    removeFromQuote(sku);
  }

  function handleClearAll() {
    clearQuote();
  }

  function openDrawer() {
    isOpen = true;
  }

  function closeDrawer() {
    isOpen = false;
  }
</script>

<!-- Trigger button -->
<button
  onclick={openDrawer}
  class="relative inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
  aria-label="Open quote list{itemCount > 0 ? `, ${itemCount} item${itemCount !== 1 ? 's' : ''}` : ''}"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="h-6 w-6"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
    />
  </svg>
  <span class="hidden sm:inline">Quote List</span>
  {#if itemCount > 0}
    <span
      class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-white"
    >
      {itemCount}
    </span>
  {/if}
</button>

<!-- Drawer overlay + panel -->
{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-40 bg-black/50"
    transition:fade={{ duration: 200 }}
    onclick={closeDrawer}
    role="presentation"
  ></div>

  <!-- Drawer panel -->
  <div
    bind:this={drawerEl}
    role="dialog"
    aria-modal="true"
    aria-label="Quote list"
    class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
    transition:slide={{ duration: 300, axis: 'x' }}
  >
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <h2 class="text-lg font-semibold text-gray-900">
        Quote List
        {#if itemCount > 0}
          <span class="text-sm font-normal text-gray-500">({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
        {/if}
      </h2>
      <button
        data-close-btn
        onclick={closeDrawer}
        class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        aria-label="Close quote list"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Items list -->
    <div class="flex-1 overflow-y-auto px-6 py-4">
      {#if itemsList.length === 0}
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="mb-4 h-16 w-16 text-gray-300" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
          </svg>
          <p class="text-sm font-medium text-gray-500">Your quote list is empty</p>
          <p class="mt-1 text-xs text-gray-400">Browse products and add items to get started.</p>
        </div>
      {:else}
        <ul class="space-y-4" aria-label="Quote items">
          {#each itemsList as item (item.sku)}
            <li class="rounded-lg border border-gray-200 p-4" transition:slide={{ duration: 200 }}>
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <h3 class="text-sm font-medium text-gray-900">{item.name}</h3>
                  <p class="mt-0.5 text-xs text-gray-500">SKU: {item.sku}</p>
                  {#if item.notes}
                    <p class="mt-1 text-xs text-gray-400 italic">Note: {item.notes}</p>
                  {/if}
                </div>
                <button
                  onclick={() => handleRemove(item.sku)}
                  class="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                  aria-label="Remove {item.name} from quote list"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>

              <!-- Quantity controls -->
              <div class="mt-3 flex items-center gap-2">
                <span class="text-xs text-gray-500">Qty:</span>
                <div class="flex items-center rounded-md border border-gray-300">
                  <button
                    onclick={() => handleQuantityChange(item.sku, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    class="px-2 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Decrease quantity for {item.name}"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onchange={(e) => handleQuantityInput(item.sku, e)}
                    class="w-12 border-x border-gray-300 py-1 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    aria-label="Quantity for {item.name}"
                  />
                  <button
                    onclick={() => handleQuantityChange(item.sku, item.quantity + 1)}
                    class="px-2 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100"
                    aria-label="Increase quantity for {item.name}"
                  >
                    +
                  </button>
                </div>
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- Footer -->
    {#if itemsList.length > 0}
      <div class="border-t border-gray-200 px-6 py-4">
        <div class="flex gap-3">
          <button
            onclick={handleClearAll}
            class="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            Clear All
          </button>
          <a
            href="/quote-request"
            onclick={() => (isOpen = false)}
            class="btn-primary flex-1 text-center no-underline"
          >
            Request Quote
          </a>
        </div>
      </div>
    {/if}
  </div>
{/if}
