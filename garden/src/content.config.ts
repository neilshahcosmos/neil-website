/*
 * The garden's content model. Each folder in src/content/ is a collection
 * every .md / .mdx file becomes a page at /<collection>/<file-name>/
 */

import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const common = {
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
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

export const collections = { essays };
