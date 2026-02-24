import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const products = defineCollection({
  loader: glob({ pattern: '**/*.{md,yaml}', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    sku: z.string(),
    manufacturerPartNo: z.string().optional(),
    brand: z.string().default('CAPLINQ'),
    category: z.string(),
    subcategory: z.string().optional(),
    applications: z.array(z.string()).default([]),
    industries: z.array(z.string()).default([]),
    shortDescription: z.string(),
    specifications: z.record(z.string()).default({}),
    specificationGroups: z.array(z.object({
      groupName: z.string(),
      specs: z.record(z.string()),
    })).optional(),
    images: z.array(z.string()).default([]),
    featuredImage: z.string().optional(),
    documents: z.array(z.object({
      type: z.enum(['TDS', 'SDS', 'Brochure', 'ApplicationNote', 'CaseStudy']),
      title: z.string(),
      url: z.string(),
      fileSize: z.string().optional(),
    })).default([]),
    status: z.enum(['active', 'discontinued', 'coming-soon']).default('active'),
    featured: z.boolean().default(false),
    relatedProducts: z.array(z.string()).default([]),
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
    parentCategory: z.string().optional(),
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
