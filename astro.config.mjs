// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ajv.ag',
  integrations: [
    sitemap({
      // Exclude the client-rendered, noindex event detail page (/veranstaltung).
      filter: (page) => !page.includes('/veranstaltung/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
