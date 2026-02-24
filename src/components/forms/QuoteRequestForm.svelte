<script lang="ts">
  import { slide } from 'svelte/transition';
  import { useStore } from '$lib/utils/nanostores.svelte';
  import {
    quoteItems,
    removeFromQuote,
    updateQuantity,
    clearQuote,
    type QuoteItem,
  } from '$lib/stores/cart';
  import { QuoteRequestSchema } from '$lib/types/forms';

  const itemsStore = useStore(quoteItems);

  let itemsList = $derived.by(() => {
    const raw = itemsStore.value;
    return Object.values(raw)
      .filter(Boolean)
      .map((v) => JSON.parse(v) as QuoteItem);
  });

  let formData = $state({
    name: '',
    email: '',
    company: '',
    phone: '',
    deliveryTimeline: '' as '' | 'urgent' | '1-2-weeks' | '1-month' | 'flexible',
    message: '',
  });

  let errors = $state<Record<string, string>>({});
  let submitting = $state(false);
  let submitted = $state(false);

  function handleItemQuantityChange(sku: string, newQty: number) {
    if (newQty < 1) return;
    updateQuantity(sku, newQty);
  }

  function handleItemQuantityInput(sku: string, e: Event) {
    const target = e.target as HTMLInputElement;
    const val = parseInt(target.value, 10);
    if (!isNaN(val) && val >= 1) {
      updateQuantity(sku, val);
    }
  }

  function handleRemoveItem(sku: string) {
    removeFromQuote(sku);
  }

  function validateField(field: string): string | null {
    if (field === 'items' || field === 'deliveryTimeline') return null;
    const schema = QuoteRequestSchema.shape[field as keyof typeof QuoteRequestSchema.shape];
    if (!schema) return null;
    const result = schema.safeParse((formData as Record<string, unknown>)[field]);
    if (!result.success) {
      return result.error.issues[0]?.message ?? 'Invalid value';
    }
    return null;
  }

  function handleBlur(field: string) {
    const error = validateField(field);
    if (error) {
      errors = { ...errors, [field]: error };
    } else {
      const { [field]: _, ...rest } = errors;
      errors = rest;
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    errors = {};

    const payload = {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      phone: formData.phone || undefined,
      deliveryTimeline: formData.deliveryTimeline || undefined,
      message: formData.message || undefined,
      items: itemsList.map((item) => ({
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        notes: item.notes,
      })),
    };

    const result = QuoteRequestSchema.safeParse(payload);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        if (!newErrors[path]) {
          newErrors[path] = issue.message;
        }
      }
      errors = newErrors;

      // Focus first invalid form field
      const formFields = ['name', 'email', 'company', 'phone', 'deliveryTimeline', 'message'];
      for (const field of formFields) {
        if (newErrors[field]) {
          const el = document.getElementById(`quote-${field}`);
          el?.focus();
          break;
        }
      }
      return;
    }

    submitting = true;

    try {
      // Placeholder: log to console since no API route yet
      console.log('Quote request submission:', result.data);

      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      submitted = true;
      clearQuote();
    } catch {
      errors = { form: 'Submission failed. Please try again.' };
    } finally {
      submitting = false;
    }
  }
</script>

