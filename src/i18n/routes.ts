/**
 * URL slugs per language. Kept free of `import.meta.env` so astro.config can
 * import it to build the redirects from the old paths.
 */
export type PageKey = 'home' | 'lab' | 'odds' | 'market' | 'games' | 'roulette' | 'slots' | 'lottery' | 'sports' | 'help' | 'methods' | 'about' | 'questions'
  | 'way' | 'way1' | 'way2' | 'way3' | 'way4' | 'way5' | 'way6' | 'wayPrint';

export const SLUGS: Record<'es' | 'en', Record<PageKey, string>> = {
  es: {
    home: '',
    lab: 'laboratorio-de-ruina/',
    odds: 'cuotas/',
    market: 'mercado/',
    games: 'juegos/',
    roulette: 'juegos/ruleta/',
    slots: 'juegos/tragaperras/',
    lottery: 'juegos/loteria/',
    sports: 'juegos/apuestas-deportivas/',
    help: 'ayuda/',
    methods: 'metodo/',
    about: 'sobre-el-proyecto/',
    questions: 'preguntas/',
    way: 'el-camino/',
    way1: 'el-camino/por-que-engancha/',
    way2: 'el-camino/donde-estoy/',
    way3: 'el-camino/trampas-mentales/',
    way4: 'el-camino/herramientas/',
    way5: 'el-camino/mi-plan/',
    way6: 'el-camino/no-estas-solo/',
    wayPrint: 'el-camino/mi-plan/imprimir/',
  },
  en: {
    home: '',
    lab: 'ruin-lab/',
    odds: 'odds/',
    market: 'market/',
    games: 'games/',
    roulette: 'games/roulette/',
    slots: 'games/slots/',
    lottery: 'games/lottery/',
    sports: 'games/sports/',
    help: 'help/',
    methods: 'methods/',
    about: 'about/',
    questions: 'questions/',
    way: 'the-way/',
    way1: 'the-way/why-it-hooks/',
    way2: 'the-way/where-i-stand/',
    way3: 'the-way/mental-traps/',
    way4: 'the-way/tools/',
    way5: 'the-way/my-plan/',
    way6: 'the-way/not-alone/',
    wayPrint: 'the-way/my-plan/print/',
  },
};

/** Until October 2026 the Spanish pages used the English slugs without /en/. */
export function legacyRedirects(base: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(SLUGS.es) as PageKey[]) {
    const old = SLUGS.en[key];
    if (old && old !== SLUGS.es[key]) out[`/${old.replace(/\/$/, '')}`] = `${base}/${SLUGS.es[key]}`;
  }
  return out;
}
