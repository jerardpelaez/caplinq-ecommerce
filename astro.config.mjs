// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://www.krayden.com',
  integrations: [
    svelte(),
    sitemap({
      filter: (page) => !page.includes('/search'),
      serialize(item) {
        if (item.url.includes('/products/')) {
          item.changefreq = /** @type {any} */ ('weekly');
          item.priority = 0.8;
        } else if (item.url.includes('/blog/')) {
          item.changefreq = /** @type {any} */ ('monthly');
          item.priority = 0.7;
        } else if (item.url === 'https://www.krayden.com/') {
          item.changefreq = /** @type {any} */ ('daily');
          item.priority = 1.0;
        } else {
          item.changefreq = /** @type {any} */ ('monthly');
          item.priority = 0.5;
        }
        return item;
      },
    }),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '$lib': path.resolve(__dirname, './src/lib'),
      },
    },
  },
});
