/*
 * The garden's content model. Each folder in src/content/ is a collection
 * every .md / .mdx file becomes a page at /<collection>/<file-name>/
 */

import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/*
 * Growth stages:
 *     nebula    - a loose cloud of an idea, unfinished
 *     protostar - taking shape, mostly coherent, still changing
 *     star      - mature and stable
 */

export const STAGES = [ 'nebula', 'protostar', 'star' ] as const;

const common = {
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    stage: z.enum(STAGES).default('nebula'),
    cover: z.string().optional(),
}

const essays = defineCollection({
    loader: glob({
        pattern: '**/[^_]*.{md,mdx}',
        base: './src/content/essays'
    }),
    schema: z.object({ 
        ...common, 
        subtitle: z.string().optional()
    }),
});

const thoughts = defineCollection({
    loader: glob({
        pattern: '**/[^_]*.{md,mdx}',
        base: './src/content/thoughts'
    }),
    schema: z.object({ 
        ...common,
    }),
});

const projects = defineCollection({
    loader: glob({
        pattern: '**/[^_]*.{md,mdx}',
        base: './src/content/projects'
    }),
    schema: z.object({ 
        ...common, 
        kind: z.enum(['code', 'game', 'tool', 'site', 'other']).default('code'),
    }),
});

const reviews = defineCollection({
    loader: glob({
        pattern: '**/[^_]*.{md,mdx}',
        base: './src/content/reviews'
    }),
    schema: z.object({ 
        ...common,
    }),
});

export const collections = { essays, thoughts, projects, reviews };
