// Helpers for querying the garden: all entries, backlinks, topics, and the
// feed of math notes read straight from the Quarto project in ../notes.
import { getCollection, type CollectionEntry } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type Kind = 'essays' | 'thoughts' | 'projects' | 'reviews';
export const KINDS: Kind[] = ['essays', 'thoughts', 'projects', 'reviews'];
export type Entry = CollectionEntry<Kind>;

export const KIND_LABEL: Record<Kind, { one: string; many: string; blurb: string }> = {
  essays: { one: 'Essay', many: 'Essays', blurb: 'Longer, considered pieces. Opinionated and edited.' },
  thoughts: { one: 'Thought', many: 'Thoughts', blurb: 'Short, loose notes on things I am still figuring out.' },
  projects: { one: 'Project', many: 'Projects & games', blurb: 'Code, games and tools I have built.' },
  reviews: { one: 'Review', many: 'Film reviews', blurb: 'Films I have watched and what I made of them.' },
};

export const STAGE_INFO = {
  nebula: { label: 'Nebula', blurb: 'A loose cloud of an idea. Rough, early, likely to change.' },
  protostar: { label: 'Protostar', blurb: 'Taking shape. Mostly coherent, still accreting.' },
  star: { label: 'Star', blurb: 'Mature and stable. Revisited only now and then.' },
} as const;

export const url = (e: Entry) => `/${e.collection}/${e.id}/`;

const visible = (e: Entry) => !(import.meta.env.PROD && e.data.draft);
const byDate = (a: Entry, b: Entry) =>
  (b.data.updated ?? b.data.date).valueOf() - (a.data.updated ?? a.data.date).valueOf();

export async function entries(kind: Kind): Promise<Entry[]> {
  return ((await getCollection(kind)) as Entry[]).filter(visible).sort(byDate);
}

export async function allEntries(): Promise<Entry[]> {
  const lists = await Promise.all(KINDS.map(entries));
  return lists.flat().sort(byDate);
}

/** Pages that link to `target`, via [[slug]] or a plain /kind/slug/ link. */
export async function backlinks(target: Entry): Promise<Entry[]> {
  const all = await allEntries();
  const wiki = new RegExp(`\\[\\[${escape(target.id)}(\\|[^\\]]*)?\\]\\]`);
  const plain = new RegExp(`\\]\\(/${target.collection}/${escape(target.id)}/?\\)`);
  return all.filter((e) => e !== target && e.body && (wiki.test(e.body) || plain.test(e.body)));
}

export async function topics(): Promise<Map<string, Entry[]>> {
  const map = new Map<string, Entry[]>();
  for (const e of await allEntries()) {
    for (const t of e.data.topics) {
      if (!map.has(t)) map.set(t, []);
      map.get(t)!.push(e);
    }
  }
  return new Map([...map.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])));
}

export const topicSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function fmtDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// ---------- Math notes from the Quarto project ----------

export interface MathNote {
  title: string;
  description: string;
  date: Date;
  section: string;
  url: string;
  image?: string;
}

/** Reads ../notes/<section>/<note>.qmd front matter so the homepage can list recent math notes. */
export function mathNotes(): MathNote[] {
  const root = path.resolve(process.cwd(), '../notes');
  if (!fs.existsSync(root)) return [];
  const notes: MathNote[] = [];
  for (const section of fs.readdirSync(root)) {
    const dir = path.join(root, section);
    if (section.startsWith('_') || section.startsWith('.') || !fs.statSync(dir).isDirectory()) continue;
    const indexFile = path.join(dir, 'index.qmd');
    if (!fs.existsSync(indexFile)) continue;
    const sectionTitle = String(matter(fs.readFileSync(indexFile, 'utf8')).data.title ?? section);
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.qmd') || file === 'index.qmd') continue;
      const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (data.draft) continue;
      const slug = file.replace(/\.qmd$/, '');
      let image: string | undefined;
      if (typeof data.image === 'string') {
        image = data.image.startsWith('/') ? `/notes${data.image}` : `/notes/${section}/${data.image}`;
      }
      notes.push({
        title: String(data.title ?? slug),
        description: String(data.description ?? ''),
        date: new Date(data.date ?? 0),
        section: sectionTitle,
        url: `/notes/${section}/${slug}.html`,
        image,
      });
    }
  }
  return notes.sort((a, b) => b.date.valueOf() - a.date.valueOf());
}
