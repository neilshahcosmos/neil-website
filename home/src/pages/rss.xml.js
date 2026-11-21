import rss from '@astrojs/rss';
import { allEntries, url, KIND_LABEL } from '../lib/garden';

export async function GET(context) {
  const items = await allEntries();
  return rss({
    title: 'Neil Shah',
    description: 'A digital garden: math and physics, essays, projects, games and film reviews.',
    site: context.site,
    items: items.map((e) => ({
      title: `${KIND_LABEL[e.collection].one}: ${e.data.title}`,
      description: e.data.description,
      pubDate: e.data.updated ?? e.data.date,
      link: url(e),
    })),
  });
}
