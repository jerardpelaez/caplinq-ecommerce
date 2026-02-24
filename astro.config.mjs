// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.caplinq.com',
  integrations: [
    svelte(),
    sitemap(),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
