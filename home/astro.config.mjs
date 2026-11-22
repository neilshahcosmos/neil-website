// REFERENCE COPY: Claude's version of the garden, kept for comparison while
// you rebuild it in ../garden. It is not deployed; ./preview.sh home runs it.
// The math notes are a separate Quarto project in ../notes, served at /notes/.
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkWikiLinks } from './src/plugins/remark-wikilinks.mjs';

export default defineConfig({
  site: 'https://neilshahcosmos.com',
  // Builds into home/dist/ so it can never overwrite the live site in ../dist.
  outDir: './dist',
  integrations: [mdx(), sitemap()],
  markdown: {
    // $inline$ and $$display$$ math, plus [[wiki-links]] between garden pages.
    remarkPlugins: [remarkMath, remarkWikiLinks],
    rehypePlugins: [rehypeKatex],
    shikiConfig: { theme: 'github-dark-dimmed' },
  },
});