{#if submitted}
  <div class="rounded-lg border border-success-500/30 bg-success-500/5 p-8 text-center" role="alert">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="mx-auto mb-4 h-16 w-16 text-success-500" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
    <h3 class="text-xl font-semibold text-gray-900">Quote Request Submitted</h3>
    <p class="mx-auto mt-3 max-w-md text-sm text-gray-600">
      Thank you for your interest. Our sales team will review your request and prepare a customized quote within 1-2 business days.
    </p>
    <a
      href="/products"
      class="btn-primary mt-6 inline-flex no-underline"
    >
      Continue Browsing Products
    </a>
  </div>
{:else}
  <form onsubmit={handleSubmit} novalidate class="space-y-8">
    {#if errors.form}
      <div class="rounded-lg bg-error-500/10 px-4 py-3 text-sm text-error-600" role="alert">
        {errors.form}
      </div>
    {/if}

    <!-- Quote items section -->
    <section>
      <h3 class="mb-4 text-lg font-semibold text-gray-900">Quote Items</h3>

      {#if itemsList.length === 0}
        <div class="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
          <p class="text-sm text-gray-500">No items in your quote list.</p>
          <a href="/products" class="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
            Browse products to add items
          </a>
        </div>
        {#if errors.items}
          <p class="mt-2 text-sm text-error-500" role="alert">{errors.items}</p>
        {/if}
      {:else}
        <div class="space-y-3">
          {#each itemsList as item (item.sku)}
            <div
              class="flex items-center gap-4 rounded-lg border border-gray-200 px-4 py-3"
              transition:slide={{ duration: 200 }}
            >
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900">{item.name}</p>
                <p class="text-xs text-gray-500">SKU: {item.sku}</p>
              </div>

              <!-- Editable quantity -->
              <div class="flex items-center gap-1">
                <label for="qty-{item.sku}" class="sr-only">Quantity for {item.name}</label>
                <button
                  type="button"
                  onclick={() => handleItemQuantityChange(item.sku, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  class="rounded px-1.5 py-0.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                  aria-label="Decrease quantity for {item.name}"
                >
                  -
                </button>
                <input
                  id="qty-{item.sku}"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onchange={(e) => handleItemQuantityInput(item.sku, e)}
                  class="w-14 rounded border border-gray-300 px-2 py-1 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onclick={() => handleItemQuantityChange(item.sku, item.quantity + 1)}
                  class="rounded px-1.5 py-0.5 text-sm text-gray-600 hover:bg-gray-100"
                  aria-label="Increase quantity for {item.name}"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onclick={() => handleRemoveItem(item.sku)}
                class="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                aria-label="Remove {item.name}"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Contact information section -->
    <section>
      <h3 class="mb-4 text-lg font-semibold text-gray-900">Contact Information</h3>

      <div class="grid gap-5 sm:grid-cols-2">
        <!-- Name -->
        <div>
          <label for="quote-name" class="mb-1.5 block text-sm font-medium text-gray-700">
            Full Name <span class="text-error-500" aria-hidden="true">*</span>
          </label>
          <input
            id="quote-name"
            type="text"
            bind:value={formData.name}
            onblur={() => handleBlur('name')}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'quote-name-error' : undefined}
            required
            class="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 {errors.name ? 'border-error-500 focus:border-error-500' : 'border-gray-300 focus:border-primary-500'}"
            placeholder="John Smith"
          />
          {#if errors.name}
            <p id="quote-name-error" class="mt-1 text-sm text-error-500" role="alert">{errors.name}</p>
          {/if}
        </div>

        <!-- Email -->
        <div>
          <label for="quote-email" class="mb-1.5 block text-sm font-medium text-gray-700">
            Email Address <span class="text-error-500" aria-hidden="true">*</span>
          </label>
          <input
            id="quote-email"
            type="email"
            bind:value={formData.email}
            onblur={() => handleBlur('email')}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'quote-email-error' : undefined}
            required
            class="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 {errors.email ? 'border-error-500 focus:border-error-500' : 'border-gray-300 focus:border-primary-500'}"
            placeholder="john@company.com"
          />
          {#if errors.email}
            <p id="quote-email-error" class="mt-1 text-sm text-error-500" role="alert">{errors.email}</p>
          {/if}
        </div>

        <!-- Company -->
        <div>
          <label for="quote-company" class="mb-1.5 block text-sm font-medium text-gray-700">
            Company <span class="text-error-500" aria-hidden="true">*</span>
          </label>
          <input
            id="quote-company"
            type="text"
            bind:value={formData.company}
            onblur={() => handleBlur('company')}
            aria-invalid={!!errors.company}
            aria-describedby={errors.company ? 'quote-company-error' : undefined}
            required
            class="w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 {errors.company ? 'border-error-500 focus:border-error-500' : 'border-gray-300 focus:border-primary-500'}"
            placeholder="ACME Corp"
          />
          {#if errors.company}
            <p id="quote-company-error" class="mt-1 text-sm text-error-500" role="alert">{errors.company}</p>
          {/if}
        </div>

        <!-- Phone -->
        <div>
          <label for="quote-phone" class="mb-1.5 block text-sm font-medium text-gray-700">
            Phone <span class="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="quote-phone"
            type="tel"
            bind:value={formData.phone}
            class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>
    </section>

    <!-- Delivery & message section -->
    <section>
      <h3 class="mb-4 text-lg font-semibold text-gray-900">Additional Details</h3>

      <div class="space-y-5">
        <!-- Delivery timeline -->
        <div>
          <label for="quote-deliveryTimeline" class="mb-1.5 block text-sm font-medium text-gray-700">
            Preferred Delivery Timeline
          </label>
          <select
            id="quote-deliveryTimeline"
            bind:value={formData.deliveryTimeline}
            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">Select a timeline...</option>
            <option value="urgent">Urgent (ASAP)</option>
            <option value="1-2-weeks">1-2 Weeks</option>
            <option value="1-month">Within 1 Month</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>

        <!-- Message -->
        <div>
          <label for="quote-message" class="mb-1.5 block text-sm font-medium text-gray-700">
            Additional Notes <span class="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            id="quote-message"
            bind:value={formData.message}
            rows={4}
            class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            placeholder="Any special requirements, volume expectations, or questions for our sales team..."
          ></textarea>
        </div>
      </div>
    </section>

    <!-- Submit -->
    <div class="border-t border-gray-200 pt-6">
      <button
        type="submit"
        disabled={submitting || itemsList.length === 0}
        class="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {#if submitting}
          <svg class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Submitting Request...
        {:else}
          Submit Quote Request
        {/if}
      </button>
      {#if itemsList.length === 0}
        <p class="mt-2 text-sm text-gray-500">Add items to your quote list before submitting.</p>
      {/if}
    </div>
  </form>
{/if}
