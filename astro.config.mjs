// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({

  trailingSlash: 'always',

  vite: {
    logLevel: 'error', // Options: 'info', 'warn', 'error', 'silent'
  },

  integrations: [sitemap(), preact()],
});