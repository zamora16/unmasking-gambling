import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://zamora16.github.io',
  base: '/unmasking-gambling',
  trailingSlash: 'always',
  integrations: [react()],
  // old URLs from the first version of the site
  redirects: {
    '/ayuda': '/unmasking-gambling/help/',
    '/the-way': '/unmasking-gambling/help/',
    '/slots': '/unmasking-gambling/games/',
    '/roulette': '/unmasking-gambling/games/',
    '/lottery': '/unmasking-gambling/games/',
    '/sports': '/unmasking-gambling/odds/',
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
