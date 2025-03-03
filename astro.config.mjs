// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';

// Determine the base path based on environment variable
const isSubdirectoryDeployment = process.env.DEPLOY_SUBDIRECTORY === 'true';
const basePath = isSubdirectoryDeployment ? '/AssignmentPlanner/' : '/';

// https://astro.build/config
export default defineConfig({
  site: 'https://learninglab.rmit.edu.au', // This is your canonical site URL
  base: basePath, // Use the conditional base path

  trailingSlash: 'always',
  vite: {
    logLevel: 'error',
  },
  integrations: [sitemap(), preact()],
});
