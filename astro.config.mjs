import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { legacyRedirects } from './src/i18n/routes.ts';

// GitHub Pages by default. To host on your own domain (e.g. Vercel), set
// SITE_URL=https://your-domain and BASE_PATH=/ at build time.
const SITE_URL = process.env.SITE_URL ?? 'https://zamora16.github.io';
const BASE = (process.env.BASE_PATH ?? '/unmasking-gambling').replace(/\/$/, '');
const to = (path) => `${BASE}/${path}`;

export default defineConfig({
  site: SITE_URL,
  base: BASE || '/',
  trailingSlash: 'always',
  integrations: [
    react(),
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es', en: 'en' } },
      // the printable plan is a personal document, not a page to index
      filter: (page) => !page.includes('/print/') && !page.includes('/imprimir/'),
    }),
  ],
  // old URLs from earlier versions of the site
  redirects: {
    ...legacyRedirects(BASE),
    '/slots': to('juegos/tragaperras/'),
    '/roulette': to('juegos/ruleta/'),
    '/lottery': to('juegos/loteria/'),
    '/sports': to('juegos/apuestas-deportivas/'),
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
