/**
 * Structured data (schema.org JSON-LD) for every page. One @graph per page:
 * the site, the author, the page itself, its breadcrumb trail and, when the
 * page has one, its FAQ. Pure functions so the shape can be tested.
 */
import type { PageKey } from '../i18n/routes';
import { author } from '../data/author';

type Lang = 'es' | 'en';
export type Crumb = { name: string; url: string };
export type Faq = { q: string; a: string };

/** Section each page sits under, for breadcrumbs. Pages not listed hang from home. */
export const PARENT: Partial<Record<PageKey, PageKey>> = {
  roulette: 'games',
  slots: 'games',
  lottery: 'games',
  sports: 'games',
  way1: 'way',
  way2: 'way',
  way3: 'way',
  way4: 'way',
  way5: 'way',
  way6: 'way',
  wayPrint: 'way5',
};

/** Source files whose last commit dates each page. */
export const SOURCES: Record<PageKey, string[]> = {
  home: ['src/views/Home.astro'],
  lab: ['src/views/Lab.astro', 'src/islands/RuinLab.tsx', 'src/lib/montecarlo.ts'],
  odds: ['src/views/Odds.astro', 'src/data/odds'],
  market: ['src/views/Market.astro', 'src/data/market'],
  games: ['src/views/Games.astro', 'src/lib/games.ts'],
  roulette: ['src/views/games/Roulette.astro', 'src/islands/games/Roulette.tsx'],
  slots: ['src/views/games/Slots.astro', 'src/islands/games/Slot.tsx', 'src/islands/games/SlotSession.tsx'],
  lottery: ['src/views/games/Lottery.astro', 'src/islands/games/Lottery.tsx'],
  sports: ['src/views/games/Sports.astro', 'src/islands/games/Sports.tsx'],
  help: ['src/views/Help.astro'],
  methods: ['src/views/Methods.astro'],
  about: ['src/views/About.astro'],
  questions: ['src/views/Questions.astro', 'src/data/questions.ts'],
  way: ['src/views/camino/Hub.astro', 'src/data/camino'],
  way1: ['src/views/camino/Step.astro', 'src/data/camino'],
  way2: ['src/views/camino/Step.astro', 'src/data/camino', 'src/islands/camino/Pgsi.tsx'],
  way3: ['src/views/camino/Step.astro', 'src/data/camino'],
  way4: ['src/views/camino/Step.astro', 'src/data/camino'],
  way5: ['src/views/camino/Step.astro', 'src/data/camino', 'src/islands/camino/PlanBuilder.tsx'],
  way6: ['src/views/camino/Step.astro', 'src/data/camino'],
  wayPrint: ['src/views/camino/Print.astro'],
};

export function breadcrumbTrail(page: PageKey, name: (p: PageKey) => string, url: (p: PageKey) => string): Crumb[] {
  const chain: PageKey[] = [];
  for (let p: PageKey | undefined = page; p && p !== 'home'; p = PARENT[p]) chain.unshift(p);
  return [{ name: name('home'), url: url('home') }, ...chain.map((p) => ({ name: name(p), url: url(p) }))];
}

interface PageInput {
  lang: Lang;
  page: PageKey;
  title: string;
  description: string;
  url: string;
  siteUrl: string;
  aboutUrl: string;
  image: string;
  modified: string;
  published?: string;
  crumbs: Crumb[];
  faq?: Faq[];
  /** Article for content, AboutPage for the about page, WebPage otherwise. */
  kind?: 'Article' | 'AboutPage' | 'WebPage';
}

export function pageSchema(p: PageInput) {
  const site = `${p.siteUrl}#website`;
  const person = `${p.siteUrl}#author`;
  const kind = p.kind ?? (p.page === 'home' ? 'WebPage' : p.page === 'about' ? 'AboutPage' : 'Article');
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': site,
      url: p.siteUrl,
      name: 'Unmasking Gambling',
      inLanguage: ['es', 'en'],
      publisher: { '@id': person },
    },
    {
      '@type': 'Person',
      '@id': person,
      name: author.name,
      jobTitle: author.role[p.lang],
      url: p.aboutUrl,
      sameAs: [author.github, author.portfolio],
    },
    {
      '@type': kind,
      '@id': `${p.url}#page`,
      url: p.url,
      [kind === 'Article' ? 'headline' : 'name']: p.title,
      description: p.description,
      inLanguage: p.lang,
      isPartOf: { '@id': site },
      image: p.image,
      author: { '@id': person },
      publisher: { '@id': person },
      dateModified: p.modified,
      ...(p.published ? { datePublished: p.published } : {}),
      ...(p.crumbs.length > 1 ? { breadcrumb: { '@id': `${p.url}#breadcrumb` } } : {}),
    },
  ];
  if (p.crumbs.length > 1)
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${p.url}#breadcrumb`,
      itemListElement: p.crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
    });
  if (p.faq?.length)
    graph.push({
      '@type': 'FAQPage',
      '@id': `${p.url}#faq`,
      inLanguage: p.lang,
      mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  return { '@context': 'https://schema.org', '@graph': graph };
}
