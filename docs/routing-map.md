# URL Structure & Routing Map

## Public Routes

| URL Pattern | Page | Type | Description |
|---|---|---|---|
| `/` | `src/pages/index.astro` | SSG | Homepage |
| `/products/` | `src/pages/products/index.astro` | SSG | All products listing |
| `/products/[category]/` | `src/pages/products/[category]/index.astro` | SSG | Category listing |
| `/products/[category]/[slug]/` | `src/pages/products/[category]/[slug].astro` | SSG | Product detail |
| `/blog/` | `src/pages/blog/index.astro` | SSG | Blog listing |
| `/blog/[slug]/` | `src/pages/blog/[slug].astro` | SSG | Blog post |
| `/resources/` | `src/pages/resources/index.astro` | SSG | Technical resources hub |
| `/about/` | `src/pages/about.astro` | SSG | About CAPLINQ |
| `/contact/` | `src/pages/contact.astro` | SSG | Contact page with form |
| `/quote-request/` | `src/pages/quote-request.astro` | SSG | Quote request form |
| `/search/` | `src/pages/search.astro` | SSG | Search results page |

## API Routes

| URL Pattern | Method | Description |
|---|---|---|
| `/api/quote-request` | POST | Submit quote request |
| `/api/contact` | POST | Submit contact form |
| `/api/sample-request` | POST | Submit sample request |
| `/api/newsletter` | POST | Newsletter signup |

## Legacy URL Redirect Map

These redirects should be implemented when migrating from the old site:

| Old URL Pattern | New URL Pattern |
|---|---|
| `/index.php?option=com_virtuemart&category_id=N` | `/products/[category]/` |
| `/[product-seo-name].html` | `/products/[category]/[slug]/` |
| `/blog/post-title` | `/blog/[slug]/` |
| `/about-caplinq.html` | `/about/` |
| `/contact-us.html` | `/contact/` |

## Breadcrumb Structure

- Home → Products → [Category] → [Product]
- Home → Blog → [Post Title]
- Home → Resources → [Resource Type]
- Home → About
- Home → Contact
