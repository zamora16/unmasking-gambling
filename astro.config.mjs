import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    react()
  ],
  site: 'https://zamora16.github.io',
  base: '/unmasking-gambling',
  output: 'static',
  
  // Optimización para mejor SEO
  compressHTML: true,
  
  // Configuración de markdown para artículos
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true
    }
  },
  
  // Configuración de vite para mejor desarrollo
  vite: {
    optimizeDeps: {
      include: ['lightweight-charts']
    }
  }
});