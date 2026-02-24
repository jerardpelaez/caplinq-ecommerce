import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { fetchCategories, fetchProducts, fetchProductDetail } from '../src/lib/api/client';
import {
  transformCategory,
  transformProduct,
  buildCategoryMaps,
  type CategoryFrontmatter,
  type ProductFrontmatter,
} from '../src/lib/utils/transform';
import type { CategoryDto } from '../src/lib/api/types';

const CONTENT_DIR = path.resolve('src/content');
const PRODUCTS_DIR = path.join(CONTENT_DIR, 'products');
const CATEGORIES_DIR = path.join(CONTENT_DIR, 'categories');

// --- File writers ---

function writeCategoryYaml(frontmatter: CategoryFrontmatter): void {
  const filePath = path.join(CATEGORIES_DIR, `${frontmatter.slug}.yaml`);
  fs.writeFileSync(filePath, yaml.dump(frontmatter, { lineWidth: -1, quotingType: '"' }));
}

function writeProductMd(frontmatter: ProductFrontmatter, body: string): void {
  const filePath = path.join(PRODUCTS_DIR, `${frontmatter.slug}.md`);
  const yamlStr = yaml.dump(frontmatter, { lineWidth: -1, quotingType: '"' });
  fs.writeFileSync(filePath, `---\n${yamlStr}---\n\n${body}\n`);
}

// --- Main sync ---

async function syncCategories(categories: CategoryDto[]): Promise<void> {
  // Clear existing category files
  if (fs.existsSync(CATEGORIES_DIR)) {
    for (const file of fs.readdirSync(CATEGORIES_DIR)) {
      if (file.endsWith('.yaml')) {
        fs.unlinkSync(path.join(CATEGORIES_DIR, file));
      }
    }
  } else {
    fs.mkdirSync(CATEGORIES_DIR, { recursive: true });
  }

  let count = 0;
  for (const cat of categories) {
    if (!cat.isPublished) continue;

    // Write parent category
    const parentFm = transformCategory(cat);
    writeCategoryYaml(parentFm);
    count++;

    // Write subcategories
    for (const sub of cat.subCategories) {
      if (!sub.isPublished) continue;
      const subFm = transformCategory(sub, cat.alias);
      writeCategoryYaml(subFm);
      count++;
    }
  }

  console.log(`  Wrote ${count} category files`);
}

async function syncProducts(
  categories: CategoryDto[],
): Promise<void> {
  // Clear existing product files
  if (fs.existsSync(PRODUCTS_DIR)) {
    for (const file of fs.readdirSync(PRODUCTS_DIR)) {
      if (file.endsWith('.md')) {
        fs.unlinkSync(path.join(PRODUCTS_DIR, file));
      }
    }
  } else {
    fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
  }

  const categoryMaps = buildCategoryMaps(categories);

  // Paginate through all products
  const PAGE_SIZE = 100;
  let pageIndex = 0;
  let totalFetched = 0;
  let totalWritten = 0;
  let totalCount = 0;

  do {
    const page = await fetchProducts(PAGE_SIZE, pageIndex);
    totalCount = page.count;

    console.log(`  Fetching page ${pageIndex} (${page.data.length} products, ${totalCount} total)...`);

    for (const product of page.data) {
      totalFetched++;

      // Skip unpublished
      if (!product.currentStatus?.isPublished) continue;

      try {
        // Fetch full detail for each product
        const detail = await fetchProductDetail(product.id);

        const { frontmatter, body } = transformProduct(
          detail,
          product.subCategoryId,
          categoryMaps,
        );

        writeProductMd(frontmatter, body);
        totalWritten++;

        if (totalWritten % 50 === 0) {
          console.log(`    ... ${totalWritten} products written`);
        }
      } catch (err) {
        console.error(`  ERROR syncing product ${product.sku} (id=${product.id}):`, (err as Error).message);
      }
    }

    pageIndex++;
    totalFetched = pageIndex * PAGE_SIZE;
  } while (totalFetched < totalCount);

  console.log(`  Wrote ${totalWritten} product files (${totalCount} total in API)`);
}

async function main(): Promise<void> {
  console.log('Syncing catalog from Caplinq API...\n');

  // Step 1: Fetch categories
  console.log('[1/2] Syncing categories...');
  const catResponse = await fetchCategories(100);
  await syncCategories(catResponse.data);

  // Step 2: Fetch and sync products
  console.log('\n[2/2] Syncing products...');
  await syncProducts(catResponse.data);

  console.log('\nSync complete!');
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
