/* 
 * garden.ts
 * 
 * Helpers for querying the garden!
 */

import { getCollection, type CollectionEntry } from "astro:content";

export type PageType = 'essays' | 'thoughts' | 'projects' | 'reviews';
export const PAGE_TYPES: PageType[] = ['essays', 'thoughts', 'projects', 'reviews'];
export type Entry = CollectionEntry<PageType>;
export const PAGE_TYPE_LABEL: Record<PageType, { one: string; many: string; blurb: string; }> = {
    essays: {
        one: 'Essay',
        many: 'Essays',
        blurb: 'Longer pieces, opinionated and edited!'
    },
    thoughts: {
        one: 'Thought',
        many: 'Thoughts',
        blurb: 'Shortt, loose notes!'
    },
    projects: {
        one: 'Project',
        many: 'Projects',
        blurb: 'Code, games, and tools I\'ve built!'
    },
    reviews: {
        one: 'Review',
        many: 'Reviews',
        blurb: 'Films I\'ve watched and what I made of them!'
    }
}
export const STAGE_INFO = {
    nebula: {
        label: 'Nebula',
        blurb: 'A loose cloud of an idea, still unfinished.'
    },
    protostar: {
        label: 'Protostar',
        blurb: 'Taking shape. Mostly coherent, but still accreting.'
    },
    star: {
        label: 'Star',
        blurb: 'Mature and stable. Revisited now and then.'
    }
}

export const get_url_from_entry = (e: Entry) => `/${e.collection}/${e.id}/`

export function fmt_date(date: Date) {
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
