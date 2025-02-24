import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Define "project-types" collection
const projectTypes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/project-types' }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(), // Adjust with all valid types
    tasks: z.array(
      z.object({
        id: z.string(),
        weight: z.number().optional(),
      }),
    ),
  }),
});

// Define "tasks" collection
const tasks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tasks' }),
  schema: z.object({
    id: z.string(),
    description: z.string(),
  }),
});

export const collections = { projectTypes, tasks };
 