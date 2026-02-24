/** Paginated response wrapper used by all list endpoints */
export interface PaginatedResponse<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}

/** Image from product detail/list endpoints */
export interface ImageDetailDto {
  id: number;
  name: string;           // CDN path, e.g. "products/PTFE3S_4ad04c33d484c.jpg"
  title: string | null;
  description: string | null;
  sortOrder: number;
  isMain: boolean;
}

/** Specification property (PropertyTag variant) */
export interface SpecPropertyTagDto {
  type: 'PropertyTag';
  id: number;
  name: string;
  value: string;
  valueFormatting: string;
  unit: string;
  testingMethod: string | null;
}

/** Specification property (PropertyGroup variant) */
export interface SpecPropertyGroupDto {
  type: 'PropertyGroup';
  id: number;
  name: string;
  sharedTestingMethod: string | null;
  tags: SpecPropertyTagDto[];
}

export type SpecPropertyDto = SpecPropertyTagDto | SpecPropertyGroupDto;

/** Specification section grouping properties */
export interface SpecificationSectionDto {
  id: number;
  sectionName: string;
  properties: SpecPropertyDto[];
}

/** File/document attached to a product */
export interface FileDto {
  id: number;
  fileName: string;
  displayName: string;
  extension: string;
  type: string;
  path: string;
  categoryId: number;      // 1=TDS, 2=SDS, etc.
  access: number;
  published: boolean;
  createdDate: string;
  language: { id: number; name: string };
  manufacturerId: string;
}

/** Product status */
export interface ProductStatusDto {
  id: number;
  name: string;
  isPublished: boolean;
  canBeOrdered: boolean;
  sortOrder: number;
  types: string[];
}

/** Subcategory within a category */
export interface SubCategoryDto {
  id: number;
  name: string;
  alias: string;
  index: number;
  isPublished: boolean;
}

/** Top-level category with nested subcategories */
export interface CategoryDto {
  id: number;
  name: string;
  alias: string;
  index: number;
  isPublished: boolean;
  subCategories: SubCategoryDto[];
}

/** Product in the list endpoint (no description/shortDescription) */
export interface WebsiteProductDto {
  id: number;
  sku: string;
  name: string;
  subCategoryId: number;
  sellingPoints: string[];
  images: ImageDetailDto[];
  childProducts: unknown[];
  specifications: SpecificationSectionDto[];
  marketingTags: string[];
  currentStatus: ProductStatusDto;
  supplierId: string | null;
  type: string;
  shelfLifeInDays: number;
  publishedManufacturerId: string;
  priceVisibleOnCategoryPage: unknown;
  availabilityVisibleOnCategoryPage: unknown;
  availabilityTextOnCategoryPage: string | null;
  harmonizationCodes: unknown[];
  logistics: unknown;
}

/** Product detail endpoint (includes descriptions, category, files) */
export interface WebsiteProductDetailDto {
  id: number;
  sku: string;
  name: string;
  isCatalog: boolean;
  shortDescription: string;      // HTML
  description: string;           // HTML
  category: { id: number; name: string };
  sellingPoints: string[];
  files: FileDto[];
  images: ImageDetailDto[];
  specifications: SpecificationSectionDto[];
  attributes: unknown[];
  childProducts: unknown[];
  currentStatus: ProductStatusDto;
  supplierId: string | null;
  type: string;
  shelfLifeInDays: number;
  publishedManufacturerId: string;
  harmonizationCodes: unknown[];
  logistics: unknown;
}
