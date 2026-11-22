// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://neilshahcosmos.com',
  // Build into the repo-level dist/ folder that Netlify publishes. Astro empties
  // dist/ on every build, so netlify-build.sh builds this site FIRST and then
  // renders the Quarto notes into dist/notes/.
  outDir: '../dist',
});
