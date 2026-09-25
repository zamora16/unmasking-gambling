export type Lang = 'es' | 'en';
export const LANGS: Lang[] = ['es', 'en'];

export type PageKey = 'home' | 'lab' | 'odds' | 'market' | 'games' | 'help' | 'methods';

const SLUGS: Record<PageKey, string> = {
  home: '',
  lab: 'ruin-lab/',
  odds: 'odds/',
  market: 'market/',
  games: 'games/',
  help: 'help/',
  methods: 'methods/',
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function href(lang: Lang, page: PageKey, hash = ''): string {
  const prefix = lang === 'es' ? '' : '/en';
  return `${BASE}${prefix}/${SLUGS[page]}${hash}`;
}

export function asset(path: string): string {
  return `${BASE}/${path.replace(/^\//, '')}`;
}

export const ui = {
  es: {
    siteName: 'Unmasking Gambling',
    tagline: 'La matemática del juego, con datos',
    nav: { lab: 'Laboratorio de ruina', odds: 'Las cuotas', market: 'El mercado', games: 'Los juegos', help: 'Pedir ayuda', methods: 'Método' },
    needHelp: '¿Necesitas ayuda?',
    helpLine: 'FEJAR 900 200 225 · Crisis 024',
    langSwitch: 'English',
    themeToggle: 'Cambiar tema claro/oscuro',
    skip: 'Saltar al contenido',
    footer: {
      about: 'Proyecto de divulgación sobre los riesgos del juego. Cada cifra está enlazada a su fuente y cada simulación se puede reproducir.',
      author: 'Hecho por',
      authorRole: 'Doctor en Psicología, analista de datos',
      code: 'Código y datos en GitHub',
      disclaimer: 'Contenido educativo. No sustituye la ayuda profesional.',
    },
    table: { show: 'Ver los datos en tabla', hide: 'Ocultar tabla' },
    loading: 'Calculando…',
    source: 'Fuente',
    sources: 'Fuentes',
  },
  en: {
    siteName: 'Unmasking Gambling',
    tagline: 'The mathematics of gambling, with data',
    nav: { lab: 'Ruin Lab', odds: 'The odds', market: 'The market', games: 'The games', help: 'Get help', methods: 'Methods' },
    needHelp: 'Need help?',
    helpLine: 'US 1-800-GAMBLER · UK 0808 8020 133',
    langSwitch: 'Español',
    themeToggle: 'Toggle light/dark theme',
    skip: 'Skip to content',
    footer: {
      about: 'An explainer on the risks of gambling. Every figure links to its source and every simulation can be reproduced.',
      author: 'Made by',
      authorRole: 'PhD in Psychology, data analyst',
      code: 'Code and data on GitHub',
      disclaimer: 'Educational content. It does not replace professional help.',
    },
    table: { show: 'Show the data as a table', hide: 'Hide table' },
    loading: 'Computing…',
    source: 'Source',
    sources: 'Sources',
  },
} as const;

export type UI = (typeof ui)[Lang];

export function fmt(lang: Lang) {
  const locale = lang === 'es' ? 'es-ES' : 'en-GB';
  // always group thousands (es-ES skips it for 4-digit numbers), for consistency
  const g = { useGrouping: 'always' } as unknown as Intl.NumberFormatOptions;
  return {
    int: (n: number) => new Intl.NumberFormat(locale, { ...g, maximumFractionDigits: 0 }).format(n),
    num: (n: number, d = 1) => new Intl.NumberFormat(locale, { ...g, minimumFractionDigits: d, maximumFractionDigits: d }).format(n),
    pct: (n: number, d = 1) => new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: d, maximumFractionDigits: d }).format(n),
    eur: (n: number, d = 0) => new Intl.NumberFormat(locale, { ...g, style: 'currency', currency: 'EUR', minimumFractionDigits: d, maximumFractionDigits: d }).format(n),
    compact: (n: number) => new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(n),
    signedPct: (n: number, d = 1) => new Intl.NumberFormat(locale, { style: 'percent', signDisplay: 'exceptZero', minimumFractionDigits: d, maximumFractionDigits: d }).format(n),
  };
}
