# Krayden B2B Ecommerce

## Quick Reference
- **Build**: `npm run build`
- **Dev**: `npm run dev`
- **Stack**: Astro 5 + Svelte 5 (Runes) + Tailwind CSS v4
- **Content**: Astro Content Collections (products, categories, blog)
- **State**: Nanostores + @nanostores/persistent
- **Search**: Fuse.js client-side

## Project Intelligence
Full architecture docs, agent definitions, and skills are in `.claude/claude.md`.

## Critical Rules
- **Svelte 5 Runes ONLY**: Use `$state`, `$derived`, `$effect`, `$props()`. NEVER `$:`, `export let`, or Svelte stores.
- **Islands Architecture**: Astro for static, Svelte only for interactive elements with `client:*` directives.
- **B2B Quote Flow**: No prices, no checkout. Users browse -> add to quote list -> request quote -> sales team follows up.
- **Nanostores ONLY**: Never use `writable`/`readable` from Svelte. Use nanostores for cross-framework state.
- **Content Collections**: `getCollection()` only in `.astro` files. Pass serializable data as props to Svelte.
- **Tailwind v4**: Uses `@import "tailwindcss"` and `@theme {}` block. NOT `@tailwind base/components/utilities`.
- **Performance**: Target 95+ Lighthouse. Use `client:visible` or `client:idle` over `client:load` where possible.

## File Structure
```
src/
├── components/
│   ├── ui/          # Button, Card, Input, Badge
│   ├── layout/      # Breadcrumbs
│   ├── product/     # ProductCard, ProductFilters, ImageGallery
│   ├── cart/        # QuoteDrawer, QuoteItem
│   ├── search/      # SearchBar
│   ├── forms/       # ContactForm, QuoteRequestForm
│   └── content/     # BlogCard
├── content/         # Content Collections (products/, categories/, blog/)
├── layouts/         # BaseLayout, PageLayout, ProductLayout, BlogLayout
├── lib/
│   ├── stores/      # cart.ts, search.ts (nanostores)
│   ├── types/       # product.ts, forms.ts
│   ├── utils/       # categories.ts
│   └── constants/   # site.ts
├── pages/           # Astro pages (file-based routing)
└── styles/          # global.css (Tailwind v4 + brand design tokens)
```

## URL Structure
```
/                                    Homepage
/products/                           All products listing
/products/[category]/                Category listing
/products/[category]/[slug]          Product detail
/blog/                               Blog listing
/blog/[slug]                         Blog post
/about                               About page
/contact                             Contact page
/resources/                          Resources hub
/quote-request                       Quote request form
/search                              Search results
```

## Content Schemas
- **Products**: name, slug, sku, category, specifications, documents (TDS/SDS), status
- **Categories**: name, slug, parentCategory (hierarchical), displayOrder, featured
- **Blog**: title, slug, author, publishDate, tags, excerpt, relatedProducts

## Brand Colors
- Primary: Slate Blue (#3D4760 scale)
- Navy: Dark (#1a2332, #0f172a)
- Accent: Krayden Blue (#0066cc scale)
- Defined as CSS custom properties in `src/styles/global.css`
