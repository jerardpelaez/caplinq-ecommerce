# Content Modeling Skill

## Product Data Model

### Core Product Fields (from Legacy Analysis)
The legacy Krayden system (VirtueMart/Joomla) tracked these fields:
- Product ID, Name, SKU, Manufacturer Part Number
- Short Description, Full Description (HTML/markdown)
- Category (hierarchical — parent category → subcategory)
- Specifications/Tags (grouped technical properties with values and units)
- Images (multiple per product)
- Documents (TDS, SDS, Brochures, Application Notes)
- Applications (what the product is used for)
- Industries (which industries use this product)
- Status (active, discontinued, coming-soon)
- Related products
- Supplier/Brand information
- Stock availability (by warehouse: CA, NL, US)

### Improved Zod Schema for New System
```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const products = defineCollection({
  loader: glob({ pattern: '**/*.{md,yaml}', base: './src/content/products' }),
  schema: z.object({
    // Identity
    name: z.string(),
    slug: z.string(),
    sku: z.string(),
    manufacturerPartNo: z.string().optional(),
    brand: z.string().default('Krayden'),

    // Classification
    category: z.string(), // category slug
    subcategory: z.string().optional(),
    applications: z.array(z.string()).default([]),
    industries: z.array(z.string()).default([]),

    // Descriptions
    shortDescription: z.string(),
    // fullDescription comes from markdown body

    // Technical Specifications
    specifications: z.record(z.string()).default({}),
    specificationGroups: z.array(z.object({
      groupName: z.string(),
      specs: z.record(z.string()),
    })).optional(),

    // Media
    images: z.array(z.string()).default([]),
    featuredImage: z.string().optional(),

    // Documents
    documents: z.array(z.object({
      type: z.enum(['TDS', 'SDS', 'Brochure', 'ApplicationNote', 'CaseStudy']),
      title: z.string(),
      url: z.string(),
      fileSize: z.string().optional(),
    })).default([]),

    // Status & Visibility
    status: z.enum(['active', 'discontinued', 'coming-soon']).default('active'),
    featured: z.boolean().default(false),

    // Relationships
    relatedProducts: z.array(z.string()).default([]), // slugs

    // SEO
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).default([]),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/categories' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    parentCategory: z.string().optional(), // parent slug
    description: z.string(),
    longDescription: z.string().optional(),
    image: z.string().optional(),
    icon: z.string().optional(),
    displayOrder: z.number().default(0),
    featured: z.boolean().default(false),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    author: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    excerpt: z.string(),
    featuredImage: z.string().optional(),
    seoDescription: z.string().optional(),
    relatedProducts: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { products, categories, blog };
```

## Product Taxonomy (from Legacy Krayden)

### Category Hierarchy
```
Specialty Chemicals & Materials
├── Thermal Interface Materials
│   ├── Thermal Greases & Pastes
│   ├── Thermal Pads & Gap Fillers
│   ├── Phase Change Materials
│   └── Thermally Conductive Adhesives
├── Die Attach Materials
│   ├── Die Attach Films
│   ├── Die Attach Pastes
│   └── Sintering Materials
├── Adhesives & Sealants
│   ├── Epoxy Adhesives
│   ├── Silicone Adhesives
│   ├── UV-Cure Adhesives
│   └── Conformal Coatings
├── Semiconductor & PCB Assembly
│   ├── Underfill Materials
│   ├── Glob Top Encapsulants
│   ├── Solder Pastes
│   └── Flux Materials
└── Specialty Plastics
    ├── PEEK
    ├── PPS
    ├── Polyimide Films
    └── Engineering Plastics
```

### Industry Tags
- Electronics & Semiconductor
- Automotive
- Aerospace & Defense
- Telecommunications
- Medical Devices
- LED & Lighting
- Power Electronics
- Consumer Electronics
- Industrial Manufacturing
- Renewable Energy

### Application Tags
- Thermal Management
- Die Attach
- Encapsulation
- Underfill
- Conformal Coating
- Bonding & Assembly
- Potting & Sealing
- Surface Protection
- EMI/RFI Shielding
- Wire Bonding

## Content File Formats

### Product File (YAML frontmatter + Markdown body)
```yaml
# src/content/products/linqtherm-tpg-800.md
---
name: "LinQTherm TPG-800"
slug: "linqtherm-tpg-800"
sku: "LQ-TPG-800"
manufacturerPartNo: "TPG-800"
brand: "Krayden"
category: "thermal-greases-pastes"
applications:
  - Thermal Management
  - Heat Sink Attachment
industries:
  - Electronics & Semiconductor
  - Power Electronics
shortDescription: "High-performance thermal grease with 8.0 W/mK thermal conductivity"
specifications:
  "Thermal Conductivity": "8.0 W/mK"
  "Viscosity": "85 Pa·s"
  "Operating Temperature": "-40°C to 200°C"
  "Density": "2.5 g/cm³"
  "Color": "Gray"
images:
  - /images/products/linqtherm-tpg-800-main.jpg
documents:
  - type: TDS
    title: "LinQTherm TPG-800 Technical Data Sheet"
    url: /documents/tds/linqtherm-tpg-800-tds.pdf
  - type: SDS
    title: "LinQTherm TPG-800 Safety Data Sheet"
    url: /documents/sds/linqtherm-tpg-800-sds.pdf
featured: true
status: active
relatedProducts:
  - linqtherm-tpg-600
  - linqtherm-tcp-100
---

## Product Description

LinQTherm TPG-800 is a premium thermal grease designed for...
```

### Category File (YAML only)
```yaml
# src/content/categories/thermal-greases-pastes.yaml
name: "Thermal Greases & Pastes"
slug: "thermal-greases-pastes"
parentCategory: "thermal-interface-materials"
description: "High-performance thermal greases and pastes for heat transfer applications"
displayOrder: 1
featured: true
seoDescription: "Browse Krayden's range of thermal greases and pastes with conductivities from 1 to 12 W/mK"
```

## Content Query Patterns

### Build Category Tree
```typescript
// src/lib/utils/categories.ts
export interface CategoryNode {
  slug: string;
  name: string;
  children: CategoryNode[];
}

export function buildCategoryTree(categories: any[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  // Create nodes
  for (const cat of categories) {
    map.set(cat.data.slug, { ...cat.data, children: [] });
  }

  // Build tree
  for (const cat of categories) {
    const node = map.get(cat.data.slug)!;
    if (cat.data.parentCategory && map.has(cat.data.parentCategory)) {
      map.get(cat.data.parentCategory)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots.sort((a, b) => a.name.localeCompare(b.name));
}
```

### Get Products with Category Info
```astro
---
import { getCollection } from 'astro:content';

const products = await getCollection('products');
const categories = await getCollection('categories');

const categoryMap = new Map(categories.map(c => [c.data.slug, c.data]));

const enrichedProducts = products.map(p => ({
  ...p,
  categoryName: categoryMap.get(p.data.category)?.name ?? 'Unknown',
}));
---
```
