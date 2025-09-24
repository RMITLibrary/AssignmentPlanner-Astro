// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';
import strip from 'rollup-plugin-strip';

// Silence Dart Sass deprecation warnings unless overridden by the environment
if (!process.env.SASS_SILENCE_DEPRECATIONS) {
  process.env.SASS_SILENCE_DEPRECATIONS = 'all';
}

//
//  Determine the base path based on environment variable
const useSubdirectoryDefault = true; // Set the default to true
const isSubdirectoryDeployment = process.env.DEPLOY_SUBDIRECTORY === 'false' ? false : useSubdirectoryDefault;
const basePath = isSubdirectoryDeployment ? '/AssignmentPlanner/' : '/';
const isProduction = process.env.NODE_ENV === 'production';

// https://astro.build/config
export default defineConfig({
  site: 'https://learninglab.rmit.edu.au',
  base: basePath,
  trailingSlash: 'always',
  vite: {
    // Pass basePath to the client-side environment
    define: {
      'import.meta.env.BASE_PATH': JSON.stringify(basePath),
    },
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['import', 'global-builtin', 'mixed-decls', 'color-functions'],
        },
      },
    },
    logLevel: 'error',
    plugins: [
      strip({
        include: ['**/*.?(js|jsx|ts|tsx|astro)'],
        exclude: ['node_modules/**/*'],
        debugger: isProduction, // Strip 'debugger' statements only in production
        functions: isProduction ? ['console.log', 'console.debug'] : [], // Strip console logs only in production
      }),
    ],
    build: {
      terserOptions: {
        compress: {
          pure_funcs: isProduction ? ['console.log', 'console.debug'] : [], // Pure functions removal only in production
        },
      },
    },
  },
  integrations: [sitemap(), preact()],
});
