import type {
  CategoryDto,
  SubCategoryDto,
  WebsiteProductDetailDto,
  SpecificationSectionDto,
  SpecPropertyDto,
  FileDto,
} from '../api/types';
import { getCdnImageUrl, getMainImageName } from './images';

// --- Category transform ---

export interface CategoryFrontmatter {
  apiId: number;
  name: string;
  slug: string;
  parentCategory?: string;
  description: string;
  displayOrder: number;
  featured: boolean;
}

export function transformCategory(
  cat: CategoryDto | SubCategoryDto,
  parentAlias?: string,
): CategoryFrontmatter {
  return {
    apiId: cat.id,
    name: cat.name,
    slug: cat.alias,
    ...(parentAlias ? { parentCategory: parentAlias } : {}),
    description: cat.name, // API has no description field; use name as fallback
    displayOrder: cat.index,
    featured: false,
  };
}

// --- Product transform ---

export interface ProductFrontmatter {
  apiId: number;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category: string;
  subcategory?: string;
  sellingPoints: string[];
  shortDescription: string;
  specifications: Record<string, string>;
  specificationGroups?: Array<{ groupName: string; specs: Record<string, string> }>;
  images: string[];
  featuredImage?: string;
  documents: Array<{ type: string; title: string; url: string }>;
  status: string;
  featured: boolean;
  relatedProducts: string[];
}

/**
 * Build lookup maps from categories response for resolving product category/subcategory.
 * Returns:
 *   subIdToAlias — maps subcategory ID to its alias
 *   subIdToParentAlias — maps subcategory ID to parent category alias
 *   catIdToAlias — maps parent category ID to its alias
 */
export function buildCategoryMaps(categories: CategoryDto[]) {
  const subIdToAlias = new Map<number, string>();
  const subIdToParentAlias = new Map<number, string>();
  const catIdToAlias = new Map<number, string>();

  for (const cat of categories) {
    catIdToAlias.set(cat.id, cat.alias);
    for (const sub of cat.subCategories) {
      subIdToAlias.set(sub.id, sub.alias);
      subIdToParentAlias.set(sub.id, cat.alias);
    }
  }

  return { subIdToAlias, subIdToParentAlias, catIdToAlias };
}

export function transformProduct(
  detail: WebsiteProductDetailDto,
  subCategoryId: number,
  categoryMaps: ReturnType<typeof buildCategoryMaps>,
): { frontmatter: ProductFrontmatter; body: string } {
  const { subIdToAlias, subIdToParentAlias, catIdToAlias } = categoryMaps;

  // Resolve category slug: use subcategory alias if available, otherwise parent category alias
  const subcategoryAlias = subIdToAlias.get(subCategoryId);
  const parentAlias = subIdToParentAlias.get(subCategoryId) ?? catIdToAlias.get(detail.category.id);
  const categorySlug = subcategoryAlias ?? parentAlias ?? String(detail.category.id);

  // Slug from SKU
  const slug = detail.sku.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Images → CDN URLs
  const images = detail.images
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(img => getCdnImageUrl(img.name, 800));

  // Featured image
  const mainImageName = getMainImageName(detail.images);
  const featuredImage = mainImageName ? getCdnImageUrl(mainImageName, 400) : undefined;

  // Specifications → flat record + grouped
  const { flatSpecs, groups } = transformSpecifications(detail.specifications);

  // Files → documents
  const documents = transformFiles(detail.files);

  // Short description: strip HTML tags for plain text
  const shortDescription = stripHtml(detail.shortDescription).trim();

  // Body: use the HTML description converted to basic markdown
  const body = htmlToBasicMarkdown(detail.description);

  // Status mapping
  const status = detail.currentStatus?.isPublished ? 'active' : 'discontinued';

  const frontmatter: ProductFrontmatter = {
    apiId: detail.id,
    name: detail.name,
    slug,
    sku: detail.sku,
    brand: 'CAPLINQ',
    category: categorySlug,
    ...(subcategoryAlias && parentAlias && subcategoryAlias !== parentAlias
      ? { subcategory: subcategoryAlias }
      : {}),
    sellingPoints: detail.sellingPoints ?? [],
    shortDescription: shortDescription || detail.name,
    specifications: flatSpecs,
    ...(groups.length > 0 ? { specificationGroups: groups } : {}),
    images,
    ...(featuredImage ? { featuredImage } : {}),
    documents,
    status,
    featured: false,
    relatedProducts: [],
  };

  return { frontmatter, body };
}

// --- Helpers ---

function transformSpecifications(sections: SpecificationSectionDto[]): {
  flatSpecs: Record<string, string>;
  groups: Array<{ groupName: string; specs: Record<string, string> }>;
} {
  const flatSpecs: Record<string, string> = {};
  const groups: Array<{ groupName: string; specs: Record<string, string> }> = [];

  for (const section of sections) {
    const groupSpecs: Record<string, string> = {};

    for (const prop of section.properties) {
      const entries = flattenProperty(prop);
      for (const [name, value] of entries) {
        if (value) {
          flatSpecs[name] = value;
          groupSpecs[name] = value;
        }
      }
    }

    if (Object.keys(groupSpecs).length > 0) {
      groups.push({ groupName: section.sectionName, specs: groupSpecs });
    }
  }

  return { flatSpecs, groups };
}

function flattenProperty(prop: SpecPropertyDto): Array<[string, string]> {
  if (prop.type === 'PropertyTag') {
    const val = prop.value
      ? (prop.unit ? `${prop.value} ${prop.unit}`.trim() : prop.value)
      : '';
    return [[prop.name, val]];
  }

  // PropertyGroup: flatten its tags
  return prop.tags.map(tag => {
    const val = tag.value
      ? (tag.unit ? `${tag.value} ${tag.unit}`.trim() : tag.value)
      : '';
    return [tag.name, val] as [string, string];
  });
}

const FILE_CATEGORY_MAP: Record<number, string> = {
  1: 'TDS',
  2: 'SDS',
  3: 'Brochure',
  4: 'ApplicationNote',
  5: 'CaseStudy',
  6: 'Brochure', // tech bulletins → brochure
};

function transformFiles(files: FileDto[]): Array<{ type: string; title: string; url: string }> {
  return files
    .filter(f => f.published)
    .map(f => ({
      type: FILE_CATEGORY_MAP[f.categoryId] ?? 'TDS',
      title: f.displayName || f.fileName,
      url: `https://files.caplinq.com/${f.fileName}`,
    }));
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<\/li>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function htmlToBasicMarkdown(html: string): string {
  if (!html) return '';

  return html
    // Headings
    .replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (_m, level, content) => {
      return '\n' + '#'.repeat(Number(level)) + ' ' + stripHtml(content) + '\n';
    })
    // Lists
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, (_m, content) => `- ${stripHtml(content)}\n`)
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, (_m, content) => `\n${stripHtml(content)}\n`)
    // Line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    // Bold/italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    // Strip remaining tags
    .replace(/<[^>]*>/g, '')
    // Entity decode
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
