export interface Product {
  name: string;
  slug: string;
  sku: string;
  manufacturerPartNo?: string;
  brand: string;
  category: string;
  subcategory?: string;
  applications: string[];
  industries: string[];
  shortDescription: string;
  specifications: Record<string, string>;
  specificationGroups?: Array<{
    groupName: string;
    specs: Record<string, string>;
  }>;
  images: string[];
  featuredImage?: string;
  documents: ProductDocument[];
  status: 'active' | 'discontinued' | 'coming-soon';
  featured: boolean;
  relatedProducts: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
}

export interface ProductDocument {
  type: 'TDS' | 'SDS' | 'Brochure' | 'ApplicationNote' | 'CaseStudy';
  title: string;
  url: string;
  fileSize?: string;
}

export interface Category {
  name: string;
  slug: string;
  parentCategory?: string;
  description: string;
  longDescription?: string;
  image?: string;
  icon?: string;
  displayOrder: number;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

export interface SearchResult {
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  sku: string;
  score: number;
}
