// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';
import strip from 'rollup-plugin-strip';

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
    plugins: [
      strip({
        include: ['**/*.?(js|jsx|ts|tsx|astro)'], // Adjust file extensions as needed
        exclude: ['node_modules/**/*'],
        debugger: true,
        functions: ['console.log', 'console.debug'], // Remove console.log and console.debug
      }),
    ],
    build: {
      terserOptions: {
        compress: {
          pure_funcs: ['console.log', 'console.debug'],
        },
      },
    },
  },

  integrations: [sitemap(), preact()],
});
