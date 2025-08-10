import { defineConfig } from 'astro/config'; 
import tailwind from '@astrojs/tailwind'; 
import react from '@astrojs/react'; 
 
export default defineConfig({ 
  integrations: [tailwind(), react()], 
  site: 'https://zamora16.github.io', 
  base: process.env.NODE_ENV === 'production' ? '/unmasking-gambling' : undefined, 
  output: 'static' 
}); 
