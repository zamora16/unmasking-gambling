import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

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
      filter: (page) => !page.includes('/print/'),
    }),
  ],
  // old URLs from earlier versions of the site
  redirects: {
    '/ayuda': to('help/'),
    '/el-camino': to('the-way/'),
    '/slots': to('games/slots/'),
    '/roulette': to('games/roulette/'),
    '/lottery': to('games/lottery/'),
    '/sports': to('games/sports/'),
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
