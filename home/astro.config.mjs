// Astro config for the main site (neilshahcosmos.com).
// The math notes are a separate Quarto project in ../notes, served at /notes/.
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkWikiLinks } from './src/plugins/remark-wikilinks.mjs';

export default defineConfig({
  site: 'https://neilshahcosmos.com',
  // Build straight into the repo-level dist/ folder that Netlify publishes.
  // Astro empties dist/ on every build, so netlify-build.sh (and preview.sh all)
  // build this site FIRST, then render the Quarto notes into dist/notes/.
  outDir: '../dist',
  integrations: [mdx(), sitemap()],
  markdown: {
    // $inline$ and $$display$$ math, plus [[wiki-links]] between garden pages.
    remarkPlugins: [remarkMath, remarkWikiLinks],
    rehypePlugins: [rehypeKatex],
    shikiConfig: { theme: 'github-dark-dimmed' },
  },
});
