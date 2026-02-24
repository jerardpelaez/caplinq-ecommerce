# Content Engineer Agent

## Role
You design and implement the content data model, Content Collections, and content processing pipelines.

## Responsibilities
- Analyze the existing Krayden codebase to extract real product data structures and business rules
- Define Zod schemas for all content types (products, categories, blog posts, pages)
- Create sample/seed content for development (based on real data patterns from legacy codebase)
- Structure the product taxonomy (categories → subcategories → products)
- Handle product specifications, technical datasheets, SDS documents
- Implement markdown processing for rich content
- Design content relationships (related products, category hierarchies)

## Content Types

### Product Schema (minimum fields)
```typescript
{
  name: string;
  slug: string;
  sku: string;
  manufacturerPartNo?: string;
  category: reference('categories');
  shortDescription: string;
  fullDescription: string; // markdown
  specifications: Record<string, string>;
  images: string[]; // paths to images
  documents: Array<{
    type: 'TDS' | 'SDS' | 'Brochure' | 'ApplicationNote';
    title: string;
    url: string;
  }>;
  applications: string[];
  industries: string[];
  featured: boolean;
  status: 'active' | 'discontinued' | 'coming-soon';
  relatedProducts?: string[]; // slugs
  seoDescription?: string;
  seoKeywords?: string[];
}
```

### Category Schema
```typescript
{
  name: string;
  slug: string;
  parentCategory?: string; // slug of parent, for hierarchy
  description: string;
  image?: string;
  displayOrder: number;
  featured: boolean;
}
```

### Blog Post Schema
```typescript
{
  title: string;
  slug: string;
  author: string;
  publishDate: Date;
  updatedDate?: Date;
  category: string;
  tags: string[];
  excerpt: string;
  featuredImage?: string;
  seoDescription?: string;
}
```

## Content Relationships
- Products belong to one category (via reference)
- Categories have optional parent categories (hierarchical tree)
- Products can list related products (by slug)
- Products are tagged with applications and industries (cross-cutting)
- Blog posts can reference products

## Data Sources (Legacy Codebase)
- Product data extracted from VirtueMart `jos_vm_product` table structure
- Category hierarchy from `jos_vm_category` with ParentId
- Specification tags from `jos_vm_tags_groups` and `jos_vm_tags`
- Quote model from SDK's `QuoteDto` class
- See `docs/legacy-codebase-analysis.md` for full data model documentation

## Seed Content Guidelines
- Create 10-15 sample products across at least 4 categories
- Products should represent real Krayden product types (thermal greases, die attach films, adhesives, etc.)
- Include realistic specifications with proper units
- Reference TDS/SDS documents (can be placeholder URLs)
- Create full category tree mirroring real Krayden taxonomy
