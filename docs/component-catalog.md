# Component Catalog

## Base UI Components (`src/components/ui/`)

### Button
- Variants: primary, secondary, accent, ghost
- Sizes: sm, md, lg
- States: default, hover, active, disabled, loading
- Accessible: keyboard focus, aria-disabled

### Card
- Variants: default (bordered), elevated (shadow), flat
- Usage: product cards, blog cards, feature cards
- Supports: header, body, footer slots

### Input
- Types: text, email, tel, number, textarea
- States: default, focus, error, disabled
- With label, helper text, and error message

### Badge
- Variants: default, primary, success, warning, error
- Sizes: sm, md
- Usage: product status, category tags, spec values

### Modal
- Svelte component (requires hydration)
- Focus trapping and keyboard navigation
- Accessible: aria-modal, aria-labelledby

### Container
- Max-width: 1280px
- Responsive padding
- Usage: `container-site` utility class

---

## Layout Components (`src/components/layout/`)

### Header
- Astro component with Svelte islands for search and mobile menu
- Top utility bar (dark background)
- Main nav bar with logo, navigation links, search, quote CTA
- Mobile: hamburger menu with slide-out drawer

### Footer
- Astro component (static)
- 4-column grid: Company info, Products, Company links, Contact
- Bottom bar: copyright, legal links

### Breadcrumbs
- Astro component
- Auto-generated from page hierarchy
- Schema.org BreadcrumbList structured data

### MegaMenu (future)
- Svelte component for category flyout menus
- Triggered on hover (desktop) / tap (mobile)

---

## Product Components (`src/components/product/`)

### ProductCard
- Astro component
- Displays: category tag, name, short description, key specs (3), SKU
- Links to product detail page
- Hover: elevated shadow, blue border accent

### ProductGrid
- Astro component
- Responsive grid: 1 col (mobile) → 2 col (tablet) → 3 col (desktop)
- Accepts array of products

### ProductFilters (future)
- Svelte component (`client:idle`)
- Filter by: category, application, industry, status
- Faceted filtering with counts

### ProductSpecs
- Astro component
- Specifications table with alternating rows
- Groups support for organized spec sections

---

## Cart Components (`src/components/cart/`)

### CartDrawer (future)
- Svelte component (`client:only="svelte"`)
- Slide-out drawer from right
- Shows quote items with quantity controls
- "Request Quote" CTA at bottom
- Uses nanostores for state

### CartItem (future)
- Svelte component
- Product name, SKU, quantity input, remove button
- Optional notes field

### QuoteRequestForm (future)
- Svelte component (`client:load`)
- Full quote submission form
- Pre-populated with cart items
- Zod validation, API submission

---

## Search Components (`src/components/search/`)

### SearchBar (future)
- Svelte component (`client:load`)
- Input with autocomplete dropdown
- Fuse.js fuzzy search
- Results grouped by category

---

## Content Components (`src/components/content/`)

### Hero
- Astro component
- Full-width with gradient background
- Title, subtitle, CTA buttons

### BlogCard
- Astro component
- Category badge, title, excerpt, date, author
- Featured image (optional)

### ValueProps
- Astro component
- 3-column grid of icon + title + description
