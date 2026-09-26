/**
 * One social-share image per page, rendered at build time with Satori + resvg
 * in the casino-table palette. Fonts are read from @fontsource, so the build
 * does not call any font CDN.
 */
import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LANGS, type Lang, type PageKey } from '../../../i18n';
import { pageMeta } from '../../../i18n/meta';

const PAGES: PageKey[] = ['home', 'lab', 'odds', 'market', 'games', 'roulette', 'slots', 'lottery', 'sports', 'help', 'methods', 'way', 'way1', 'way2', 'way3', 'way4', 'way5', 'way6'];

export function getStaticPaths() {
  return LANGS.flatMap((lang) => PAGES.map((page) => ({ params: { lang, page } })));
}

const fonts = resolve(process.cwd(), 'node_modules', '@fontsource');
const display = readFileSync(resolve(fonts, 'barlow-condensed/files/barlow-condensed-latin-600-normal.woff'));
const body = readFileSync(resolve(fonts, 'inter-tight/files/inter-tight-latin-400-normal.woff'));
const bold = readFileSync(resolve(fonts, 'inter-tight/files/inter-tight-latin-600-normal.woff'));

const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style: { display: 'flex', ...style }, children } });

export const GET: APIRoute = async ({ params }) => {
  const meta = pageMeta(params.lang as Lang, params.page as PageKey)!;
  const svg = await satori(
    el(
      'div',
      { width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px', backgroundColor: '#0e1d16', backgroundImage: 'radial-gradient(120% 90% at 50% -10%, #1f4633 0%, #0e1d16 60%)', color: '#f2ecdf' },
      [
        el('div', { alignItems: 'center', gap: '16px' }, [
          el('div', { width: '34px', height: '34px', borderRadius: '999px', backgroundColor: '#c9a45c', alignItems: 'center', justifyContent: 'center' }, [el('div', { width: '18px', height: '18px', borderRadius: '999px', backgroundColor: '#f2ecdf' })]),
          el('span', { fontFamily: 'Bold', fontSize: '26px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a45c' }, meta.kicker),
        ]),
        el('div', { flexDirection: 'column', gap: '22px', width: '1000px' }, [
          el('span', { fontFamily: 'Display', fontSize: '96px', lineHeight: 1, fontWeight: 600 }, meta.title),
          el('span', { fontFamily: 'Body', fontSize: '32px', lineHeight: 1.4, color: '#c7c0ae' }, meta.text),
        ]),
        el('div', { justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #36573f', paddingTop: '22px', fontFamily: 'Body', fontSize: '24px', color: '#8f9a8e' }, [
          el('span', {}, 'Unmasking Gambling'),
          el('div', { width: '120px', height: '8px', backgroundColor: '#e0553d', borderRadius: '4px' }),
        ]),
      ],
    ) as never,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Display', data: display, weight: 600, style: 'normal' },
        { name: 'Body', data: body, weight: 400, style: 'normal' },
        { name: 'Bold', data: bold, weight: 600, style: 'normal' },
      ],
    },
  );
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
