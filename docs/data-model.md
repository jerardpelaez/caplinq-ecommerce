# Data Model Documentation

## Content Collections Overview

All structured content lives in `src/content/` and is defined in `src/content.config.ts` using Zod schemas.

## Collections

### Products (`src/content/products/`)

**Format**: Markdown files with YAML frontmatter
**File pattern**: `*.md` or `*.yaml`

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | Product display name |
| slug | string | Yes | URL-safe identifier |
| sku | string | Yes | Stock keeping unit |
| manufacturerPartNo | string | No | Manufacturer's part number |
| brand | string | No | Brand (default: "Krayden") |
| category | string | Yes | Category slug reference |
| subcategory | string | No | Subcategory slug |
| applications | string[] | No | Application tags |
| industries | string[] | No | Industry tags |
| shortDescription | string | Yes | One-line product summary |
| specifications | Record<string, string> | No | Key-value spec pairs |
| specificationGroups | Array | No | Grouped specifications |
| images | string[] | No | Image paths |
| featuredImage | string | No | Main product image |
| documents | Array | No | TDS, SDS, brochures |
| status | enum | No | active / discontinued / coming-soon |
| featured | boolean | No | Homepage featured flag |
| relatedProducts | string[] | No | Related product slugs |
| seoTitle | string | No | Custom SEO title |
| seoDescription | string | No | Custom meta description |
| seoKeywords | string[] | No | SEO keywords |

**Body**: Markdown content for full product description.

### Categories (`src/content/categories/`)

**Format**: YAML files only (no markdown body)
**File pattern**: `*.yaml`

| Field | Type | Required | Description |
|---|---|---|---|
| name | string | Yes | Category display name |
| slug | string | Yes | URL-safe identifier |
| parentCategory | string | No | Parent category slug (for hierarchy) |
| description | string | Yes | Short category description |
| longDescription | string | No | Extended description |
| image | string | No | Category image path |
| icon | string | No | Category icon identifier |
| displayOrder | number | No | Sort order (default: 0) |
| featured | boolean | No | Show on homepage |
| seoTitle | string | No | Custom SEO title |
| seoDescription | string | No | Custom meta description |

### Blog Posts (`src/content/blog/`)

**Format**: Markdown files with YAML frontmatter
**File pattern**: `*.md`

| Field | Type | Required | Description |
|---|---|---|---|
| title | string | Yes | Post title |
| slug | string | Yes | URL-safe identifier |
| author | string | Yes | Author name |
| publishDate | date | Yes | Publication date |
| updatedDate | date | No | Last updated date |
| category | string | Yes | Blog category |
| tags | string[] | No | Post tags |
| excerpt | string | Yes | Short excerpt for listings |
| featuredImage | string | No | Featured image path |
| seoDescription | string | No | Custom meta description |
| relatedProducts | string[] | No | Related product slugs |
| draft | boolean | No | Draft flag (default: false) |

**Body**: Markdown content for full blog post.

## Relationships

```
Category (parent)
  └── Category (child, via parentCategory)
        └── Product (via category field)
              ├── Related Products (via relatedProducts slugs)
              ├── Applications (string tags)
              └── Industries (string tags)

Blog Post
  └── Related Products (via relatedProducts slugs)
```

## Shared State (Nanostores)

### Quote Store (`src/lib/stores/cart.ts`)
- `quoteItems`: persistentMap — product SKUs to serialized QuoteItem objects
- `quoteItemCount`: atom — derived count of items

### Search Store (`src/lib/stores/search.ts`)
- `searchQuery`: atom — current search text
- `searchResults`: atom — search result array
- `isSearchOpen`: atom — search UI visibility
- `isSearching`: atom — loading state
