# Astro + Svelte 5 + Tailwind CSS v4 Reference Guide
## B2B Ecommerce Project

> Comprehensive reference for building with Astro, Svelte 5 (Runes), and Tailwind CSS v4.
> Last updated: 2026-02-24

---

## Table of Contents

1. [Astro Project Structure](#1-astro-project-structure)
2. [Content Collections](#2-content-collections)
3. [Astro Islands Architecture](#3-astro-islands-architecture)
4. [SSG vs SSR Modes](#4-ssg-vs-ssr-modes)
5. [Astro + Svelte Integration](#5-astro--svelte-integration)
6. [View Transitions API](#6-view-transitions-api)
7. [Image Optimization](#7-image-optimization)
8. [Middleware and API Routes](#8-middleware-and-api-routes)
9. [SEO Best Practices in Astro](#9-seo-best-practices-in-astro)
10. [Svelte 5 Runes](#10-svelte-5-runes)
11. [Svelte 5 Component Patterns](#11-svelte-5-component-patterns)
12. [Svelte 5 Snippets](#12-svelte-5-snippets)
13. [Svelte Transitions and Animations](#13-svelte-transitions-and-animations)
14. [Svelte Form Handling](#14-svelte-form-handling)
15. [Svelte Accessibility Patterns](#15-svelte-accessibility-patterns)
16. [Tailwind CSS v4 with Astro](#16-tailwind-css-v4-with-astro)

---

## 1. Astro Project Structure

### Standard Directory Layout

```
project-root/
├── astro.config.mjs          # Astro configuration
├── package.json
├── tsconfig.json
├── public/                    # Static assets (served as-is, no processing)
│   ├── favicon.svg
│   ├── robots.txt
│   └── fonts/
├── src/
│   ├── assets/                # Optimized assets (images, etc.)
│   │   └── images/
│   ├── components/            # Reusable components (.astro, .svelte)
│   │   ├── ui/                # Base UI components
│   │   ├── layout/            # Header, Footer, Nav
│   │   └── commerce/          # B2B-specific components
│   ├── content/               # Content Collections
│   │   ├── config.ts          # Collection schemas
│   │   ├── products/          # Product content
│   │   └── blog/              # Blog content
│   ├── layouts/               # Page layouts
│   │   ├── BaseLayout.astro
│   │   └── ProductLayout.astro
│   ├── middleware.ts           # Middleware (auth, redirects)
│   ├── pages/                 # File-based routing
│   │   ├── index.astro
│   │   ├── products/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── api/               # API endpoints
│   │       └── cart.ts
│   ├── styles/                # Global styles
│   │   └── global.css
│   └── lib/                   # Shared utilities
│       ├── utils.ts
│       └── api-client.ts
└── .env                       # Environment variables
```

### Key Conventions

- **`src/pages/`**: Every `.astro`, `.md`, or `.mdx` file becomes a route. `[slug].astro` for dynamic routes.
- **`src/content/`**: Reserved for Content Collections. Must contain `config.ts`.
- **`src/assets/`**: Images here get optimized by Astro's build pipeline. Use `import` to reference them.
- **`public/`**: Files copied verbatim to build output. Use for favicons, `robots.txt`, pre-optimized assets.
- **`src/components/`**: No special behavior, purely organizational.
- **Environment variables**: Access with `import.meta.env.PUBLIC_*` (client) or `import.meta.env.*` (server).

```astro
---
// src/pages/index.astro
// Frontmatter (server-side code) runs at build time (SSG) or request time (SSR)
import BaseLayout from '../layouts/BaseLayout.astro';
import ProductGrid from '../components/commerce/ProductGrid.svelte';
import { getCollection } from 'astro:content';

const products = await getCollection('products');
---

<BaseLayout title="Home">
  <h1>Welcome to Our B2B Store</h1>
  <ProductGrid client:visible products={products} />
</BaseLayout>
```

---

## 2. Content Collections

### Defining Schemas with Zod

Content Collections provide type-safe content with schema validation. Define schemas in `src/content/config.ts`:

```typescript
// src/content/config.ts
import { defineCollection, z, reference } from 'astro:content';

// Product collection
const products = defineCollection({
  type: 'content', // Markdown/MDX with frontmatter
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    sku: z.string(),
    price: z.number().positive(),
    compareAtPrice: z.number().positive().optional(),
    currency: z.enum(['USD', 'EUR', 'GBP']).default('USD'),
    image: image(),  // Uses Astro's image optimization
    gallery: z.array(image()).optional(),
    category: reference('categories'),  // Relationship to another collection
    relatedProducts: z.array(reference('products')).optional(),
    inStock: z.boolean().default(true),
    minOrderQuantity: z.number().int().min(1).default(1),
    tags: z.array(z.string()).default([]),
    publishedDate: z.date(),
    featured: z.boolean().default(false),
  }),
});

// Category collection (data collection - JSON/YAML, no body)
const categories = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    parentCategory: reference('categories').optional(),
    sortOrder: z.number().default(0),
  }),
});

// Blog collection
const blog = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    excerpt: z.string(),
    author: z.string(),
    publishedDate: z.date(),
    updatedDate: z.date().optional(),
    heroImage: image().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { products, categories, blog };
```

### Querying Collections

```typescript
// Querying with getCollection()
import { getCollection, getEntry } from 'astro:content';

// Get all products
const allProducts = await getCollection('products');

// Filter: only published, in-stock products
const availableProducts = await getCollection('products', ({ data }) => {
  return data.inStock && !data.draft;
});

// Get a single entry by slug
const specificProduct = await getEntry('products', 'industrial-widget-x100');

// Get a referenced entry (resolve reference)
const category = await getEntry(specificProduct.data.category);

// Render content body (Markdown/MDX)
const { Content, headings } = await specificProduct.render();
```

### Using in Pages

```astro
---
// src/pages/products/[slug].astro
import { getCollection } from 'astro:content';
import ProductLayout from '../../layouts/ProductLayout.astro';

// Generate static paths for all products
export async function getStaticPaths() {
  const products = await getCollection('products');
  return products.map((product) => ({
    params: { slug: product.slug },
    props: { product },
  }));
}

const { product } = Astro.props;
const { Content } = await product.render();
const category = await getEntry(product.data.category);
---

<ProductLayout title={product.data.title}>
  <h1>{product.data.title}</h1>
  <p>Category: {category.data.name}</p>
  <p>SKU: {product.data.sku}</p>
  <p>Price: {product.data.currency} {product.data.price}</p>
  <Content />
</ProductLayout>
```

### Content File Example

```markdown
---
# src/content/products/industrial-widget-x100.md
title: "Industrial Widget X100"
description: "Heavy-duty widget for industrial applications"
sku: "WDG-X100"
price: 249.99
currency: "USD"
image: "../../assets/images/products/widget-x100.jpg"
category: "industrial-parts"
relatedProducts:
  - "widget-x200"
  - "widget-mount-bracket"
inStock: true
minOrderQuantity: 10
tags: ["industrial", "widgets", "heavy-duty"]
publishedDate: 2025-12-01
featured: true
---

## Product Details

The Industrial Widget X100 is designed for heavy-duty applications...
```

---

## 3. Astro Islands Architecture

Astro Islands enable partial hydration -- only interactive components ship JavaScript to the client.

### Client Directives

```astro
---
import StaticCard from '../components/StaticCard.astro';
import SearchBar from '../components/SearchBar.svelte';
import CartWidget from '../components/CartWidget.svelte';
import ProductCarousel from '../components/ProductCarousel.svelte';
import MobileMenu from '../components/MobileMenu.svelte';
import HeavyDashboard from '../components/Dashboard.svelte';
---

<!-- NO DIRECTIVE: Renders to static HTML, zero JS shipped -->
<StaticCard title="About Us" />

<!-- client:load - Hydrates immediately on page load -->
<!-- USE FOR: Critical interactive UI (cart, auth status, navigation search) -->
<CartWidget client:load cartData={cartData} />

<!-- client:idle - Hydrates after page is done loading (requestIdleCallback) -->
<!-- USE FOR: Below-the-fold interactive content, non-critical features -->
<SearchBar client:idle />

<!-- client:visible - Hydrates when element enters viewport (IntersectionObserver) -->
<!-- USE FOR: Content far down the page, lazy-loaded sections -->
<ProductCarousel client:visible products={featuredProducts} />

<!-- client:media - Hydrates when CSS media query matches -->
<!-- USE FOR: Mobile-only or desktop-only interactive components -->
<MobileMenu client:media="(max-width: 768px)" />

<!-- client:only="svelte" - Renders ONLY on client, skips SSR entirely -->
<!-- USE FOR: Components that depend on browser APIs (localStorage, window) -->
<HeavyDashboard client:only="svelte" />
```

### B2B Ecommerce Island Strategy

```astro
---
// Recommended hydration strategy for B2B ecommerce pages
import Header from '../components/layout/Header.astro';
import CartIcon from '../components/commerce/CartIcon.svelte';
import QuickSearch from '../components/commerce/QuickSearch.svelte';
import ProductGrid from '../components/commerce/ProductGrid.astro'; // Static!
import ProductFilter from '../components/commerce/ProductFilter.svelte';
import BulkOrderForm from '../components/commerce/BulkOrderForm.svelte';
import LiveChat from '../components/LiveChat.svelte';
---

<Header>
  <!-- Cart must be interactive immediately -->
  <CartIcon client:load />
</Header>

<!-- Search can wait until page is idle -->
<QuickSearch client:idle placeholder="Search products..." />

<!-- Static product grid (Astro component - zero JS) -->
<ProductGrid products={products} />

<!-- Filter needs interactivity but only when user scrolls to it -->
<ProductFilter client:visible categories={categories} />

<!-- Bulk order form - hydrate when visible -->
<BulkOrderForm client:visible minimumOrder={50} />

<!-- Live chat - low priority, load when browser is idle -->
<LiveChat client:idle apiKey={import.meta.env.PUBLIC_CHAT_KEY} />
```

### Passing Data Between Islands

Islands are isolated by default. Share state via:

```svelte
<!-- src/lib/stores/cart.svelte.ts (Svelte 5 runes-based store) -->
<script module>
  // Shared reactive state using Svelte 5 runes
  let items = $state<CartItem[]>([]);
  let isOpen = $state(false);

  export function getCart() {
    return {
      get items() { return items; },
      get isOpen() { return isOpen; },
      get totalItems() { return items.reduce((sum, i) => sum + i.quantity, 0); },
      get totalPrice() { return items.reduce((sum, i) => sum + i.price * i.quantity, 0); },
      addItem(item: CartItem) { items = [...items, item]; },
      removeItem(id: string) { items = items.filter(i => i.id !== id); },
      toggleCart() { isOpen = !isOpen; },
    };
  }
</script>
```

Alternatively, use `nanostores` for cross-framework shared state:

```typescript
// src/lib/stores/cart.ts
import { atom, computed } from 'nanostores';

export const cartItems = atom<CartItem[]>([]);
export const cartTotal = computed(cartItems, (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
);

export function addToCart(item: CartItem) {
  cartItems.set([...cartItems.get(), item]);
}
```

```svelte
<!-- Use in Svelte component -->
<script>
  import { cartItems, addToCart } from '../../lib/stores/cart';
  import { useStore } from '@nanostores/svelte'; // Svelte adapter

  const items = useStore(cartItems);
</script>

<span>Cart: {$items.length} items</span>
```

---

## 4. SSG vs SSR Modes

### Static Site Generation (SSG) - Default

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static', // Default - generates static HTML at build time
});
```

**Use SSG for:**
- Product catalog pages (content rarely changes)
- Blog posts, documentation
- Marketing/landing pages
- Any page where content is known at build time

**Limitations:**
- Cannot access request headers, cookies, or URL params at runtime
- Content updates require a rebuild (use webhooks to trigger)

### Server-Side Rendering (SSR)

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server', // Every page is server-rendered on demand
  adapter: node({
    mode: 'standalone', // or 'middleware' for Express integration
  }),
});
```

**Use SSR for:**
- Pages with user-specific content (dashboards, order history)
- Real-time pricing / inventory
- Authentication-gated pages
- Search results pages
- Shopping cart / checkout flow

### Hybrid Mode (Recommended for B2B Ecommerce)

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import svelte from '@astrojs/svelte';

export default defineConfig({
  output: 'hybrid', // Static by default, opt-in to SSR per page
  adapter: node({ mode: 'standalone' }),
  integrations: [svelte()],
});
```

```astro
---
// src/pages/products/index.astro
// This page is STATIC (default in hybrid mode) - prerendered at build time
// No export needed - hybrid defaults to prerender: true
import { getCollection } from 'astro:content';
const products = await getCollection('products');
---
<h1>All Products</h1>
<!-- Static product listing -->
```

```astro
---
// src/pages/account/orders.astro
// OPT-IN to SSR for this specific page
export const prerender = false;

// Now we can access request data
const sessionCookie = Astro.cookies.get('session');
if (!sessionCookie) {
  return Astro.redirect('/login');
}

const orders = await fetchOrders(sessionCookie.value);
---
<h1>Your Orders</h1>
<!-- Dynamic, user-specific content -->
```

### Hybrid Mode Strategy for B2B

| Page | Mode | Reason |
|------|------|--------|
| Homepage | SSG | Marketing content, rarely changes |
| Product catalog | SSG | Content collections, rebuild on update |
| Product detail | SSG | Static content, use `getStaticPaths()` |
| Search results | SSR | Dynamic queries |
| Cart/Checkout | SSR | User-specific, real-time pricing |
| Account dashboard | SSR | Auth-gated, personalized |
| Order history | SSR | User-specific data |
| Blog | SSG | Static content |
| API routes | SSR | Always server-rendered |

---

## 5. Astro + Svelte Integration

### Setup

```bash
# Create new Astro project
npm create astro@latest my-b2b-store

# Add Svelte integration
npx astro add svelte
```

This automatically:
1. Installs `@astrojs/svelte` and `svelte`
2. Adds the integration to `astro.config.mjs`
3. Adds `svelte.config.js` if it does not exist

### Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'hybrid',
  adapter: node({ mode: 'standalone' }),
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

```javascript
// svelte.config.js
import { vitePreprocess } from '@astrojs/svelte';

export default {
  preprocess: vitePreprocess(),
};
```

### Using Svelte Components in Astro

```astro
---
// src/pages/products/[slug].astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import AddToCartButton from '../../components/commerce/AddToCartButton.svelte';
import QuantitySelector from '../../components/commerce/QuantitySelector.svelte';
import ProductImageZoom from '../../components/commerce/ProductImageZoom.svelte';

const { product } = Astro.props;
---

<BaseLayout title={product.data.title}>
  <div class="product-page">
    <!-- Interactive image zoom - hydrate when visible -->
    <ProductImageZoom
      client:visible
      src={product.data.image}
      alt={product.data.title}
    />

    <div class="product-info">
      <h1>{product.data.title}</h1>
      <p class="price">${product.data.price}</p>

      <!-- Quantity + Add to Cart need immediate interactivity -->
      <QuantitySelector
        client:load
        min={product.data.minOrderQuantity}
        step={product.data.minOrderQuantity}
      />
      <AddToCartButton
        client:load
        productId={product.slug}
        price={product.data.price}
      />
    </div>
  </div>
</BaseLayout>
```

### Passing Props: Astro to Svelte

Only serializable data can pass from Astro to Svelte components (no functions, classes, or DOM references). Objects, arrays, strings, numbers, and booleans work fine.

```astro
---
// Astro component
import PriceDisplay from '../components/PriceDisplay.svelte';

const priceData = {
  amount: 299.99,
  currency: 'USD',
  tiers: [
    { minQty: 1, price: 299.99 },
    { minQty: 100, price: 249.99 },
    { minQty: 500, price: 199.99 },
  ],
};
---

<!-- Serializable data passes fine -->
<PriceDisplay client:load data={priceData} />
```

---

## 6. View Transitions API

Astro's View Transitions provide SPA-like page navigation without a JavaScript framework.

### Setup

```astro
---
// src/layouts/BaseLayout.astro
import { ViewTransitions } from 'astro:transitions';
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{title}</title>
    <ViewTransitions />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Transition Directives

```astro
---
// Product card with named transitions
import { fade, slide } from 'astro:transitions';
---

<!-- Named transition: elements with the same name animate between pages -->
<img
  transition:name={`product-image-${product.slug}`}
  src={product.data.image}
  alt={product.data.title}
/>

<h2 transition:name={`product-title-${product.slug}`}>
  {product.data.title}
</h2>

<!-- Built-in animation directives -->
<div transition:animate="fade">Fades in/out</div>
<div transition:animate="slide">Slides in/out</div>
<div transition:animate="none">No animation</div>

<!-- Custom animation -->
<div transition:animate={fade({ duration: '0.3s' })}>
  Custom fade timing
</div>
```

### Persisting Components Across Navigation

```astro
<!-- Audio player, cart sidebar, etc. persist across page navigations -->
<CartSidebar client:load transition:persist />

<!-- Named persist for multiple instances -->
<AudioPlayer client:load transition:persist="main-audio" />
```

### Lifecycle Events

```astro
<script>
  // Listen for navigation events
  document.addEventListener('astro:before-preparation', (event) => {
    // Before new page is fetched - good for exit animations
  });

  document.addEventListener('astro:after-preparation', (event) => {
    // After new page is fetched, before swap
  });

  document.addEventListener('astro:before-swap', (event) => {
    // Just before DOM is updated - customize swap behavior
  });

  document.addEventListener('astro:after-swap', (event) => {
    // After DOM swap - re-initialize scripts, analytics
  });

  document.addEventListener('astro:page-load', (event) => {
    // Fires on initial load AND after every navigation
    // Use this instead of DOMContentLoaded
    initializeAnalytics();
  });
</script>
```

---

## 7. Image Optimization

### Using `astro:assets`

```astro
---
import { Image, Picture } from 'astro:assets';
import productImage from '../assets/images/products/widget.jpg';
---

<!-- Basic optimized image -->
<Image
  src={productImage}
  alt="Industrial Widget"
  width={800}
  height={600}
/>
<!-- Outputs: optimized WebP/AVIF with proper sizing, lazy loading by default -->

<!-- Responsive picture element with multiple formats -->
<Picture
  src={productImage}
  formats={['avif', 'webp']}
  widths={[400, 800, 1200]}
  sizes="(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Industrial Widget"
/>

<!-- Remote images (must be explicitly allowed in config) -->
<Image
  src="https://cdn.example.com/products/widget.jpg"
  alt="Widget"
  width={400}
  height={300}
  inferSize  <!-- Or specify width/height -->
/>
```

### Configuration

```javascript
// astro.config.mjs
export default defineConfig({
  image: {
    // Allow remote image domains
    domains: ['cdn.example.com', 'images.unsplash.com'],
    // Or allow specific remote patterns
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
    ],
    // Default image service settings
    service: {
      entrypoint: 'astro/assets/services/sharp', // Default
      config: {
        limitInputPixels: false, // For very large product images
      },
    },
  },
});
```

### Dynamic Images in Content Collections

```astro
---
// The image() helper in content collection schemas enables optimization
import { Image } from 'astro:assets';
import { getEntry } from 'astro:content';

const product = await getEntry('products', 'widget-x100');
---

<!-- product.data.image is already a validated, optimized image reference -->
<Image src={product.data.image} alt={product.data.title} width={600} />
```

### Using `getImage()` for Programmatic Use

```astro
---
import { getImage } from 'astro:assets';
import bgImage from '../assets/images/hero-bg.jpg';

const optimizedBg = await getImage({
  src: bgImage,
  width: 1920,
  format: 'webp',
  quality: 80,
});
---

<div style={`background-image: url('${optimizedBg.src}')`}>
  Hero section with optimized background
</div>
```

---

## 8. Middleware and API Routes

### Middleware

```typescript
// src/middleware.ts
import { defineMiddleware, sequence } from 'astro:middleware';

// Authentication middleware
const auth = defineMiddleware(async (context, next) => {
  const { cookies, redirect, url, locals } = context;

  // Skip auth for public routes
  const publicPaths = ['/', '/products', '/blog', '/login', '/api/auth'];
  const isPublic = publicPaths.some(path => url.pathname.startsWith(path));

  if (!isPublic) {
    const session = cookies.get('session')?.value;

    if (!session) {
      return redirect('/login?redirect=' + encodeURIComponent(url.pathname));
    }

    // Validate session and attach user to locals
    try {
      const user = await validateSession(session);
      locals.user = user;
      locals.isAuthenticated = true;
    } catch {
      cookies.delete('session');
      return redirect('/login');
    }
  }

  return next();
});

// Logging middleware
const logging = defineMiddleware(async (context, next) => {
  const start = Date.now();
  const response = await next();
  const duration = Date.now() - start;
  console.log(`${context.request.method} ${context.url.pathname} - ${duration}ms`);
  return response;
});

// CORS middleware for API routes
const cors = defineMiddleware(async (context, next) => {
  if (context.url.pathname.startsWith('/api/')) {
    const response = await next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }
  return next();
});

// Chain middleware with sequence()
export const onRequest = sequence(logging, cors, auth);
```

### Type-Safe Locals

```typescript
// src/env.d.ts
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user?: {
      id: string;
      email: string;
      companyId: string;
      role: 'admin' | 'buyer' | 'viewer';
    };
    isAuthenticated: boolean;
  }
}
```

### API Routes

```typescript
// src/pages/api/cart.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies, locals }) => {
  if (!locals.isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cartId = cookies.get('cartId')?.value;
  const cart = cartId ? await getCart(cartId) : { items: [] };

  return new Response(JSON.stringify(cart), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  if (!locals.isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  const body = await request.json();
  const { productId, quantity } = body;

  // Validate
  if (!productId || !quantity || quantity < 1) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
    });
  }

  let cartId = cookies.get('cartId')?.value;
  if (!cartId) {
    cartId = crypto.randomUUID();
    cookies.set('cartId', cartId, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  const updatedCart = await addToCart(cartId, productId, quantity);

  return new Response(JSON.stringify(updatedCart), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  const { itemId } = await request.json();
  const cartId = cookies.get('cartId')?.value;

  if (!cartId) {
    return new Response(JSON.stringify({ error: 'No cart found' }), {
      status: 404,
    });
  }

  const updatedCart = await removeFromCart(cartId, itemId);

  return new Response(JSON.stringify(updatedCart), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### API Route for Order Submission

```typescript
// src/pages/api/orders.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const orderData = await request.json();

    // Validate order
    const validation = orderSchema.safeParse(orderData);
    if (!validation.success) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validation.error.flatten(),
      }), { status: 400 });
    }

    // Process order
    const order = await createOrder({
      ...validation.data,
      userId: locals.user!.id,
      companyId: locals.user!.companyId,
    });

    return new Response(JSON.stringify({ orderId: order.id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Order creation failed:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
};

// Prerender must be false for API routes in hybrid mode
export const prerender = false;
```

---

## 9. SEO Best Practices in Astro

### SEO Component

```astro
---
// src/components/SEO.astro
interface Props {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  canonicalUrl?: string;
  noindex?: boolean;
  publishedDate?: string;
  modifiedDate?: string;
  // Product-specific
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  sku?: string;
  brand?: string;
}

const {
  title,
  description,
  image = '/images/default-og.jpg',
  type = 'website',
  canonicalUrl,
  noindex = false,
  publishedDate,
  modifiedDate,
  price,
  currency,
  availability,
  sku,
  brand,
} = Astro.props;

const siteUrl = import.meta.env.SITE || 'https://example.com';
const canonical = canonicalUrl || new URL(Astro.url.pathname, siteUrl).toString();
const fullImageUrl = new URL(image, siteUrl).toString();
const fullTitle = `${title} | YourB2BStore`;
---

<!-- Primary Meta Tags -->
<title>{fullTitle}</title>
<meta name="title" content={fullTitle} />
<meta name="description" content={description} />
{noindex && <meta name="robots" content="noindex, nofollow" />}
<link rel="canonical" href={canonical} />

<!-- Open Graph -->
<meta property="og:type" content={type} />
<meta property="og:url" content={canonical} />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:image" content={fullImageUrl} />
<meta property="og:site_name" content="YourB2BStore" />

{publishedDate && <meta property="article:published_time" content={publishedDate} />}
{modifiedDate && <meta property="article:modified_time" content={modifiedDate} />}

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content={canonical} />
<meta property="twitter:title" content={fullTitle} />
<meta property="twitter:description" content={description} />
<meta property="twitter:image" content={fullImageUrl} />

<!-- Product Structured Data (JSON-LD) -->
{type === 'product' && price && (
  <script type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": title,
    "description": description,
    "image": fullImageUrl,
    "sku": sku,
    "brand": brand ? { "@type": "Brand", "name": brand } : undefined,
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": currency || "USD",
      "availability": `https://schema.org/${availability || 'InStock'}`,
      "url": canonical,
    },
  })} />
)}
```

### Usage in Layout

```astro
---
// src/layouts/BaseLayout.astro
import SEO from '../components/SEO.astro';
import { ViewTransitions } from 'astro:transitions';

interface Props {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  seoProps?: Record<string, any>;
}

const { title, description, image, type, ...seoProps } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="sitemap" href="/sitemap-index.xml" />
    <SEO title={title} description={description} image={image} type={type} {...seoProps} />
    <ViewTransitions />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Sitemap Integration

```javascript
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yourb2bstore.com',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/account/'), // Exclude auth pages
      changefreq: 'weekly',
      priority: 0.7,
      customPages: [
        'https://yourb2bstore.com/custom-landing',
      ],
    }),
  ],
});
```

### robots.txt

```
# public/robots.txt
User-agent: *
Allow: /
Disallow: /account/
Disallow: /api/
Disallow: /checkout/

Sitemap: https://yourb2bstore.com/sitemap-index.xml
```

---

## 10. Svelte 5 Runes

Svelte 5 replaces the old reactive `$:` syntax with explicit "runes" -- compiler-powered reactive primitives.

### `$state` -- Reactive State

```svelte
<script lang="ts">
  // Basic reactive state
  let count = $state(0);
  let name = $state('');

  // Object state (deeply reactive)
  let product = $state({
    name: 'Widget',
    price: 29.99,
    quantity: 1,
  });

  // Array state (deeply reactive -- push, pop, splice all trigger updates)
  let cartItems = $state<CartItem[]>([]);

  function addItem(item: CartItem) {
    cartItems.push(item); // Mutating works! Svelte 5 uses proxies.
  }

  function increment() {
    count++; // Direct mutation works for $state
  }
</script>

<button onclick={increment}>Count: {count}</button>
<p>{product.name}: ${product.price}</p>

<!-- Two-way binding still works -->
<input bind:value={name} />
```

### `$derived` -- Computed Values

```svelte
<script lang="ts">
  let items = $state<{ price: number; quantity: number }[]>([]);
  let taxRate = $state(0.08);

  // Simple derived value
  let subtotal = $derived(items.reduce((sum, i) => sum + i.price * i.quantity, 0));

  // Derived with complex logic using $derived.by()
  let orderSummary = $derived.by(() => {
    const sub = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = sub * taxRate;
    const total = sub + tax;
    const qualifiesForDiscount = sub >= 1000; // B2B bulk discount
    const discount = qualifiesForDiscount ? total * 0.1 : 0;

    return {
      subtotal: sub,
      tax,
      discount,
      total: total - discount,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      qualifiesForDiscount,
    };
  });
</script>

<div class="order-summary">
  <p>Subtotal: ${orderSummary.subtotal.toFixed(2)}</p>
  <p>Tax: ${orderSummary.tax.toFixed(2)}</p>
  {#if orderSummary.qualifiesForDiscount}
    <p class="text-green-600">Bulk Discount: -${orderSummary.discount.toFixed(2)}</p>
  {/if}
  <p class="font-bold">Total: ${orderSummary.total.toFixed(2)}</p>
</div>
```

### `$effect` -- Side Effects

```svelte
<script lang="ts">
  let searchQuery = $state('');
  let results = $state<Product[]>([]);
  let isLoading = $state(false);

  // Basic effect - runs when dependencies change
  $effect(() => {
    console.log('Search query changed:', searchQuery);
  });

  // Effect with cleanup (return a cleanup function)
  $effect(() => {
    if (searchQuery.length < 3) {
      results = [];
      return;
    }

    isLoading = true;
    const controller = new AbortController();

    fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(data => {
        results = data.products;
        isLoading = false;
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
          isLoading = false;
        }
      });

    // Cleanup: abort previous request when effect re-runs
    return () => controller.abort();
  });

  // $effect.pre - runs before DOM updates
  $effect.pre(() => {
    // Useful for reading DOM state before it changes
  });
</script>

<input bind:value={searchQuery} placeholder="Search products..." />
{#if isLoading}
  <p>Loading...</p>
{:else}
  {#each results as product}
    <div>{product.name}</div>
  {/each}
{/if}
```

### `$props` -- Component Props

```svelte
<!-- ProductCard.svelte -->
<script lang="ts">
  // Destructured props with defaults
  let {
    product,
    showPrice = true,
    onAddToCart,         // Callback prop (replaces events)
    class: className = '', // Rename reserved words
  }: {
    product: Product;
    showPrice?: boolean;
    onAddToCart?: (product: Product, qty: number) => void;
    class?: string;
  } = $props();

  let quantity = $state(1);
</script>

<div class="product-card {className}">
  <h3>{product.name}</h3>
  {#if showPrice}
    <p>${product.price}</p>
  {/if}
  <input type="number" bind:value={quantity} min={product.minOrderQuantity} />
  <button onclick={() => onAddToCart?.(product, quantity)}>
    Add to Cart
  </button>
</div>
```

### `$bindable` -- Two-Way Bindable Props

```svelte
<!-- QuantitySelector.svelte -->
<script lang="ts">
  let {
    value = $bindable(1),  // Parent can bind:value={quantity}
    min = 1,
    max = 9999,
    step = 1,
  }: {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
  } = $props();

  function increment() {
    value = Math.min(value + step, max);
  }

  function decrement() {
    value = Math.max(value - step, min);
  }
</script>

<div class="quantity-selector">
  <button onclick={decrement} disabled={value <= min}>-</button>
  <input
    type="number"
    bind:value={value}
    {min}
    {max}
    {step}
  />
  <button onclick={increment} disabled={value >= max}>+</button>
</div>
```

```svelte
<!-- Usage: parent component -->
<script>
  let orderQuantity = $state(10);
</script>

<QuantitySelector bind:value={orderQuantity} min={10} step={10} />
<p>You're ordering: {orderQuantity} units</p>
```

---

## 11. Svelte 5 Component Patterns

### Container/Presentational Pattern

```svelte
<!-- ProductListContainer.svelte (Smart/Container component) -->
<script lang="ts">
  import ProductGrid from './ProductGrid.svelte';

  let products = $state<Product[]>([]);
  let isLoading = $state(true);
  let filters = $state({ category: '', minPrice: 0, maxPrice: Infinity });

  let filteredProducts = $derived(
    products.filter(p =>
      (!filters.category || p.category === filters.category) &&
      p.price >= filters.minPrice &&
      p.price <= filters.maxPrice
    )
  );

  $effect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        products = data;
        isLoading = false;
      });
  });
</script>

<ProductGrid products={filteredProducts} {isLoading} />
```

```svelte
<!-- ProductGrid.svelte (Presentational/Dumb component) -->
<script lang="ts">
  let {
    products,
    isLoading = false,
  }: {
    products: Product[];
    isLoading?: boolean;
  } = $props();
</script>

{#if isLoading}
  <div class="grid grid-cols-3 gap-4">
    {#each Array(6) as _}
      <div class="animate-pulse h-48 bg-gray-200 rounded"></div>
    {/each}
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each products as product (product.id)}
      <div class="border rounded-lg p-4">
        <h3 class="font-semibold">{product.name}</h3>
        <p class="text-gray-600">${product.price}</p>
      </div>
    {/each}
  </div>
{/if}
```

### Composition Pattern with Children

```svelte
<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    children,
    header,
    footer,
    class: className = '',
  }: {
    children: Snippet;
    header?: Snippet;
    footer?: Snippet;
    class?: string;
  } = $props();
</script>

<div class="rounded-lg border shadow-sm {className}">
  {#if header}
    <div class="border-b px-4 py-3">
      {@render header()}
    </div>
  {/if}

  <div class="p-4">
    {@render children()}
  </div>

  {#if footer}
    <div class="border-t px-4 py-3 bg-gray-50">
      {@render footer()}
    </div>
  {/if}
</div>
```

### Shared State with Module Context

```svelte
<!-- src/lib/stores/cart.svelte.ts -->
<script lang="ts" module>
  interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }

  // Module-level state: shared across all component instances
  let items = $state<CartItem[]>([]);

  export function createCartStore() {
    let isOpen = $state(false);

    return {
      get items() { return items; },
      get isOpen() { return isOpen; },
      get count() { return items.reduce((sum, i) => sum + i.quantity, 0); },
      get total() { return items.reduce((sum, i) => sum + i.price * i.quantity, 0); },

      add(product: { id: string; name: string; price: number }, quantity: number) {
        const existing = items.find(i => i.id === product.id);
        if (existing) {
          existing.quantity += quantity;
        } else {
          items.push({ ...product, quantity });
        }
      },

      remove(id: string) {
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) items.splice(index, 1);
      },

      updateQuantity(id: string, quantity: number) {
        const item = items.find(i => i.id === id);
        if (item) item.quantity = quantity;
      },

      toggle() { isOpen = !isOpen; },
      clear() { items.length = 0; },
    };
  }
</script>
```

---

## 12. Svelte 5 Snippets

Snippets replace slots in Svelte 5, providing a more powerful and type-safe composition model.

### Basic Snippets

```svelte
<!-- DataTable.svelte -->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  let {
    data,
    columns,
    row,
    empty,
    header,
  }: {
    data: T[];
    columns: string[];
    row: Snippet<[T, number]>;  // Snippet with typed parameters
    empty?: Snippet;
    header?: Snippet;
  } = $props();
</script>

<table class="w-full border-collapse">
  {#if header}
    <caption>{@render header()}</caption>
  {/if}
  <thead>
    <tr>
      {#each columns as col}
        <th class="border-b p-2 text-left font-semibold">{col}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#if data.length === 0}
      <tr>
        <td colspan={columns.length} class="p-8 text-center text-gray-500">
          {#if empty}
            {@render empty()}
          {:else}
            No data available
          {/if}
        </td>
      </tr>
    {:else}
      {#each data as item, index (item)}
        <tr class="border-b hover:bg-gray-50">
          {@render row(item, index)}
        </tr>
      {/each}
    {/if}
  </tbody>
</table>
```

### Using Snippets as a Consumer

```svelte
<!-- OrdersPage.svelte -->
<script lang="ts">
  import DataTable from './DataTable.svelte';

  let orders = $state<Order[]>([]);
</script>

<DataTable
  data={orders}
  columns={['Order #', 'Date', 'Items', 'Total', 'Status']}
>
  {#snippet row(order, index)}
    <td class="p-2">{order.orderNumber}</td>
    <td class="p-2">{new Date(order.date).toLocaleDateString()}</td>
    <td class="p-2">{order.items.length}</td>
    <td class="p-2 font-semibold">${order.total.toFixed(2)}</td>
    <td class="p-2">
      <span class="rounded-full px-2 py-1 text-xs {
        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
        'bg-yellow-100 text-yellow-800'
      }">
        {order.status}
      </span>
    </td>
  {/snippet}

  {#snippet empty()}
    <div class="text-center">
      <p class="font-semibold">No orders yet</p>
      <a href="/products" class="text-blue-600 hover:underline">Browse products</a>
    </div>
  {/snippet}

  {#snippet header()}
    <h2 class="text-xl font-bold">Recent Orders</h2>
  {/snippet}
</DataTable>
```

### Declaring Snippets Inline

```svelte
<script lang="ts">
  import Modal from './Modal.svelte';

  let showModal = $state(false);
</script>

{#snippet confirmButton()}
  <button class="bg-blue-600 text-white px-4 py-2 rounded" onclick={() => showModal = false}>
    Confirm Order
  </button>
{/snippet}

{#snippet cancelButton()}
  <button class="border px-4 py-2 rounded" onclick={() => showModal = false}>
    Cancel
  </button>
{/snippet}

{#if showModal}
  <Modal title="Confirm Order" footer={confirmButton}>
    <p>Are you sure you want to place this order?</p>
  </Modal>
{/if}
```

---

## 13. Svelte Transitions and Animations

### Built-in Transitions

```svelte
<script lang="ts">
  import { fade, fly, slide, scale, blur, draw } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';

  let items = $state<CartItem[]>([]);
  let showNotification = $state(false);
</script>

<!-- Basic fade transition -->
{#if showNotification}
  <div transition:fade={{ duration: 200 }}>
    Item added to cart!
  </div>
{/if}

<!-- Fly in from the right (cart sidebar) -->
{#if isCartOpen}
  <div
    transition:fly={{ x: 300, duration: 300, easing: quintOut }}
    class="fixed right-0 top-0 h-full w-80 bg-white shadow-xl"
  >
    Cart sidebar content
  </div>
{/if}

<!-- Separate in/out transitions -->
{#if showPanel}
  <div
    in:fly={{ y: -20, duration: 200 }}
    out:fade={{ duration: 150 }}
  >
    Dropdown panel
  </div>
{/if}

<!-- List animations with flip -->
{#each items as item (item.id)}
  <div
    animate:flip={{ duration: 300 }}
    transition:slide={{ duration: 200 }}
  >
    {item.name}
  </div>
{/each}
```

### Custom Transitions

```svelte
<script lang="ts">
  function expandFromCenter(node: HTMLElement, { duration = 300, easing = quintOut } = {}) {
    return {
      duration,
      easing,
      css: (t: number) => `
        transform: scale(${t});
        opacity: ${t};
      `,
    };
  }
</script>

{#if showProduct}
  <div transition:expandFromCenter={{ duration: 400 }}>
    Product quick view
  </div>
{/if}
```

---

## 14. Svelte Form Handling

### B2B Order Form Example

```svelte
<!-- BulkOrderForm.svelte -->
<script lang="ts">
  interface OrderLine {
    sku: string;
    quantity: number;
    note: string;
  }

  let lines = $state<OrderLine[]>([
    { sku: '', quantity: 1, note: '' },
  ]);

  let errors = $state<Record<string, string>>({});
  let isSubmitting = $state(false);
  let submitSuccess = $state(false);

  // Derived validation
  let isValid = $derived(
    lines.every(line => line.sku.trim() !== '' && line.quantity > 0)
  );

  let totalItems = $derived(
    lines.reduce((sum, line) => sum + line.quantity, 0)
  );

  function addLine() {
    lines.push({ sku: '', quantity: 1, note: '' });
  }

  function removeLine(index: number) {
    lines.splice(index, 1);
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    lines.forEach((line, i) => {
      if (!line.sku.trim()) {
        newErrors[`sku-${i}`] = 'SKU is required';
      }
      if (line.quantity < 1) {
        newErrors[`qty-${i}`] = 'Quantity must be at least 1';
      }
    });

    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!validate()) return;

    isSubmitting = true;

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines }),
      });

      if (!response.ok) throw new Error('Order failed');

      submitSuccess = true;
      lines = [{ sku: '', quantity: 1, note: '' }];
    } catch (error) {
      errors = { form: 'Failed to submit order. Please try again.' };
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-4">
  <h2 class="text-xl font-bold">Bulk Order Form</h2>

  {#if errors.form}
    <div class="bg-red-50 text-red-600 p-3 rounded" role="alert">
      {errors.form}
    </div>
  {/if}

  {#each lines as line, i (i)}
    <div class="flex gap-3 items-start">
      <div class="flex-1">
        <label for="sku-{i}" class="block text-sm font-medium">SKU</label>
        <input
          id="sku-{i}"
          type="text"
          bind:value={line.sku}
          class="w-full border rounded px-3 py-2"
          class:border-red-500={errors[`sku-${i}`]}
          placeholder="e.g., WDG-X100"
        />
        {#if errors[`sku-${i}`]}
          <p class="text-red-500 text-sm mt-1">{errors[`sku-${i}`]}</p>
        {/if}
      </div>

      <div class="w-32">
        <label for="qty-{i}" class="block text-sm font-medium">Quantity</label>
        <input
          id="qty-{i}"
          type="number"
          bind:value={line.quantity}
          min="1"
          class="w-full border rounded px-3 py-2"
        />
      </div>

      <div class="flex-1">
        <label for="note-{i}" class="block text-sm font-medium">Note</label>
        <input
          id="note-{i}"
          type="text"
          bind:value={line.note}
          class="w-full border rounded px-3 py-2"
          placeholder="Optional"
        />
      </div>

      {#if lines.length > 1}
        <button
          type="button"
          onclick={() => removeLine(i)}
          class="mt-6 text-red-500 hover:text-red-700"
          aria-label="Remove line {i + 1}"
        >
          Remove
        </button>
      {/if}
    </div>
  {/each}

  <div class="flex justify-between items-center">
    <button
      type="button"
      onclick={addLine}
      class="text-blue-600 hover:text-blue-800"
    >
      + Add another line
    </button>

    <span class="text-sm text-gray-500">
      Total items: {totalItems}
    </span>
  </div>

  <button
    type="submit"
    disabled={!isValid || isSubmitting}
    class="w-full bg-blue-600 text-white py-3 rounded font-semibold
           disabled:opacity-50 disabled:cursor-not-allowed
           hover:bg-blue-700 transition-colors"
  >
    {#if isSubmitting}
      Submitting Order...
    {:else}
      Submit Bulk Order
    {/if}
  </button>
</form>
```

---

## 15. Svelte Accessibility Patterns

### Accessible Modal/Dialog

```svelte
<!-- Modal.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  let {
    open = $bindable(false),
    title,
    children,
    footer,
    onclose,
  }: {
    open: boolean;
    title: string;
    children: Snippet;
    footer?: Snippet;
    onclose?: () => void;
  } = $props();

  let dialogEl: HTMLDialogElement;

  // Focus trap and escape key handling
  $effect(() => {
    if (open) {
      dialogEl?.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      dialogEl?.close();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  });

  function handleClose() {
    open = false;
    onclose?.();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }
</script>

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black/50 z-40"
    transition:fade={{ duration: 150 }}
    onclick={handleClose}
    role="presentation"
  ></div>

  <!-- Dialog -->
  <dialog
    bind:this={dialogEl}
    onkeydown={handleKeydown}
    onclose={handleClose}
    aria-labelledby="modal-title"
    class="fixed z-50 bg-white rounded-lg shadow-xl max-w-lg w-full p-0 m-auto"
    transition:fly={{ y: -20, duration: 200 }}
  >
    <div class="flex items-center justify-between border-b px-6 py-4">
      <h2 id="modal-title" class="text-lg font-semibold">{title}</h2>
      <button
        onclick={handleClose}
        aria-label="Close dialog"
        class="text-gray-400 hover:text-gray-600"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="px-6 py-4">
      {@render children()}
    </div>

    {#if footer}
      <div class="border-t px-6 py-4 flex justify-end gap-3">
        {@render footer()}
      </div>
    {/if}
  </dialog>
{/if}
```

### Accessible Patterns Checklist

```svelte
<!-- Announce dynamic content to screen readers -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {#if cartUpdated}
    {cartMessage}
  {/if}
</div>

<!-- Skip navigation link -->
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-white">
  Skip to main content
</a>

<!-- Loading states -->
<div aria-busy={isLoading} aria-live="polite">
  {#if isLoading}
    <p role="status">Loading products...</p>
  {:else}
    <!-- content -->
  {/if}
</div>

<!-- Form error summary -->
{#if Object.keys(errors).length > 0}
  <div role="alert" aria-labelledby="error-heading">
    <h3 id="error-heading">Please fix the following errors:</h3>
    <ul>
      {#each Object.entries(errors) as [field, message]}
        <li><a href="#{field}">{message}</a></li>
      {/each}
    </ul>
  </div>
{/if}
```

### `sr-only` Utility (Tailwind)

```svelte
<!-- Visually hidden but available to screen readers -->
<span class="sr-only">Remove item from cart</span>

<!-- Icon button with accessible label -->
<button aria-label="Add to favorites">
  <svg>...</svg>
</button>

<!-- Table with proper semantics -->
<table>
  <caption class="sr-only">Product comparison table</caption>
  <thead>
    <tr>
      <th scope="col">Product</th>
      <th scope="col">Price</th>
      <th scope="col">Availability</th>
    </tr>
  </thead>
  <tbody>
    {#each products as product}
      <tr>
        <th scope="row">{product.name}</th>
        <td>${product.price}</td>
        <td>
          <span class="sr-only">{product.inStock ? 'In stock' : 'Out of stock'}</span>
          <span aria-hidden="true">{product.inStock ? '✓' : '✗'}</span>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
```

---

## 16. Tailwind CSS v4 with Astro

### Installation and Setup

Tailwind CSS v4 uses a CSS-first configuration approach. No more `tailwind.config.js` required for most setups.

```bash
# Install Tailwind CSS v4 and the Vite plugin
npm install tailwindcss @tailwindcss/vite
```

### Astro Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### CSS Setup (v4 Syntax)

```css
/* src/styles/global.css */

/* v4: Use @import instead of @tailwind directives */
@import "tailwindcss";

/* --- Custom Theme Configuration (replaces tailwind.config.js) --- */

/* Define custom theme values directly in CSS */
@theme {
  /* Colors for B2B branding */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-primary-950: #172554;

  --color-secondary-500: #6366f1;
  --color-secondary-600: #4f46e5;

  --color-success: #16a34a;
  --color-warning: #f59e0b;
  --color-danger: #dc2626;

  /* Custom fonts */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Custom spacing scale (extends defaults) */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;
  --spacing-128: 32rem;

  /* Custom breakpoints */
  --breakpoint-xs: 480px;
  --breakpoint-3xl: 1920px;

  /* Custom border radii */
  --radius-card: 0.75rem;
  --radius-button: 0.5rem;

  /* Custom shadows */
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-card-hover: 0 10px 25px rgba(0, 0, 0, 0.1);

  /* Custom animations */
  --animate-slide-in: slide-in 0.3s ease-out;
  --animate-fade-up: fade-up 0.4s ease-out;
}

@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --- Custom Utilities --- */

/* v4: Custom utilities using @utility */
@utility container-narrow {
  max-width: 72rem;
  margin-inline: auto;
  padding-inline: 1.5rem;
}

@utility text-balance {
  text-wrap: balance;
}

/* --- Custom Variants --- */

/* v4: Custom variants using @variant */
@variant hocus (&:hover, &:focus-visible);

/* --- Base Layer Overrides --- */

@layer base {
  html {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }

  body {
    @apply bg-white text-gray-900;
  }

  h1, h2, h3, h4 {
    @apply text-balance font-semibold tracking-tight;
  }
}

/* --- Component Layer --- */

@layer components {
  .btn {
    @apply inline-flex items-center justify-center rounded-button px-4 py-2
           font-medium transition-colors focus:outline-none focus:ring-2
           focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50
           disabled:pointer-events-none;
  }

  .btn-primary {
    @apply btn bg-primary-600 text-white hover:bg-primary-700;
  }

  .btn-secondary {
    @apply btn bg-white text-gray-700 border border-gray-300
           hover:bg-gray-50;
  }

  .input {
    @apply block w-full rounded-button border border-gray-300 px-3 py-2
           text-sm placeholder:text-gray-400
           focus:border-primary-500 focus:ring-1 focus:ring-primary-500
           disabled:bg-gray-50 disabled:text-gray-500;
  }

  .badge {
    @apply inline-flex items-center rounded-full px-2.5 py-0.5
           text-xs font-medium;
  }

  .badge-success {
    @apply badge bg-green-100 text-green-800;
  }

  .badge-warning {
    @apply badge bg-yellow-100 text-yellow-800;
  }

  .badge-danger {
    @apply badge bg-red-100 text-red-800;
  }

  .card {
    @apply rounded-card bg-white shadow-card p-6;
  }
}
```

### Import in Layout

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';
import { ViewTransitions } from 'astro:transitions';
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <ViewTransitions />
  </head>
  <body class="min-h-screen bg-gray-50">
    <slot />
  </body>
</html>
```

### Using Tailwind in Svelte Components

```svelte
<!-- ProductCard.svelte -->
<script lang="ts">
  let { product, onAddToCart }: {
    product: Product;
    onAddToCart: (id: string) => void;
  } = $props();
</script>

<div class="card group hover:shadow-card-hover transition-shadow duration-200">
  <div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
    <img
      src={product.image}
      alt={product.name}
      class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  </div>
  <div class="mt-4 space-y-2">
    <h3 class="font-semibold text-gray-900 truncate">{product.name}</h3>
    <p class="text-sm text-gray-500">{product.sku}</p>
    <div class="flex items-center justify-between">
      <span class="text-lg font-bold text-primary-600">
        ${product.price.toFixed(2)}
      </span>
      {#if product.inStock}
        <span class="badge-success">In Stock</span>
      {:else}
        <span class="badge-danger">Out of Stock</span>
      {/if}
    </div>
    <button
      class="btn-primary w-full mt-3"
      onclick={() => onAddToCart(product.id)}
      disabled={!product.inStock}
    >
      Add to Cart
    </button>
  </div>
</div>
```

### Key v4 Changes Summary

| v3 (Old) | v4 (New) |
|-----------|----------|
| `@tailwind base;` / `@tailwind components;` / `@tailwind utilities;` | `@import "tailwindcss";` |
| `tailwind.config.js` | `@theme { }` block in CSS |
| `theme.extend.colors` in JS | `--color-*` CSS custom properties in `@theme` |
| `plugins: [...]` in JS | `@plugin "..."` in CSS, or `@utility` / `@variant` |
| `@apply` in arbitrary selectors | Still supported, but prefer `@utility` for new patterns |
| `darkMode: 'class'` in config | `@variant dark (&.dark *)` or auto via `prefers-color-scheme` |
| PostCSS setup required | Vite plugin (`@tailwindcss/vite`) -- no PostCSS needed |
| `npx tailwindcss init` | No config file needed |

### Dark Mode in v4

```css
/* Dark mode using prefers-color-scheme (automatic) */
@import "tailwindcss";

@theme {
  /* Light theme tokens */
  --color-surface: #ffffff;
  --color-surface-alt: #f9fafb;
  --color-text: #111827;
  --color-text-muted: #6b7280;
}

/* Override for dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-surface: #111827;
    --color-surface-alt: #1f2937;
    --color-text: #f9fafb;
    --color-text-muted: #9ca3af;
  }
}
```

```svelte
<!-- Using semantic color tokens -->
<div class="bg-surface text-text">
  <p class="text-text-muted">Secondary information</p>
</div>
```

---

## Quick Reference: File Organization for B2B Ecommerce

```
src/
├── components/
│   ├── ui/                     # Generic UI (Button, Input, Modal, Card)
│   │   ├── Button.svelte
│   │   ├── Modal.svelte
│   │   └── DataTable.svelte
│   ├── layout/                 # Layout components
│   │   ├── Header.astro        # Static header shell
│   │   ├── Footer.astro
│   │   ├── Nav.svelte          # Interactive nav (client:load)
│   │   └── MobileMenu.svelte   # Mobile menu (client:media)
│   ├── commerce/               # B2B commerce components
│   │   ├── ProductCard.svelte
│   │   ├── ProductFilter.svelte
│   │   ├── CartSidebar.svelte
│   │   ├── CartIcon.svelte
│   │   ├── QuantitySelector.svelte
│   │   ├── BulkOrderForm.svelte
│   │   ├── PriceTierTable.svelte
│   │   └── QuickSearch.svelte
│   ├── account/                # Account/auth components
│   │   ├── LoginForm.svelte
│   │   ├── OrderHistory.svelte
│   │   └── CompanyProfile.svelte
│   └── SEO.astro               # SEO meta component
├── content/
│   ├── config.ts               # Collection schemas
│   ├── products/               # Product markdown files
│   ├── categories/             # Category JSON/YAML files
│   └── blog/                   # Blog posts
├── layouts/
│   ├── BaseLayout.astro        # Root layout with <head>, ViewTransitions
│   ├── ProductLayout.astro     # Product page layout
│   └── AccountLayout.astro     # Auth-gated layout
├── lib/
│   ├── stores/                 # Shared state
│   │   └── cart.svelte.ts
│   ├── utils.ts                # General utilities
│   └── api-client.ts           # Typed API client
├── middleware.ts                # Auth, logging, CORS
├── pages/
│   ├── index.astro             # Homepage (SSG)
│   ├── products/
│   │   ├── index.astro         # Catalog (SSG)
│   │   └── [slug].astro        # Product detail (SSG)
│   ├── search.astro            # Search results (SSR: prerender=false)
│   ├── cart.astro              # Cart page (SSR)
│   ├── checkout.astro          # Checkout (SSR)
│   ├── account/
│   │   ├── index.astro         # Dashboard (SSR)
│   │   ├── orders.astro        # Order history (SSR)
│   │   └── profile.astro       # Profile settings (SSR)
│   ├── blog/
│   │   ├── index.astro         # Blog listing (SSG)
│   │   └── [slug].astro        # Blog post (SSG)
│   ├── login.astro             # Login page (SSR)
│   └── api/
│       ├── cart.ts             # Cart CRUD API
│       ├── orders.ts           # Order submission API
│       ├── search.ts           # Search API
│       └── auth/
│           ├── login.ts
│           └── logout.ts
└── styles/
    └── global.css              # Tailwind v4 imports + theme
```

---

## Performance Checklist

- [ ] Use `.astro` components for static content (zero JS)
- [ ] Only use Svelte + `client:*` for genuinely interactive parts
- [ ] Prefer `client:visible` or `client:idle` over `client:load` when possible
- [ ] Use `client:media` for responsive-only components (mobile nav)
- [ ] Use Content Collections for product data (type-safe, validated, optimized)
- [ ] Use `<Image>` and `<Picture>` from `astro:assets` for all images
- [ ] Enable View Transitions for SPA-like navigation
- [ ] Use `transition:persist` for components that should survive navigation (cart)
- [ ] Use hybrid mode: SSG for catalog, SSR only for personalized pages
- [ ] Implement proper `<head>` SEO with structured data for products
- [ ] Use `nanostores` or Svelte module-level `$state` for cross-island state
- [ ] Add sitemap and robots.txt
- [ ] Validate all content with Zod schemas in Content Collections
