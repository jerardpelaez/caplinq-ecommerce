# Architecture Decision Records

## ADR-001: Use Astro as Meta-Framework

**Status**: Accepted
**Date**: 2024-11-15

**Context**: Need a framework for a B2B ecommerce site that is primarily content-driven with some interactive elements.

**Decision**: Use Astro 5.x with Islands Architecture.

**Rationale**:
- Content-first: Most pages are static product catalogs, blog posts, and informational pages
- Islands architecture lets us ship zero JS for static pages and only hydrate interactive components
- Content Collections provide type-safe, validated data from markdown/YAML files
- SSG-first with option for SSR on specific routes
- Excellent Lighthouse scores out of the box

---

## ADR-002: Use Svelte 5 for Interactive Components

**Status**: Accepted
**Date**: 2024-11-15

**Context**: Need a UI framework for interactive islands (search, cart, filters, forms).

**Decision**: Use Svelte 5 with Runes syntax.

**Rationale**:
- Smallest bundle size of major frameworks — critical for performance
- Runes provide a clean, predictable reactivity model
- First-class Astro integration via @astrojs/svelte
- Compiles away — no runtime overhead

---

## ADR-003: Use Nanostores for Cross-Component State

**Status**: Accepted
**Date**: 2024-11-15

**Context**: Svelte islands in Astro are isolated — they can't share state via Svelte context.

**Decision**: Use nanostores with @nanostores/persistent for shared state.

**Rationale**:
- Framework-agnostic — works in both Astro and Svelte
- @nanostores/persistent provides localStorage persistence for cart/quote
- Tiny bundle size (~300 bytes)
- No global store boilerplate

---

## ADR-004: B2B Quote System Instead of Shopping Cart

**Status**: Accepted
**Date**: 2024-11-15

**Context**: Krayden is a B2B supplier — customers don't pay online.

**Decision**: Implement a "quote request" system instead of a traditional shopping cart + checkout.

**Rationale**:
- B2B pricing is negotiated, not fixed
- Orders go through a sales team for processing
- No payment gateway needed
- Quote list stored in localStorage, submitted via API route

---

## ADR-005: Content Collections for Product Catalog

**Status**: Accepted
**Date**: 2024-11-15

**Context**: Need to manage ~200-400 products with structured data.

**Decision**: Use Astro Content Collections with Zod schemas for all product/category/blog data.

**Rationale**:
- Type-safe queries at build time
- Zod validation catches data errors early
- Markdown body for rich descriptions
- YAML frontmatter for structured fields
- Zero runtime cost — all processing happens at build time

---

## ADR-006: Tailwind CSS v4 for Styling

**Status**: Accepted
**Date**: 2024-11-15

**Context**: Need a styling solution that works in both Astro and Svelte.

**Decision**: Use Tailwind CSS v4 via Vite plugin.

**Rationale**:
- CSS-first configuration in v4 — no JavaScript config file needed
- @theme directive for design tokens
- @utility for custom utilities
- Works seamlessly in Astro and Svelte components
- Utility-first approach reduces CSS bloat
