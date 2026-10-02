import { describe, expect, it } from 'vitest';
import { SLUGS, legacyRedirects, type PageKey } from '../src/i18n/routes';
import { SOURCES, breadcrumbTrail, pageSchema } from '../src/lib/seo';

const keys = Object.keys(SLUGS.es) as PageKey[];

describe('routes', () => {
  it('every page has a slug in both languages and a source to date it', () => {
    expect(Object.keys(SLUGS.en).sort()).toEqual([...keys].sort());
    for (const k of keys) expect(SOURCES[k]?.length).toBeGreaterThan(0);
  });

  it('slugs are unique within each language', () => {
    for (const lang of ['es', 'en'] as const) {
      const slugs = Object.values(SLUGS[lang]);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it('old Spanish URLs redirect to the new Spanish slugs', () => {
    const r = legacyRedirects('/ug');
    expect(r['/games/roulette']).toBe('/ug/juegos/ruleta/');
    expect(r['/the-way/my-plan/print']).toBe('/ug/el-camino/mi-plan/imprimir/');
    expect(r['/help']).toBe('/ug/ayuda/');
    // home has no slug to redirect from
    expect(Object.keys(r)).not.toContain('/');
  });

  it('no redirect source collides with a live Spanish page', () => {
    const live = new Set(Object.values(SLUGS.es).map((s) => `/${s.replace(/\/$/, '')}`));
    for (const from of Object.keys(legacyRedirects(''))) expect(live.has(from)).toBe(false);
  });
});

describe('structured data', () => {
  const url = (p: PageKey) => `https://x.test/${SLUGS.es[p]}`;
  const name = (p: PageKey) => p;

  it('builds the breadcrumb trail through the parent section', () => {
    expect(breadcrumbTrail('roulette', name, url).map((c) => c.name)).toEqual(['home', 'games', 'roulette']);
    expect(breadcrumbTrail('wayPrint', name, url).map((c) => c.name)).toEqual(['home', 'way', 'way5', 'wayPrint']);
    expect(breadcrumbTrail('home', name, url)).toHaveLength(1);
  });

  it('links page, author and site in one graph, with FAQ when given', () => {
    const s = pageSchema({
      lang: 'es',
      page: 'roulette',
      title: 'Ruleta',
      description: 'd',
      url: url('roulette'),
      siteUrl: url('home'),
      aboutUrl: url('about'),
      image: 'i.png',
      modified: '2026-10-02',
      crumbs: breadcrumbTrail('roulette', name, url),
      faq: [{ q: '¿Q?', a: 'A.' }],
    });
    const types = s['@graph'].map((n) => n['@type']);
    expect(types).toEqual(['WebSite', 'Person', 'Article', 'BreadcrumbList', 'FAQPage']);
    const article = s['@graph'][2];
    expect(article.author).toEqual({ '@id': 'https://x.test/#author' });
    expect(article.dateModified).toBe('2026-10-02');
  });
});
