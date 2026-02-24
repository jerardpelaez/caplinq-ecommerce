/**
 * Image optimization utilities for Krayden B2B ecommerce.
 *
 * Provides responsive image sizing helpers and placeholder image
 * generation for products without uploaded images.
 */

/**
 * Generate responsive image sizes attribute for product images.
 *
 * Uses a mobile-first breakpoint strategy:
 * - Mobile (<=640px): full viewport width
 * - Tablet (<=1024px): half viewport width (2-column grid)
 * - Desktop: one-third viewport width (3-column grid)
 */
export function productImageSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
}

/**
 * Generate responsive image sizes attribute for product detail pages.
 *
 * Product detail pages show a larger hero image:
 * - Mobile (<=640px): full viewport width
 * - Tablet (<=1024px): 66% viewport width
 * - Desktop: 50% viewport width
 */
export function productDetailImageSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw';
}

/**
 * Generate srcset-friendly image widths for responsive images.
 *
 * These widths align with common device resolutions and the
 * product grid breakpoints defined in the layout.
 */
export const IMAGE_WIDTHS = [320, 640, 960, 1280] as const;

/**
 * Get placeholder image URL for products without images.
 *
 * Returns the path to a lightweight SVG placeholder that uses
 * Krayden brand colors and maintains the standard product
 * image aspect ratio (4:3).
 *
 * @param _productName - Product name (reserved for future per-product placeholders)
 * @returns Path to the placeholder SVG image
 */
export function getPlaceholderImage(_productName: string): string {
  return '/images/placeholder-product.svg';
}

// CDN URL builders for Krayden product images (backend CDN URLs unchanged)
const IMAGE_CDN_BASE = 'https://images.caplinq.com/';
const CLOUDFLARE_CDN_BASE = 'https://www.caplinq.com/cdn-cgi/image/';

export function getFullImageUrl(imageName: string): string {
  return `${IMAGE_CDN_BASE}${imageName}`;
}

export function getCdnImageUrl(imageName: string, width: number, height?: number): string {
  const dims = height ? `width=${width},height=${height}` : `width=${width}`;
  return `${CLOUDFLARE_CDN_BASE}${dims},quality=75,format=auto/${IMAGE_CDN_BASE}${imageName}`;
}

export function getMainImageName(images: Array<{ name: string; isMain: boolean; sortOrder: number }>): string | undefined {
  if (images.length === 0) return undefined;
  const main = images.find(img => img.isMain);
  if (main) return main.name;
  return [...images].sort((a, b) => a.sortOrder - b.sortOrder)[0]?.name;
}
