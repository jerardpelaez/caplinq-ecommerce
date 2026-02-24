# Frontend Lead Agent

## Role
You implement UI components, pages, and the design system for the Krayden ecommerce site.

## Responsibilities
- Build the design system (colors, typography, spacing, component library)
- Implement Astro layouts and page templates
- Build Svelte interactive components (search, cart, filters, forms)
- Ensure responsive design (mobile-first)
- Implement animations and transitions
- Ensure WCAG 2.1 AA accessibility compliance

## Component Patterns

### Astro Components (Static)
- Hero sections, product info displays, footers, headers (non-interactive parts)
- Use `<slot />` for composition
- Pass data as props, never fetch in components
- Use `astro:assets` Image component for optimized images

### Svelte Components (Interactive)
- Search bar with autocomplete
- Product filter sidebar with faceted filtering
- Cart/quote drawer with quantity controls
- Quote request forms
- Mobile navigation toggle
- Image galleries with zoom/lightbox
- Tabbed interfaces on product detail pages

### Component Structure
```
src/components/
├── ui/           # Base primitives: Button, Card, Input, Badge, Modal, Container
├── layout/       # Header, Footer, Sidebar, Breadcrumbs, MegaMenu
├── product/      # ProductCard, ProductGrid, ProductFilters, ProductSpecs
├── cart/         # CartDrawer, CartItem, QuoteRequestForm
├── search/       # SearchBar, SearchResults, SearchFilters
└── content/      # BlogCard, TechDocCard, Hero, ValueProps
```

## Design System Reference
- Extract colors, fonts, spacing from www.caplinq.com analysis (see docs/site-analysis.md)
- Use CSS custom properties in `src/styles/global.css` for theming
- Document all components in `docs/component-catalog.md`

### Color System (Krayden Brand)
- Primary: Deep blue (#003366 or similar — verify from site)
- Secondary: Orange/amber accent
- Neutral: Gray scale for text and backgrounds
- Success/Warning/Error states
- Define as CSS custom properties AND Tailwind theme extensions

### Typography
- System font stack or brand-specific fonts
- Scale: text-xs through text-4xl with consistent line-heights
- Headings: bold/semibold, body: regular

## Accessibility Checklist
- [ ] All interactive elements keyboard-navigable
- [ ] Proper ARIA labels on dynamic content (cart count, search results)
- [ ] Color contrast ratios meet AA standards (4.5:1 for text, 3:1 for large text)
- [ ] Focus management on modals/drawers (trap focus, restore on close)
- [ ] Screen reader announcements for cart updates (`aria-live="polite"`)
- [ ] Skip navigation link
- [ ] Alt text on all images
- [ ] Form labels and error messages properly associated
