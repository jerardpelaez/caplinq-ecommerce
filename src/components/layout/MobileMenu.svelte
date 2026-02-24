<script lang="ts">
  import { slide, fade } from 'svelte/transition';

  interface NavItem {
    label: string;
    href: string;
  }

  let { navItems = [] }: { navItems: NavItem[] } = $props();

  let isOpen = $state(false);
  let menuEl: HTMLDivElement | undefined = $state(undefined);

  // Close on Escape
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
    if (!isOpen || !menuEl) return;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !menuEl) return;

      const focusable = Array.from(
        menuEl.querySelectorAll<HTMLElement>(focusableSelector)
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
    const closeBtn = menuEl.querySelector<HTMLElement>('[data-close-btn]');
    closeBtn?.focus();

    return () => document.removeEventListener('keydown', handleTab);
  });

  function toggleMenu() {
    isOpen = !isOpen;
  }

  function closeMenu() {
    isOpen = false;
  }
</script>

<!-- Hamburger trigger button -->
<button
  onclick={toggleMenu}
  class="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 lg:hidden"
  aria-expanded={isOpen}
  aria-controls="mobile-menu"
  aria-label={isOpen ? 'Close menu' : 'Open menu'}
>
  {#if isOpen}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-6 w-6" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-6 w-6" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  {/if}
</button>

<!-- Mobile menu overlay + panel -->
{#if isOpen}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-40 bg-black/50 lg:hidden"
    transition:fade={{ duration: 200 }}
    onclick={closeMenu}
    role="presentation"
  ></div>

  <!-- Menu panel -->
  <div
    bind:this={menuEl}
    id="mobile-menu"
    role="dialog"
    aria-modal="true"
    aria-label="Mobile navigation"
    class="fixed inset-y-0 left-0 z-50 flex w-full max-w-xs flex-col bg-white shadow-2xl lg:hidden"
    transition:slide={{ duration: 300, axis: 'x' }}
  >
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <span class="text-lg font-semibold text-gray-900">Menu</span>
      <button
        data-close-btn
        onclick={closeMenu}
        class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        aria-label="Close menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-5 w-5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Navigation items -->
    <nav class="flex-1 overflow-y-auto px-4 py-4" aria-label="Mobile navigation">
      <ul class="space-y-1">
        {#each navItems as item}
          <li>
            <a
              href={item.href}
              onclick={closeMenu}
              class="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <!-- Footer -->
    <div class="border-t border-gray-200 px-6 py-4">
      <a
        href="/contact"
        onclick={closeMenu}
        class="btn-primary w-full text-center no-underline"
      >
        Contact Us
      </a>
    </div>
  </div>
{/if}
