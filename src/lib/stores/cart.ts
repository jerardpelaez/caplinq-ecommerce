import { atom } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';

export interface QuoteItem {
  sku: string;
  name: string;
  quantity: number;
  notes?: string;
}

// Persist quote items in localStorage
// Each key is a SKU, value is JSON-serialized QuoteItem
export const quoteItems = persistentMap<Record<string, string>>('krayden-quote:', {});

// Derived atom for item count
export const quoteItemCount = atom(0);

// Update count whenever quoteItems changes
quoteItems.subscribe((items) => {
  const count = Object.values(items).filter(Boolean).length;
  quoteItemCount.set(count);
});

export function addToQuote(item: QuoteItem): void {
  const existing = quoteItems.get()[item.sku];
  if (existing) {
    const parsed: QuoteItem = JSON.parse(existing);
    parsed.quantity += item.quantity;
    quoteItems.setKey(item.sku, JSON.stringify(parsed));
  } else {
    quoteItems.setKey(item.sku, JSON.stringify(item));
  }
}

export function removeFromQuote(sku: string): void {
  quoteItems.setKey(sku, '');
}

export function updateQuantity(sku: string, quantity: number): void {
  const raw = quoteItems.get()[sku];
  if (raw) {
    const item: QuoteItem = JSON.parse(raw);
    item.quantity = Math.max(1, quantity);
    quoteItems.setKey(sku, JSON.stringify(item));
  }
}

export function getQuoteItemsList(): QuoteItem[] {
  const raw = quoteItems.get();
  return Object.values(raw)
    .filter(Boolean)
    .map((v) => JSON.parse(v) as QuoteItem);
}

export function clearQuote(): void {
  const keys = Object.keys(quoteItems.get());
  for (const key of keys) {
    quoteItems.setKey(key, '');
  }
}
