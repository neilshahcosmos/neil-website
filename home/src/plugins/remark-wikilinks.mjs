// [[wiki-links]] for the garden.
//
//   [[welcome-to-the-observatory]]           -> link to that page, using its title
//   [[welcome-to-the-observatory|the intro]] -> same page, custom link text
//   [[notes:algebra/what-is-a-group]]        -> a Quarto math note at /notes/algebra/what-is-a-group.html
//
// A link to a page that doesn't exist yet is rendered as a dimmed
// "not yet written" marker instead of a broken link, which is very gardeny.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const COLLECTIONS = ['essays', 'thoughts', 'projects', 'reviews'];
const CONTENT_DIR = path.resolve(process.cwd(), 'src/content');
const NOTES_DIR = path.resolve(process.cwd(), '../notes');

/** slug -> { url, title } for every garden page (re-read on each build/edit). */
export function gardenIndex() {
  const index = new Map();
  for (const col of COLLECTIONS) {
    const dir = path.join(CONTENT_DIR, col);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!/\.(md|mdx)$/.test(file) || file.startsWith('_')) continue;
      const slug = file.replace(/\.(md|mdx)$/, '');
      let title = slug;
      try {
        title = matter(fs.readFileSync(path.join(dir, file), 'utf8')).data.title ?? slug;
      } catch {}
      index.set(slug, { url: `/${col}/${slug}/`, title });
    }
  }
  return index;
}

function noteTarget(ref) {
  // ref like "algebra/what-is-a-group"
  const file = path.join(NOTES_DIR, `${ref}.qmd`);
  let title = ref.split('/').pop().replace(/-/g, ' ');
  try {
    title = matter(fs.readFileSync(file, 'utf8')).data.title ?? title;
  } catch {}
  return { url: `/notes/${ref}.html`, title };
}

const WIKI = /\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g;

export function remarkWikiLinks() {
  return (tree) => {
    const index = gardenIndex();
    walk(tree, index);
  };
}

function walk(node, index) {
  if (!node.children) return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type === 'text' && child.value.includes('[[')) {
      const parts = splitText(child.value, index);
      node.children.splice(i, 1, ...parts);
      i += parts.length - 1;
    } else if (child.type !== 'link' && child.type !== 'inlineCode' && child.type !== 'code') {
      walk(child, index);
    }
  }
}

function splitText(text, index) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(WIKI)) {
    if (m.index > last) out.push({ type: 'text', value: text.slice(last, m.index) });
    const ref = m[1].trim();
    const label = m[2]?.trim();
    let target = null;
    if (ref.startsWith('notes:')) target = noteTarget(ref.slice(6));
    else target = index.get(ref) ?? null;
    if (target) {
      out.push({
        type: 'link',
        url: target.url,
        data: { hProperties: { className: ['wikilink'] } },
        children: [{ type: 'text', value: label ?? target.title }],
      });
    } else {
      out.push({
        type: 'emphasis',
        data: { hName: 'span', hProperties: { className: ['wikilink-missing'], title: 'Not written yet' } },
        children: [{ type: 'text', value: label ?? ref.replace(/-/g, ' ') }],
      });
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: 'text', value: text.slice(last) });
  return out;
}
