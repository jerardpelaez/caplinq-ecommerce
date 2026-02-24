# Astro Patterns Skill

## Content Collections

### Defining Schemas (`src/content.config.ts`)
```typescript
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const products = defineCollection({
  loader: glob({ pattern: '**/*.{md,yaml}', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    sku: z.string(),
    category: z.string(), // category slug
    shortDescription: z.string(),
    specifications: z.record(z.string()),
    images: z.array(z.string()),
    documents: z.array(z.object({
      type: z.enum(['TDS', 'SDS', 'Brochure', 'ApplicationNote']),
      title: z.string(),
      url: z.string(),
    })),
    applications: z.array(z.string()),
    industries: z.array(z.string()),
    featured: z.boolean().default(false),
    status: z.enum(['active', 'discontinued', 'coming-soon']).default('active'),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/categories' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    parentCategory: z.string().optional(),
    description: z.string(),
    image: z.string().optional(),
    displayOrder: z.number().default(0),
    featured: z.boolean().default(false),
  }),
});

export const collections = { products, categories };
```

### Querying Content (`.astro` files only)
```astro
---
import { getCollection } from 'astro:content';

// Get all active products
const products = await getCollection('products', ({ data }) => data.status === 'active');

// Get featured products
const featured = products.filter(p => p.data.featured);

// Get products by category
const categoryProducts = products.filter(p => p.data.category === 'thermal-interface-materials');

// Sort by name
const sorted = products.sort((a, b) => a.data.name.localeCompare(b.data.name));
---
```

## Islands Architecture

### Hydration Directives
- **`client:load`** — Hydrate immediately on page load. Use for above-fold interactive elements.
  - Search bar in header, cart count icon
- **`client:idle`** — Hydrate when browser is idle. Use for important but not critical interactives.
  - Product filter sidebar, newsletter signup
- **`client:visible`** — Hydrate when element scrolls into viewport. Use for below-fold content.
  - Image gallery, product comparison table, reviews section
- **`client:media="(max-width: 768px)"`** — Hydrate only at certain breakpoints.
  - Mobile-only navigation drawer
- **`client:only="svelte"`** — Client-only, NO SSR. Use when component depends on browser APIs.
  - Cart drawer (reads localStorage), theme toggle

### Example Usage
```astro
---
import SearchBar from '../components/search/SearchBar.svelte';
import ProductFilters from '../components/product/ProductFilters.svelte';
import ImageGallery from '../components/product/ImageGallery.svelte';
import CartDrawer from '../components/cart/CartDrawer.svelte';
---

<!-- Above fold, needed immediately -->
<SearchBar client:load />

<!-- Important but can wait for idle -->
<ProductFilters filters={availableFilters} client:idle />

<!-- Lazy load when scrolled to -->
<ImageGallery images={product.data.images} client:visible />

<!-- Depends on localStorage, client-only -->
<CartDrawer client:only="svelte" />
```

## Data Passing Between Astro and Svelte

### Props (Astro → Svelte)
```astro
---
const products = await getCollection('products');
const serializable = products.map(p => ({
  name: p.data.name,
  slug: p.data.slug,
  category: p.data.category,
  shortDescription: p.data.shortDescription,
}));
---
<ProductGrid products={serializable} client:idle />
```

### Cross-Island Communication (Svelte ↔ Svelte via nanostores)
```typescript
// src/lib/stores/cart.ts
import { persistentMap } from '@nanostores/persistent';

export const cartItems = persistentMap<Record<string, number>>('cart:', {});
```

Both Svelte islands import and use the same store — no props drilling needed.

## Image Optimization
```astro
---
import { Image } from 'astro:assets';
import productImg from '../assets/product-photo.jpg';
---

<!-- Astro optimizes at build time -->
<Image src={productImg} alt="Product photo" width={400} height={300} />

<!-- For Svelte components, pass the optimized URL -->
<ImageGallery images={[productImg.src]} client:visible />
```

## View Transitions
```astro
---
// In BaseLayout.astro
import { ViewTransitions } from 'astro:transitions';
---
<head>
  <ViewTransitions />
</head>

<!-- Named transitions for cross-page animations -->
<img transition:name={`product-${slug}`} src={image} alt={name} />
```

Handle re-initialization after navigation:
```html
<script>
  document.addEventListener('astro:page-load', () => {
    // Re-init any imperative scripts
  });
</script>
```

## API Routes
```typescript
// src/pages/api/quote-request.ts
import type { APIRoute } from 'astro';
import { z } from 'zod';

const QuoteSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  items: z.array(z.object({
    sku: z.string(),
    quantity: z.number().positive(),
  })),
  message: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const result = QuoteSchema.safeParse(body);

  if (!result.success) {
    return new Response(JSON.stringify({ errors: result.error.flatten() }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Process quote request (send email, save to DB, etc.)
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```
