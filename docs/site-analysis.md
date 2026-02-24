# Krayden.com Comprehensive Site Analysis

**Date:** 2026-02-24
**Source:** https://www.caplinq.com
**Purpose:** Reference document for Astro-based e-commerce rebuild

---

## Table of Contents

1. [Company Overview](#1-company-overview)
2. [Page Inventory](#2-page-inventory)
3. [Navigation Structure](#3-navigation-structure)
4. [Product Taxonomy](#4-product-taxonomy)
5. [Content Patterns](#5-content-patterns)
6. [Interactive Features](#6-interactive-features)
7. [B2B Features](#7-b2b-features)
8. [SEO Patterns](#8-seo-patterns)
9. [Design System](#9-design-system)
10. [Technical Infrastructure](#10-technical-infrastructure)
11. [Recommendations for Rebuild](#11-recommendations-for-rebuild)

---

## 1. Company Overview

Krayden (formerly known as Krayden Corporation) is a B2B specialty chemicals and materials distributor headquartered in Europe (Netherlands), serving the electronics, semiconductor, and advanced manufacturing industries globally. The company positions itself as a "supply chain partner" offering both products and technical expertise.

**Key differentiators:**
- Specialty chemical distribution with deep technical knowledge
- E-commerce enabled B2B platform (online ordering and quoting)
- Strong focus on thermal interface materials, adhesives, encapsulants, and plastics
- Combination of online catalog, technical datasheets, and expert consultation
- Serves markets in Europe, North America, and Asia

---

## 2. Page Inventory

### 2.1 Primary Page Types

| Page Type | URL Pattern | Example | Estimated Count |
|---|---|---|---|
| Homepage | `/` | `caplinq.com` | 1 |
| Product Category | `/category-name.html` | `/thermal-interface-materials.html` | ~15-20 |
| Product Subcategory | `/category/subcategory.html` | `/thermal-greases.html` | ~40-60 |
| Product Detail (PDP) | `/product-name.html` | `/polygrease-tg-500.html` | ~200-400 |
| Blog Post | `/blog/post-slug` | `/blog/what-is-thermal-conductivity` | ~100-200 |
| Blog Index | `/blog` | `/blog` | 1 |
| About | `/about-caplinq.html` | `/about-caplinq.html` | 1 |
| Contact | `/contact-us.html` | `/contact-us.html` | 1 |
| Products Index | `/products.html` | `/products.html` | 1 |
| Static/Info Pages | `/page-name.html` | `/terms-and-conditions.html` | ~10-15 |
| Industry Pages | `/industry-name.html` | `/semiconductor-packaging.html` | ~5-10 |
| Supplier/Brand Pages | `/supplier-name.html` or similar | Various | ~10-15 |
| Cart/Quote | `/quote-request.html` or similar | Various | 1-2 |
| Search Results | `/catalogsearch/result/` | Query-based | Dynamic |
| Customer Account | `/customer/account/` | Login, register, orders | ~5 |

### 2.2 Static/Informational Pages

- `/about-caplinq.html` -- Company information, history, mission
- `/contact-us.html` -- Contact form, office addresses, phone numbers
- `/terms-and-conditions.html` -- Legal terms
- `/privacy-policy.html` -- Privacy/GDPR policy
- `/shipping-information.html` -- Shipping details and policies
- `/returns-policy.html` -- Returns and refunds
- `/sitemap.html` -- HTML sitemap
- `/careers.html` -- Job openings (if present)
- `/faq.html` -- Frequently asked questions

### 2.3 Account/Transactional Pages

- `/customer/account/login/` -- Customer login
- `/customer/account/create/` -- Registration
- `/checkout/cart/` -- Shopping cart / Quote cart
- `/quote-request` or `/checkout/` -- Quote submission flow

---

## 3. Navigation Structure

### 3.1 Header / Top Bar

```
[Top utility bar]
  - Phone number / contact info
  - Language/region selector (if applicable)
  - "My Account" link
  - Cart/Quote icon with item count

[Main Logo] .............. [Search Bar] .............. [Cart/Quote Button]

[Primary Navigation / Mega-Menu]
  Products | Industries | Resources | About | Contact
```

### 3.2 Mega-Menu Structure

The primary navigation uses a mega-menu pattern, especially for the "Products" dropdown, which expands to show the full product category hierarchy.

**Products Mega-Menu (estimated structure):**

```
Products
├── Adhesives & Sealants
│   ├── Epoxy Adhesives
│   ├── Silicone Adhesives
│   ├── UV Cure Adhesives
│   ├── Polyurethane Adhesives
│   └── Cyanoacrylate Adhesives
├── Thermal Interface Materials (TIM)
│   ├── Thermal Greases / Pastes
│   ├── Thermal Pads
│   ├── Thermal Adhesives
│   ├── Phase Change Materials
│   └── Gap Fillers
├── Encapsulants & Potting Compounds
│   ├── Epoxy Encapsulants
│   ├── Silicone Encapsulants
│   └── Polyurethane Potting
├── Conformal Coatings
│   ├── Acrylic Coatings
│   ├── Silicone Coatings
│   ├── Polyurethane Coatings
│   └── UV Cure Coatings
├── Plastics & Films
│   ├── Engineering Plastics
│   ├── Plastic Films
│   └── Release Films
├── Solder & Assembly Materials
│   ├── Solder Paste
│   ├── Solder Wire
│   ├── Flux
│   └── Underfill
└── Cleaning & Surface Preparation
    ├── Cleaning Solvents
    └── Surface Treatments
```

**Other Top-Level Menu Items:**

```
Industries
├── Semiconductor Packaging
├── Electronics Assembly
├── LED / Lighting
├── Automotive Electronics
├── Telecommunications
└── Renewable Energy

Resources / Blog
├── Blog / Articles
├── Technical Datasheets
├── Safety Data Sheets (SDS/MSDS)
├── Application Guides
└── Videos / Webinars

About
├── About Krayden
├── Our Team
├── Careers
└── News

Contact
├── Contact Form
├── Request a Quote
└── Office Locations
```

### 3.3 Breadcrumb Navigation

Breadcrumbs appear on category, subcategory, and product detail pages following this pattern:

```
Home > Products > [Category] > [Subcategory] > [Product Name]
```

Example:
```
Home > Thermal Interface Materials > Thermal Greases > PolyGrease TG-500
```

### 3.4 Footer Structure

```
[Footer - Multi-column layout]

Column 1: Products          Column 2: Company        Column 3: Support
- Adhesives                 - About Krayden          - Contact Us
- Thermal Materials         - Blog                   - Request a Quote
- Encapsulants              - Careers                - Shipping Info
- Conformal Coatings        - News                   - Returns
- Plastics & Films          - Partners               - FAQ
- Solder Materials

Column 4: Resources         Column 5: Connect
- Technical Datasheets      - LinkedIn
- SDS/MSDS Library          - Twitter
- Application Notes         - YouTube
- Blog                      - Newsletter Signup

[Bottom Bar]
  Copyright (C) Krayden Corporation | Terms & Conditions | Privacy Policy | Sitemap
```

---

## 4. Product Taxonomy

### 4.1 Top-Level Categories

| Category | Description | Key Subcategories |
|---|---|---|
| **Adhesives & Sealants** | Structural and specialty adhesives for electronics | Epoxy, Silicone, UV Cure, Polyurethane, Cyanoacrylate |
| **Thermal Interface Materials** | Heat management materials for electronics | Thermal greases, pads, adhesives, phase change, gap fillers |
| **Encapsulants & Potting Compounds** | Protection compounds for electronic components | Epoxy, Silicone, Polyurethane encapsulants |
| **Conformal Coatings** | Protective coatings for PCBs | Acrylic, Silicone, Polyurethane, UV Cure |
| **Plastics & Films** | Engineering plastics and specialty films | Engineering plastics, plastic films, release films |
| **Solder & Assembly Materials** | Soldering and PCB assembly | Solder paste, wire, flux, underfill |
| **Cleaning Materials** | Surface preparation and cleaning | Solvents, surface treatments |

### 4.2 Product Hierarchy Depth

The taxonomy follows a 3-4 level hierarchy:

```
Level 1: Product Category (e.g., "Thermal Interface Materials")
  Level 2: Product Type (e.g., "Thermal Greases")
    Level 3: Product Series/Brand (e.g., "PolyGrease Series")
      Level 4: Individual SKU/Product (e.g., "PolyGrease TG-500, 50g syringe")
```

### 4.3 Key Product Attributes

Products are characterized by a rich set of technical attributes:

- **Chemistry/Base Material:** Epoxy, Silicone, Polyurethane, Acrylic, etc.
- **Thermal Conductivity:** W/m-K rating
- **Viscosity:** cP or Pa-s
- **Cure Type:** Heat cure, UV cure, room temperature (RTV), moisture cure
- **Operating Temperature Range:** Min/Max in degrees C
- **Dielectric Strength:** kV/mm
- **Volume Resistivity:** Ohm-cm
- **Color:** Visual indicator
- **Packaging:** Syringe, cartridge, pail, drum
- **Shelf Life:** Months
- **Certifications:** UL, RoHS, REACH, halogen-free

### 4.4 Brand/Supplier Relationships

Krayden distributes products from multiple manufacturers and also has its own branded product lines:

- **Krayden Branded:** PolyGrease, PolyPhen, PolyTherm, PolyCure series
- **Third-party Brands:** Various specialty chemical manufacturers

---

## 5. Content Patterns

### 5.1 Product Detail Page (PDP) Structure

```
[Breadcrumbs]

[Product Image(s)]          [Product Title / H1]
                            [Product SKU / Part Number]
                            [Short Description]
                            [Key Specifications Table]
                              - Chemistry
                              - Thermal Conductivity
                              - Viscosity
                              - Cure Type
                              - Operating Temp Range
                            [Price / "Request Quote" Button]
                            [Add to Cart / Add to Quote]
                            [Quantity Selector]
                            [Packaging Options]

[Tabs Section]
  Tab 1: Description (detailed product description, features, benefits)
  Tab 2: Specifications (full technical data table)
  Tab 3: Documents (TDS, SDS/MSDS downloads as PDF)
  Tab 4: Applications (use cases and application notes)
  Tab 5: Reviews (if applicable)

[Related Products Section]
  - Grid of 4-6 related/complementary products

[Recently Viewed Products]
```

**Key PDP Data Fields:**
- Product name
- Part number / SKU
- Product images (1-4 images)
- Short description (1-2 sentences)
- Long description (rich HTML with features/benefits)
- Technical specifications table (key-value pairs)
- Technical Data Sheet (TDS) - PDF download
- Safety Data Sheet (SDS/MSDS) - PDF download
- Application notes
- Packaging sizes/options (with different pricing)
- Price (shown or "Request Quote")
- Availability/Stock status
- Related products
- Category/subcategory assignment
- Brand/manufacturer

### 5.2 Category Page Structure

```
[Breadcrumbs]
[Category Banner Image]
[Category Title / H1]
[Category Description (SEO content)]

[Filter Sidebar]                [Product Grid]
  - Subcategory filter            - Product cards in grid (3-4 per row)
  - Brand/Manufacturer            - Each card shows:
  - Chemistry/Material type           * Product image
  - Price range                       * Product name
  - Thermal conductivity              * Short description
  - Sort options                      * Key spec (e.g., thermal conductivity)
                                      * Price or "Request Quote"
                                      * "Add to Cart" / "View Details" button

[Pagination]
[Category SEO Content Block (bottom)]
```

### 5.3 Blog Post Structure

```
[Breadcrumbs: Home > Blog > [Category] > Post Title]

[Blog Post Title / H1]
[Author Name] | [Publication Date] | [Category Tag]
[Featured Image]

[Post Content]
  - Rich HTML content
  - Embedded images
  - Technical diagrams
  - Internal links to products
  - Comparison tables

[Author Bio Box]
[Social Share Buttons]
[Related Posts Section]
[CTA Banner - "Request a Quote" / "Contact Us"]

[Comments Section (if enabled)]
```

**Blog Content Categories:**
- Technical Guides (e.g., "What is Thermal Conductivity?")
- Product Comparisons (e.g., "Thermal Grease vs. Thermal Pad")
- Application Notes (e.g., "How to Apply Conformal Coating")
- Industry News
- Material Science Education
- How-to / Tutorial content
- FAQ-style articles

### 5.4 Blog Index Page Structure

```
[Blog Header / Hero]
[Category Filter Tabs or Sidebar]

[Blog Post Grid/List]
  - Featured/sticky post (larger card)
  - Regular post cards:
    * Featured image thumbnail
    * Title
    * Excerpt (2-3 lines)
    * Author
    * Date
    * Category tag
    * "Read More" link

[Pagination: Previous | 1 | 2 | 3 | ... | Next]
[Newsletter Signup CTA]
```

---

## 6. Interactive Features

### 6.1 Search

- **Location:** Prominent search bar in header
- **Type:** Full-text search across products, blog posts, and pages
- **Features:**
  - Autocomplete/suggestions as user types
  - Search results page with filtering
  - Results grouped by type (Products, Blog, Pages)
  - Search results show product images, names, short descriptions
- **URL Pattern:** `/catalogsearch/result/?q=search+term`

### 6.2 Product Filtering

- **Layered/faceted navigation** on category pages
- Filter attributes include:
  - Subcategory
  - Brand/Manufacturer
  - Chemistry type
  - Thermal conductivity range
  - Price range
  - Packaging type
  - Availability
- Filters use AJAX (no full page reload)
- URL may update with filter parameters

### 6.3 Cart / Quote System

Krayden uses a hybrid cart system that supports both direct purchasing and quote requests:

- **Add to Cart** button on product pages
- **Mini-cart** dropdown in header showing item count and summary
- **Cart page** at `/checkout/cart/` with:
  - Line items with quantity adjustment
  - Remove item option
  - Subtotal calculation
  - "Proceed to Checkout" or "Request Quote" buttons
- **Quote Request** flow for custom pricing, bulk orders, or products without listed prices

### 6.4 Document Downloads

- Technical Data Sheets (TDS) -- PDF downloads on product pages
- Safety Data Sheets (SDS/MSDS) -- PDF downloads on product pages
- Application guides -- PDF or blog content
- Downloads may require registration (gated content)

### 6.5 Newsletter Signup

- Email signup form in footer and/or dedicated page
- May appear as popup/modal on first visit

### 6.6 Contact Form

- Multi-field form on contact page
- Fields include: Name, Email, Company, Phone, Subject, Message
- May include dropdown for inquiry type (Quote, Technical, General)

---

## 7. B2B Features

### 7.1 Request for Quote (RFQ)

- **RFQ buttons** on products without listed prices or for bulk quantities
- **Quote cart** -- users can add multiple products to a quote request
- **Custom pricing** -- B2B buyers get account-specific pricing
- **Volume/bulk pricing** tiers shown or available upon request

### 7.2 Customer Accounts

- **Registration** for B2B accounts with company information
- **Account dashboard** with:
  - Order history
  - Quote history
  - Saved addresses
  - Reorder functionality
  - Account settings
- **Customer-specific pricing** visible after login

### 7.3 Technical Documentation

- **TDS (Technical Data Sheets)** -- Detailed product specifications as PDF
- **SDS/MSDS (Safety Data Sheets)** -- Safety and handling information
- **Certificate of Analysis (COA)** -- Available on request
- **Application Notes** -- Technical guides for product usage
- **Cross-reference tools** -- Finding equivalent products

### 7.4 Sample Requests

- Option to request product samples before bulk ordering
- Sample request form or integrated into quote system

### 7.5 Minimum Order Quantities (MOQ)

- Some products have MOQ requirements
- Displayed on product pages or available through quote system

### 7.6 Payment Terms

- B2B payment terms (Net 30, Net 60) for approved accounts
- Credit card payment for smaller orders
- Purchase order processing

---

## 8. SEO Patterns

### 8.1 URL Structure

| Page Type | URL Pattern | Example |
|---|---|---|
| Homepage | `/` | `https://www.caplinq.com` |
| Category | `/category-name.html` | `/thermal-interface-materials.html` |
| Subcategory | `/subcategory-name.html` | `/thermal-greases.html` |
| Product | `/product-name.html` | `/polygrease-tg-500.html` |
| Blog Post | `/blog/post-slug` | `/blog/what-is-thermal-conductivity` |
| Blog Index | `/blog` | `/blog` |
| Static Page | `/page-name.html` | `/about-caplinq.html` |
| Search | `/catalogsearch/result/?q=term` | `/catalogsearch/result/?q=thermal+grease` |

**URL Characteristics:**
- Flat URL structure (most pages at root level with `.html` extension)
- Hyphenated slugs for readability
- Blog uses `/blog/` prefix without `.html` extension
- All lowercase
- Keywords in URLs

### 8.2 Meta Tags Pattern

**Homepage:**
```html
<title>Krayden - Specialty Chemicals & Materials for Electronics</title>
<meta name="description" content="Krayden supplies specialty chemicals and
materials including thermal interface materials, adhesives, encapsulants,
and conformal coatings for the electronics industry." />
```

**Category Page:**
```html
<title>[Category Name] | Krayden</title>
<meta name="description" content="Browse Krayden's range of [category name]
including [subcategory 1], [subcategory 2], and more. Request a quote today." />
```

**Product Page:**
```html
<title>[Product Name] - [Category] | Krayden</title>
<meta name="description" content="[Product Name] is a [brief description]
with [key spec]. Available in [packaging]. Order online or request a quote." />
```

**Blog Post:**
```html
<title>[Blog Post Title] | Krayden Blog</title>
<meta name="description" content="[First 150 chars of post or custom excerpt]" />
```

### 8.3 Structured Data / Schema.org

Expected schema markup:
- `Organization` -- Company details on homepage
- `Product` -- Product pages with name, description, image, price, availability
- `BreadcrumbList` -- Breadcrumb navigation
- `Article` / `BlogPosting` -- Blog posts with author, date, publisher
- `WebSite` -- Site-level search action
- `LocalBusiness` -- Contact page with address, phone

### 8.4 Other SEO Elements

- **Canonical URLs** on all pages
- **Hreflang tags** (if multi-language)
- **XML Sitemap** at `/sitemap.xml`
- **Robots.txt** at `/robots.txt`
- **Open Graph tags** for social sharing
- **Alt text** on product images
- **Internal linking** -- Products link to related products; blog posts link to relevant product pages
- **H1 tags** -- One per page, keyword-rich
- **SEO content blocks** -- Bottom-of-page content on category pages for search optimization

---

## 9. Design System

### 9.1 Color Palette

| Color | Usage | Approximate Value |
|---|---|---|
| **Primary Blue** | Logo, primary buttons, links, header accents | `#0066B3` or similar corporate blue |
| **Dark Blue/Navy** | Header background, footer background | `#003366` or `#1a2a3a` |
| **White** | Page backgrounds, card backgrounds | `#FFFFFF` |
| **Light Gray** | Section backgrounds, borders, dividers | `#F5F5F5` / `#E0E0E0` |
| **Dark Gray/Charcoal** | Body text, headings | `#333333` / `#444444` |
| **Accent Orange/Green** | CTA buttons, sale badges, highlights | `#FF6600` or `#4CAF50` |
| **Red** | Error states, required field indicators | `#CC0000` |

### 9.2 Typography

- **Headings:** Sans-serif font family (likely Open Sans, Roboto, or similar)
  - H1: ~28-36px, bold
  - H2: ~24-28px, bold
  - H3: ~20-22px, semi-bold
  - H4: ~18px, semi-bold
- **Body text:** 14-16px, regular weight, same sans-serif family
- **Navigation text:** 14px, semi-bold or bold
- **Product specs:** May use monospace or tabular figures for data alignment
- **Line height:** ~1.5 for body text, ~1.2-1.3 for headings

### 9.3 Component Patterns

#### Buttons

```
[Primary Button]   -- Blue background, white text, rounded corners
                      Used for: "Add to Cart", "Request Quote", "Submit"

[Secondary Button] -- White/outlined, blue border/text
                      Used for: "Learn More", "View Details"

[CTA Button]       -- Orange/green background, white text
                      Used for: Prominent calls to action

[Link Button]      -- Text only with underline, blue color
                      Used for: "Read More", breadcrumb links
```

#### Cards

**Product Card:**
```
┌─────────────────────────┐
│  [Product Image]        │
│                         │
│  Product Name           │
│  Short description...   │
│  Key Spec: Value        │
│                         │
│  $XX.XX / unit          │
│  [Add to Cart]          │
└─────────────────────────┘
```

**Blog Post Card:**
```
┌─────────────────────────┐
│  [Featured Image]       │
│                         │
│  [Category Tag]         │
│  Blog Post Title        │
│  Excerpt text here...   │
│                         │
│  Author | Date          │
│  [Read More ->]         │
└─────────────────────────┘
```

#### Tables

- Used extensively for product specifications
- Alternating row colors (zebra striping)
- Left-aligned labels, right-aligned values
- Responsive -- may collapse or scroll on mobile

#### Forms

- Label above input pattern
- Required fields marked with asterisk (*)
- Inline validation messages
- Full-width inputs on mobile
- Submit button in primary color

### 9.4 Layout Patterns

- **Max content width:** ~1200-1280px, centered
- **Grid system:** 12-column grid (likely Bootstrap or similar)
- **Product grid:** 3-4 columns on desktop, 2 on tablet, 1 on mobile
- **Sidebar + Content:** Used on category pages (sidebar filters + product grid)
- **Full-width sections:** Hero banners, footer
- **Spacing scale:** Consistent spacing (8px, 16px, 24px, 32px, 48px)

### 9.5 Iconography

- Cart/shopping bag icon in header
- Search (magnifying glass) icon
- User/account icon
- Download icon for PDFs
- Arrow icons for navigation
- Social media icons in footer (LinkedIn, Twitter/X, YouTube)
- Checkmark icons for feature lists

### 9.6 Responsive Behavior

- **Breakpoints:** Typical at ~768px (tablet), ~1024px (desktop)
- **Mobile:** Hamburger menu, stacked layout, full-width elements
- **Tablet:** 2-column product grid, collapsible filters
- **Desktop:** Full mega-menu, 3-4 column grid, sidebar visible

---

## 10. Technical Infrastructure

### 10.1 Current Platform (caplinq.com)

- **Platform:** Magento 2 (Adobe Commerce) -- based on URL patterns (`.html` extensions, `/catalogsearch/`, `/customer/account/`)
- **Server-rendered** HTML with JavaScript enhancements
- **CDN:** Likely using a CDN for static assets and images
- **SSL:** HTTPS enabled

### 10.2 Key Integrations

- **Payment gateway:** Credit card processing
- **ERP integration:** For inventory and order management
- **Email marketing:** Newsletter and transactional emails
- **Analytics:** Google Analytics / Google Tag Manager
- **Search:** Native Magento search or Elasticsearch
- **PDF generation:** For datasheets and quotes

### 10.3 Planned Rebuild Stack (This Project)

Based on `package.json`:
- **Framework:** Astro 5.x (static site generation with islands architecture)
- **UI Components:** Svelte (via `@astrojs/svelte`)
- **Styling:** Tailwind CSS 4.x (via `@tailwindcss/vite`)
- **Content:** MDX support (via `@astrojs/mdx`)
- **State Management:** Nanostores (with persistent storage)
- **Search:** Fuse.js (client-side fuzzy search)
- **Validation:** Zod schemas
- **SEO:** Astro Sitemap plugin
- **Language:** TypeScript (strict mode)

---

## 11. Recommendations for Rebuild

### 11.1 Content Architecture

```
src/
├── content/                    # Astro Content Collections
│   ├── products/               # Product data (MDX or JSON)
│   ├── categories/             # Category definitions
│   ├── blog/                   # Blog posts (MDX)
│   ├── datasheets/             # Technical document metadata
│   └── pages/                  # Static page content
├── pages/
│   ├── index.astro             # Homepage
│   ├── products.astro          # Products index
│   ├── [category].astro        # Dynamic category pages
│   ├── [product].astro         # Dynamic product pages
│   ├── blog/
│   │   ├── index.astro         # Blog index
│   │   └── [...slug].astro     # Blog post pages
│   ├── about-caplinq.astro     # About page
│   ├── contact-us.astro        # Contact page
│   └── [...slug].astro         # Catch-all for static pages
├── components/
│   ├── layout/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── MegaMenu.svelte     # Interactive mega-menu (Svelte island)
│   │   └── Breadcrumbs.astro
│   ├── product/
│   │   ├── ProductCard.astro
│   │   ├── ProductGrid.astro
│   │   ├── ProductSpecs.astro
│   │   ├── ProductFilter.svelte # Interactive filters (Svelte island)
│   │   └── AddToQuote.svelte   # Interactive cart (Svelte island)
│   ├── blog/
│   │   ├── BlogCard.astro
│   │   └── BlogGrid.astro
│   ├── search/
│   │   └── SearchBar.svelte    # Fuse.js search (Svelte island)
│   └── ui/
│       ├── Button.astro
│       ├── Card.astro
│       ├── Table.astro
│       └── FormField.astro
├── layouts/
│   ├── BaseLayout.astro
│   ├── ProductLayout.astro
│   └── BlogLayout.astro
└── stores/
    ├── cart.ts                 # Quote cart (nanostores)
    └── search.ts               # Search state
```

### 11.2 Key Data Models

**Product Schema (Zod):**
```typescript
const ProductSchema = z.object({
  name: z.string(),
  slug: z.string(),
  sku: z.string(),
  category: z.string(),
  subcategory: z.string(),
  brand: z.string(),
  shortDescription: z.string(),
  description: z.string(),       // Rich text / MDX
  images: z.array(z.string()),
  specs: z.record(z.string()),   // Key-value technical specs
  thermalConductivity: z.number().optional(),
  chemistry: z.string().optional(),
  cureType: z.string().optional(),
  operatingTempMin: z.number().optional(),
  operatingTempMax: z.number().optional(),
  packaging: z.array(z.object({
    size: z.string(),
    unit: z.string(),
    price: z.number().optional(),
    sku: z.string(),
  })),
  documents: z.object({
    tds: z.string().optional(),   // TDS PDF URL
    sds: z.string().optional(),   // SDS PDF URL
    coa: z.string().optional(),
  }),
  relatedProducts: z.array(z.string()),  // Slugs
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});
```

**Blog Post Schema:**
```typescript
const BlogPostSchema = z.object({
  title: z.string(),
  slug: z.string(),
  author: z.string(),
  publishDate: z.date(),
  updatedDate: z.date().optional(),
  category: z.string(),
  tags: z.array(z.string()),
  excerpt: z.string(),
  featuredImage: z.string(),
  relatedProducts: z.array(z.string()).optional(),
});
```

### 11.3 Priority Pages for Rebuild

1. **Homepage** -- Hero, featured categories, featured products, value propositions
2. **Product Category Pages** -- Filterable product grid with sidebar
3. **Product Detail Pages** -- Full specs, documents, quote functionality
4. **Blog Index + Posts** -- Content marketing / SEO
5. **Contact / Quote Request** -- Lead generation
6. **About Page** -- Company credibility
7. **Search** -- Fuse.js powered client-side search
8. **Cart/Quote System** -- Nanostores-based quote builder

### 11.4 SEO Migration Considerations

- Maintain `.html` extensions in URLs for backward compatibility, or implement 301 redirects
- Preserve all existing meta titles and descriptions
- Implement proper canonical URLs
- Generate XML sitemap via `@astrojs/sitemap`
- Implement structured data (JSON-LD) for products and articles
- Ensure breadcrumb markup is present on all deep pages
- Pre-render all pages (SSG) for optimal crawlability

### 11.5 Performance Targets

- **Lighthouse Performance Score:** 95+
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Total Blocking Time:** < 200ms
- **Cumulative Layout Shift:** < 0.1
- Leverage Astro's zero-JS-by-default with Svelte islands only for interactive components

---

## Appendix A: URL Mapping (Old to New)

| Old URL Pattern | New Astro Route | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` | Homepage |
| `/products.html` | `src/pages/products.astro` | Products index |
| `/[category].html` | `src/pages/[category].astro` | Category pages |
| `/[product].html` | `src/pages/products/[slug].astro` | Product detail |
| `/blog` | `src/pages/blog/index.astro` | Blog index |
| `/blog/[slug]` | `src/pages/blog/[...slug].astro` | Blog posts |
| `/about-caplinq.html` | `src/pages/about-caplinq.astro` | About page |
| `/contact-us.html` | `src/pages/contact-us.astro` | Contact page |

## Appendix B: Content Migration Checklist

- [ ] Export all product data (name, SKU, specs, descriptions, images)
- [ ] Export all product category hierarchy
- [ ] Download all TDS and SDS PDFs
- [ ] Export all product images (multiple resolutions)
- [ ] Export all blog posts (title, content, images, metadata)
- [ ] Map all internal links in blog content to new URL structure
- [ ] Export customer testimonials/reviews if present
- [ ] Document all 301 redirects needed
- [ ] Export sitemap for reference
- [ ] Capture all meta titles and descriptions

## Appendix C: Third-Party Services to Evaluate

| Service | Purpose | Options |
|---|---|---|
| **Headless CMS** | Product content management | Contentful, Sanity, Strapi |
| **Search** | Product search | Fuse.js (in-place), Algolia, Meilisearch |
| **Forms** | Contact/quote forms | Formspree, Netlify Forms, custom API |
| **Email** | Transactional + marketing | SendGrid, Mailchimp, Resend |
| **Analytics** | Traffic and behavior | Google Analytics 4, Plausible, Fathom |
| **Hosting** | Static site deployment | Netlify, Vercel, Cloudflare Pages |
| **Image CDN** | Optimized image delivery | Cloudinary, imgix, Astro Image |
| **PDF Viewer** | Datasheet viewing | Browser native, PDF.js |

---

*This analysis is based on publicly available information about caplinq.com. Some details may need verification against the live site. Specific page counts, exact color values, and detailed content inventories should be validated during the content migration phase.*
