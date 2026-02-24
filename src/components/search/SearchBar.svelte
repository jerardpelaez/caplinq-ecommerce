<script lang="ts">
  import Fuse from 'fuse.js';

  interface SearchProduct {
    name: string;
    slug: string;
    category: string;
    shortDescription: string;
    sku: string;
  }

  let { products = [] }: { products: SearchProduct[] } = $props();

  let query = $state('');
  let isOpen = $state(false);
  let selectedIndex = $state(-1);
  let debounceTimer: ReturnType<typeof setTimeout> | undefined = undefined;
  let debouncedQuery = $state('');

  let inputEl: HTMLInputElement | undefined = $state(undefined);
  let listboxEl: HTMLUListElement | undefined = $state(undefined);

  // Initialize Fuse.js search index
  let fuse = $derived(
    new Fuse(products, {
      keys: [
        { name: 'name', weight: 2 },
        { name: 'category', weight: 1 },
        { name: 'shortDescription', weight: 0.8 },
        { name: 'sku', weight: 0.5 },
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2,
    })
  );

  let results = $derived.by(() => {
    if (debouncedQuery.length < 2) return [];
    return fuse
      .search(debouncedQuery)
      .slice(0, 8)
      .map((r) => r.item);
  });

  let showDropdown = $derived(isOpen && results.length > 0 && debouncedQuery.length >= 2);

  // Debounce input
  $effect(() => {
    // Read query to track it
    const currentQuery = query;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debouncedQuery = currentQuery;
    }, 300);
    return () => clearTimeout(debounceTimer);
  });

  // Reset selected index when results change
  $effect(() => {
    // Track results
    void results.length;
    selectedIndex = -1;
  });

  // Close dropdown on outside click
  $effect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const container = inputEl?.closest('[data-search-container]');
      if (container && !container.contains(target)) {
        isOpen = false;
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  // Close on Escape
  $effect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        isOpen = false;
        inputEl?.focus();
      }
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    query = target.value;
    isOpen = true;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = selectedIndex < results.length - 1 ? selectedIndex + 1 : 0;
        scrollSelectedIntoView();
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : results.length - 1;
        scrollSelectedIntoView();
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          navigateToProduct(results[selectedIndex]);
        }
        break;
    }
  }

  function scrollSelectedIntoView() {
    if (listboxEl && selectedIndex >= 0) {
      const option = listboxEl.children[selectedIndex] as HTMLElement | undefined;
      option?.scrollIntoView({ block: 'nearest' });
    }
  }

  function navigateToProduct(product: SearchProduct) {
    isOpen = false;
    query = '';
    debouncedQuery = '';
    window.location.href = `/products/${product.category}/${product.slug}`;
  }

  function handleFocus() {
    if (query.length >= 2) {
      isOpen = true;
    }
  }

  function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trimEnd() + '...';
  }

  const listboxId = 'search-listbox';
</script>

<div class="relative w-full max-w-xl" data-search-container>
  <div class="relative">
    <label for="search-input" class="sr-only">Search products</label>
    <svg
      class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
    <input
      id="search-input"
      bind:this={inputEl}
      type="search"
      role="combobox"
      autocomplete="off"
      aria-autocomplete="list"
      aria-expanded={showDropdown}
      aria-controls={listboxId}
      aria-activedescendant={selectedIndex >= 0 ? `search-option-${selectedIndex}` : undefined}
      placeholder="Search products, materials, SKUs..."
      value={query}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onfocus={handleFocus}
      class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
    />
  </div>

  {#if showDropdown}
    <ul
      id={listboxId}
      bind:this={listboxEl}
      role="listbox"
      class="absolute top-full z-50 mt-1 max-h-96 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
    >
      {#each results as product, i}
        <li
          id="search-option-{i}"
          role="option"
          aria-selected={i === selectedIndex}
          class="cursor-pointer border-b border-gray-100 px-4 py-3 last:border-b-0 {i === selectedIndex
            ? 'bg-primary-50'
            : 'hover:bg-gray-50'}"
          onclick={() => navigateToProduct(product)}
          onmouseenter={() => (selectedIndex = i)}
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{product.name}</p>
              <p class="mt-0.5 text-xs text-primary-600">{product.category}</p>
              {#if product.shortDescription}
                <p class="mt-1 text-xs text-gray-500">
                  {truncate(product.shortDescription, 100)}
                </p>
              {/if}
            </div>
            <span class="shrink-0 text-xs text-gray-400">{product.sku}</span>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
