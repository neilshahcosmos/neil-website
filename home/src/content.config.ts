// The garden's content model. Each folder in src/content/ is a collection;
// every .md / .mdx file in it becomes a page at /<collection>/<file-name>/.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Growth stages, borrowed from star formation:
//   nebula    – a loose cloud of an idea, rough and early
//   protostar – taking shape, mostly coherent, still changing
//   star      – mature and stable; revisited only now and then
export const STAGES = ['nebula', 'protostar', 'star'] as const;

const common = {
  title: z.string(),
  description: z.string(), // one or two sentences; shown on cards and in link previews
  date: z.coerce.date(), // when it was planted
  updated: z.coerce.date().optional(), // when it was last tended
  stage: z.enum(STAGES).default('nebula'),
  topics: z.array(z.string()).default([]),
  cover: z.string().optional(), // path under public/, e.g. /images/covers/foo.jpg
  draft: z.boolean().default(false), // drafts are hidden from the built site
  example: z.boolean().default(false), // shows an "example, replace me" ribbon
};

const essays = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/essays' }),
  schema: z.object({ ...common, subtitle: z.string().optional() }),
});

const thoughts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/thoughts' }),
  schema: z.object(common),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    ...common,
    kind: z.enum(['code', 'game', 'tool', 'site', 'other']).default('code'),
    tech: z.array(z.string()).default([]),
    live: z.string().optional(), // link to play / use it
    repo: z.string().optional(), // link to the source
  }),
});

const reviews = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/reviews' }),
  schema: z.object({
    ...common,
    stage: z.enum(STAGES).default('star'),
    film: z.string(),
    year: z.number(),
    director: z.string().optional(),
    rating: z.number().min(0).max(5), // out of 5, halves allowed
  }),
});

export const collections = { essays, thoughts, projects, reviews };
