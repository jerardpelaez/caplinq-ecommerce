# Ecommerce Logic Skill

## Cart/Quote System

**This is a B2B QUOTE system, not a traditional shopping cart.**

### Key Differences from B2C
- Users add products to a **"quote list"** (not cart)
- **No prices shown** on the website (or "Contact for pricing")
- Quote submission goes to the **sales team**, NOT a payment processor
- No payment gateway, no checkout flow — the "checkout" is submitting a quote request
- Users may request samples before purchasing in bulk

### Quote Store Implementation
```typescript
// src/lib/stores/cart.ts
import { map } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';

export interface QuoteItem {
  sku: string;
  name: string;
  quantity: number;
  notes?: string;
}

// Persisted in localStorage
export const quoteItems = persistentMap<Record<string, string>>('quote:', {});

export function addToQuote(item: QuoteItem) {
  quoteItems.setKey(item.sku, JSON.stringify(item));
}

export function removeFromQuote(sku: string) {
  // Remove by setting key to empty and deleting
  const current = { ...quoteItems.get() };
  delete current[sku];
  // Reset the store
  for (const key of Object.keys(quoteItems.get())) {
    if (!(key in current)) {
      quoteItems.setKey(key, '');
    }
  }
}

export function getQuoteItemsList(): QuoteItem[] {
  const raw = quoteItems.get();
  return Object.values(raw)
    .filter(Boolean)
    .map(v => JSON.parse(v));
}

export function clearQuote() {
  const keys = Object.keys(quoteItems.get());
  keys.forEach(k => quoteItems.setKey(k, ''));
}

export function updateQuantity(sku: string, quantity: number) {
  const raw = quoteItems.get()[sku];
  if (raw) {
    const item = JSON.parse(raw);
    item.quantity = quantity;
    quoteItems.setKey(sku, JSON.stringify(item));
  }
}
```

### Quote Request Flow
1. User browses products, adds items to quote list
2. Quote list shows as a drawer/sidebar (Svelte island, `client:only="svelte"`)
3. User clicks "Request Quote" → navigates to `/quote-request/`
4. Form collects: name, email, company, phone, items (pre-filled), message, preferred delivery timeline
5. Form validates client-side with Zod
6. Submits to `/api/quote-request` (Astro API route)
7. API route validates, sends notification email, returns success
8. Clear quote list on successful submission

## Product Catalog Patterns

### Category Pages
- Server-rendered grids (Astro) with client-side filter islands (Svelte)
- Data flow: `getCollection('products')` → filter by category → pass to `<ProductGrid>` Astro component
- Filters (Svelte island): category, application, industry, status
- Pagination: static — generate page 1/2/3 at build time, or use client-side virtual scrolling

### Product Detail Pages
- Mostly static Astro with Svelte islands for:
  - Image gallery with zoom/lightbox (`client:visible`)
  - "Add to Quote" button (`client:idle`)
  - Tabbed content (specs, documents, related) (`client:idle`)
  - Quantity selector for quote (`client:idle`)
- Breadcrumbs: Home → Category → Product (Astro component)

### Related Products
- Computed at build time based on shared categories/applications
- Show 4-6 related products at bottom of product detail page
- Use same `ProductCard` component as listing pages

## Search

### Fuse.js Client-Side Search
```typescript
// src/lib/stores/search.ts
import { atom } from 'nanostores';

export const searchQuery = atom('');
export const searchResults = atom<SearchResult[]>([]);
export const isSearching = atom(false);

export interface SearchResult {
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  score: number;
}
```

### Building the Search Index
```astro
---
// In a layout or page that needs search
import { getCollection } from 'astro:content';
const products = await getCollection('products');
const searchIndex = products.map(p => ({
  name: p.data.name,
  slug: p.data.slug,
  category: p.data.category,
  shortDescription: p.data.shortDescription,
  applications: p.data.applications.join(', '),
  sku: p.data.sku,
}));
---
<script define:vars={{ searchIndex }}>
  // Make available to Svelte search component
  window.__SEARCH_INDEX__ = searchIndex;
</script>
```

### Search Component Behavior
- Load Fuse.js lazily on search input focus
- Debounce search input (300ms)
- Show results in dropdown overlay
- Index fields: name (weight 2), category, applications, shortDescription, sku
- Max results: 10
- Click result → navigate to product detail page

## Contact/Quote Forms

### Form Validation with Zod
```typescript
// src/lib/types/forms.ts
import { z } from 'zod';

export const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  company: z.string().min(1, 'Company name is required'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const QuoteRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  phone: z.string().optional(),
  items: z.array(z.object({
    sku: z.string(),
    name: z.string(),
    quantity: z.number().positive(),
    notes: z.string().optional(),
  })).min(1, 'At least one item required'),
  deliveryTimeline: z.enum(['urgent', '1-2-weeks', '1-month', 'flexible']).optional(),
  message: z.string().optional(),
});

export const SampleRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  productSku: z.string(),
  application: z.string().min(1, 'Please describe your application'),
  quantity: z.string().optional(),
});

export type ContactForm = z.infer<typeof ContactFormSchema>;
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
export type SampleRequest = z.infer<typeof SampleRequestSchema>;
```

### API Route Pattern
- Validate with Zod on both client AND server
- Return structured error responses
- Log submissions for debugging
- Send email notifications (integrate with Postmark or similar)
- Return 200 for success, 400 for validation errors, 500 for server errors
