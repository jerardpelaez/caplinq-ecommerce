# Svelte 5 Component Patterns Skill

## Runes Syntax (ALWAYS use this — NO legacy syntax)

### Props with `$props()`
```svelte
<script lang="ts">
  import type { Product } from '../lib/types/product';

  // Destructure with defaults
  let {
    items = [],
    onSelect,
    class: className = '',
  }: {
    items: Product[];
    onSelect?: (id: string) => void;
    class?: string;
  } = $props();
</script>
```

### Reactive State with `$state()`
```svelte
<script lang="ts">
  let count = $state(0);
  let search = $state('');
  let isOpen = $state(false);

  // Deep reactivity — objects and arrays are reactive too
  let filters = $state<Record<string, string[]>>({});
</script>
```

### Derived Values with `$derived()`
```svelte
<script lang="ts">
  let { items = [] }: { items: Product[] } = $props();
  let search = $state('');

  // Simple derived
  let filtered = $derived(items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  ));

  // Complex derived (use $derived.by for multi-step)
  let groupedByCategory = $derived.by(() => {
    const groups: Record<string, Product[]> = {};
    for (const item of filtered) {
      (groups[item.category] ??= []).push(item);
    }
    return groups;
  });

  let resultCount = $derived(filtered.length);
</script>
```

### Side Effects with `$effect()`
```svelte
<script lang="ts">
  let search = $state('');

  // Runs when `search` changes
  $effect(() => {
    if (search.length >= 3) {
      // Perform search API call or Fuse.js query
    }
  });

  // Cleanup pattern
  $effect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') isOpen = false;
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });
</script>
```

## Nanostores Integration
```svelte
<script lang="ts">
  import { useStore } from '@nanostores/svelte';
  import { cartItems, addToCart, removeFromCart } from '$lib/stores/cart';

  const $cart = useStore(cartItems);
</script>

<p>Quote list has {Object.keys($cart).length} items</p>
<button onclick={() => addToCart(product.sku)}>Add to Quote</button>
```

## Snippets (Replacing Slots)
```svelte
<!-- Parent component using snippets for customizable rendering -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    items,
    header,
    row,
  }: {
    items: any[];
    header: Snippet;
    row: Snippet<[item: any, index: number]>;
  } = $props();
</script>

<table>
  <thead>{@render header()}</thead>
  <tbody>
    {#each items as item, i}
      {@render row(item, i)}
    {/each}
  </tbody>
</table>
```

Usage:
```svelte
<DataTable {items}>
  {#snippet header()}
    <tr><th>Name</th><th>SKU</th><th>Category</th></tr>
  {/snippet}
  {#snippet row(item, i)}
    <tr><td>{item.name}</td><td>{item.sku}</td><td>{item.category}</td></tr>
  {/snippet}
</DataTable>
```

## Event Handling
```svelte
<script lang="ts">
  let { onSelect }: { onSelect?: (id: string) => void } = $props();

  function handleClick(id: string) {
    onSelect?.(id);
  }
</script>

<!-- Use on-prefixed DOM events -->
<button onclick={() => handleClick(item.id)}>Select</button>

<!-- Keyboard accessibility -->
<div
  role="button"
  tabindex="0"
  onclick={() => handleClick(item.id)}
  onkeydown={(e) => e.key === 'Enter' && handleClick(item.id)}
>
  {item.name}
</div>
```

## Form Handling Pattern
```svelte
<script lang="ts">
  import { z } from 'zod';

  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    company: z.string().min(1, 'Company is required'),
    message: z.string().optional(),
  });

  let formData = $state({ name: '', email: '', company: '', message: '' });
  let errors = $state<Record<string, string>>({});
  let submitting = $state(false);
  let submitted = $state(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    errors = {};

    const result = schema.safeParse(formData);
    if (!result.success) {
      errors = Object.fromEntries(
        result.error.issues.map(i => [i.path[0], i.message])
      );
      return;
    }

    submitting = true;
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data),
    });

    submitting = false;
    if (res.ok) {
      submitted = true;
    } else {
      errors = { form: 'Submission failed. Please try again.' };
    }
  }
</script>

{#if submitted}
  <div class="text-green-600" role="alert">Thank you! We'll be in touch.</div>
{:else}
  <form onsubmit={handleSubmit}>
    <label>
      Name
      <input bind:value={formData.name} required />
      {#if errors.name}<span class="text-red-600">{errors.name}</span>{/if}
    </label>
    <!-- ... more fields ... -->
    <button type="submit" disabled={submitting}>
      {submitting ? 'Sending...' : 'Submit'}
    </button>
  </form>
{/if}
```

## Transitions
```svelte
<script>
  import { slide, fade, fly } from 'svelte/transition';
  let isVisible = $state(false);
</script>

{#if isVisible}
  <div transition:slide={{ duration: 300 }}>
    Slides in/out
  </div>
{/if}

<!-- One-directional -->
{#if isOpen}
  <div in:fly={{ y: -10, duration: 200 }} out:fade={{ duration: 150 }}>
    Dropdown content
  </div>
{/if}
```

## DO NOT Use (Legacy Patterns)
```svelte
<!-- ❌ WRONG — Legacy syntax -->
export let items = [];           // Use $props() instead
$: filtered = items.filter(...); // Use $derived() instead
$: { console.log(count); }      // Use $effect() instead
<slot />                         // Use {#snippet} + {@render} instead

<!-- ✅ CORRECT — Runes syntax -->
let { items = [] } = $props();
let filtered = $derived(items.filter(...));
$effect(() => { console.log(count); });
```
