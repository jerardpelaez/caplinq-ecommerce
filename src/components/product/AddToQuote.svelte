<script lang="ts">
  import { addToQuote } from '$lib/stores/cart';

  let { sku, name }: { sku: string; name: string } = $props();

  let quantity = $state(1);
  let notes = $state('');
  let showSuccess = $state(false);
  let successTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

  function handleAdd() {
    addToQuote({
      sku,
      name,
      quantity,
      notes: notes.trim() || undefined,
    });

    // Show success feedback
    showSuccess = true;
    clearTimeout(successTimeout);
    successTimeout = setTimeout(() => {
      showSuccess = false;
    }, 3000);

    // Reset form
    quantity = 1;
    notes = '';
  }

  function incrementQuantity() {
    quantity += 1;
  }

  function decrementQuantity() {
    if (quantity > 1) {
      quantity -= 1;
    }
  }

  function handleQuantityInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const val = parseInt(target.value, 10);
    if (!isNaN(val) && val >= 1) {
      quantity = val;
    } else if (target.value === '') {
      // Allow empty for typing, will correct on blur
    }
  }

  function handleQuantityBlur(e: FocusEvent) {
    const target = e.target as HTMLInputElement;
    const val = parseInt(target.value, 10);
    if (isNaN(val) || val < 1) {
      quantity = 1;
    }
  }
</script>

<div class="space-y-4">
  <!-- Quantity selector -->
  <div>
    <label for="quantity-{sku}" class="mb-1.5 block text-sm font-medium text-gray-700">
      Quantity
    </label>
    <div class="flex items-center gap-0">
      <button
        onclick={decrementQuantity}
        disabled={quantity <= 1}
        class="rounded-l-lg border border-r-0 border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        aria-label="Decrease quantity"
      >
        -
      </button>
      <input
        id="quantity-{sku}"
        type="number"
        min="1"
        value={quantity}
        oninput={handleQuantityInput}
        onblur={handleQuantityBlur}
        class="w-20 border border-gray-300 py-2.5 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        aria-label="Quantity"
      />
      <button
        onclick={incrementQuantity}
        class="rounded-r-lg border border-l-0 border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  </div>

  <!-- Optional notes -->
  <div>
    <label for="notes-{sku}" class="mb-1.5 block text-sm font-medium text-gray-700">
      Notes <span class="font-normal text-gray-400">(optional)</span>
    </label>
    <textarea
      id="notes-{sku}"
      bind:value={notes}
      rows={2}
      placeholder="Special requirements, packaging preferences..."
      class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
    ></textarea>
  </div>

  <!-- Add to quote button -->
  <button
    onclick={handleAdd}
    class="btn-primary w-full gap-2"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      class="h-4 w-4"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
    Add to Quote List
  </button>

  <!-- Success message -->
  {#if showSuccess}
    <div
      class="flex items-center gap-2 rounded-lg bg-success-500/10 px-4 py-3 text-sm text-success-600"
      role="status"
      aria-live="polite"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4 shrink-0" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
      <span>
        <strong>{name}</strong> added to your quote list!
      </span>
    </div>
  {/if}
</div>
