/**
 * Utility for using nanostores with Svelte 5 runes.
 * Since @nanostores/svelte doesn't exist as a separate package,
 * we create our own reactive binding using $state and $effect.
 */
import type { ReadableAtom } from 'nanostores';

/**
 * Subscribe to a nanostore and return a reactive Svelte 5 state.
 * Must be called during component initialization (top-level of <script>).
 *
 * Usage:
 *   const items = useStore(quoteItems);
 *   // Access current value: items.value
 */
export function useStore<T>(store: ReadableAtom<T>): { readonly value: T } {
  let current = $state(store.get());

  $effect(() => {
    const unsubscribe = store.subscribe((val) => {
      current = val;
    });
    return unsubscribe;
  });

  return {
    get value() {
      return current;
    },
  };
}
