/** Titles and summaries used for the per-page social-share images (src/pages/og). */
import type { Lang, PageKey } from './index';
import { theWayContent } from '../data/camino/way';

type Meta = { kicker: string; title: string; text: string };

const base: Record<Lang, Partial<Record<PageKey, Meta>>> = {
  es: {
    home: { kicker: 'Unmasking Gambling', title: 'La matemática del juego, con datos', text: 'Simulaciones y análisis con datos reales que muestran por qué la casa siempre gana.' },
    lab: { kicker: 'Simulador', title: 'Laboratorio de ruina', text: 'Miles de jugadores a la vez: percentiles, supervivencia y probabilidad de ruina.' },
    odds: { kicker: 'Datos reales', title: '¿Dicen la verdad las cuotas?', text: '235.796 partidos con cuotas de cierre: el margen, los sesgos y por qué ninguna estrategia sencilla gana.' },
    market: { kicker: 'España', title: 'El mercado del juego online', text: 'Ingresos, publicidad y prevalencia con datos oficiales de la DGOJ y del Ministerio de Sanidad.' },
    games: { kicker: 'Los juegos', title: 'Cada juego tiene un precio', text: 'La ventaja de la casa de cada juego y cuánto cuesta jugar a tu ritmo.' },
    roulette: { kicker: 'Simulador', title: 'Ruleta', text: 'Todas las apuestas cuestan lo mismo: 2,70 % de cada euro.' },
    slots: { kicker: 'Simulador', title: 'Tragaperras', text: 'Rodillos virtuales, RTP exacto y casi-aciertos diseñados.' },
    lottery: { kicker: 'Simulador', title: 'Loterías', text: 'Probabilidades exactas y una vida entera jugando en un clic.' },
    sports: { kicker: 'Simulador', title: 'Apuestas deportivas', text: 'Combinadas, margen y rachas perdedoras.' },
    help: { kicker: 'Ayuda', title: 'Si el juego te está haciendo daño', text: 'Teléfonos, autoexclusión y pasos concretos. FEJAR 900 200 225 · Crisis 024.' },
    methods: { kicker: 'Método', title: 'Fuentes, técnicas y límites', text: 'Datos, estadística y código reproducible del proyecto.' },
  },
  en: {
    home: { kicker: 'Unmasking Gambling', title: 'The mathematics of gambling, with data', text: 'Simulations and real-data analysis showing why the house always wins.' },
    lab: { kicker: 'Simulator', title: 'The Ruin Lab', text: 'Thousands of players at once: percentile bands, survival and risk of ruin.' },
    odds: { kicker: 'Real data', title: 'Do the odds tell the truth?', text: '235,796 matches with closing odds: the margin, the biases and why no simple strategy wins.' },
    market: { kicker: 'Spain', title: 'The online gambling market', text: 'Revenue, marketing and prevalence from official DGOJ and Ministry of Health data.' },
    games: { kicker: 'The games', title: 'Every game has a price', text: 'The house edge of every game and what it costs to play at your pace.' },
    roulette: { kicker: 'Simulator', title: 'Roulette', text: 'Every bet costs the same: 2.70% of each euro.' },
    slots: { kicker: 'Simulator', title: 'Slot machines', text: 'Virtual reels, exact RTP and designed near-misses.' },
    lottery: { kicker: 'Simulator', title: 'Lotteries', text: 'Exact odds and a lifetime of playing in one click.' },
    sports: { kicker: 'Simulator', title: 'Sports betting', text: 'Accumulators, margins and losing streaks.' },
    help: { kicker: 'Help', title: 'If gambling is hurting you', text: 'Helplines, self-exclusion and practical steps.' },
    methods: { kicker: 'Methods', title: 'Sources, techniques and limits', text: 'Data, statistics and reproducible code.' },
  },
};

export function pageMeta(lang: Lang, page: PageKey): Meta | null {
  const hit = base[lang][page];
  if (hit) return hit;
  const hub = theWayContent[lang].hub;
  if (page === 'way') return { kicker: hub.kicker, title: hub.title, text: hub.lead };
  const m = /^way([1-6])$/.exec(page);
  if (m) {
    const s = hub.steps[Number(m[1]) - 1];
    return { kicker: `${hub.title} · ${lang === 'es' ? 'Paso' : 'Step'} ${m[1]}`, title: s.title, text: s.summary };
  }
  return null;
}
