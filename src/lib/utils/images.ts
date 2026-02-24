/**
 * Image optimization utilities for CAPLINQ B2B ecommerce.
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
 * CAPLINQ brand colors and maintains the standard product
 * image aspect ratio (4:3).
 *
 * @param _productName - Product name (reserved for future per-product placeholders)
 * @returns Path to the placeholder SVG image
 */
export function getPlaceholderImage(_productName: string): string {
  return '/images/placeholder-product.svg';
}
