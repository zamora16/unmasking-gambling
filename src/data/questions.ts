/**
 * Question pages: each one answers, in its first lines, a question people
 * actually type into a search engine, and then proves the answer with a tool.
 * This registry drives the routes, the index page, the OG images and the
 * links from the rest of the site. The body of each page lives in
 * src/views/questions/<id>.astro.
 */
import type { PageKey } from '../i18n/routes';

type Lang = 'es' | 'en';
type L<T = string> = Record<Lang, T>;

export interface Question {
  id: string;
  slug: L;
  /** The question as people search it. Also the H1. */
  question: L;
  /** One or two sentences that answer it. Shown first and used as meta description. */
  answer: L;
  /** Short label for cards and the OG image. */
  kicker: L;
  /** Pages this question sends people to. */
  related: PageKey[];
  published: string;
}

export const QUESTIONS: Question[] = [
  {
    id: 'martingale',
    slug: { es: 'funciona-la-martingala', en: 'does-the-martingale-work' },
    question: { es: '¿Funciona la martingala?', en: 'Does the martingale work?' },
    answer: {
      es: 'No. Doblar la apuesta tras cada pérdida convierte muchas ganancias pequeñas en una pérdida grande y rara. La ventaja de la casa sigue intacta: con cualquier sistema pierdes de media el 2,70 % de todo lo que apuestas en la ruleta europea.',
      en: 'No. Doubling your bet after every loss turns many small wins into one large, rare loss. The house edge is untouched: whatever the system, you lose on average 2.70% of everything you stake at European roulette.',
    },
    kicker: { es: 'Sistemas de apuestas', en: 'Betting systems' },
    related: ['lab', 'roulette', 'way3'],
    published: '2026-10-02',
  },
  {
    id: 'roulette',
    slug: { es: 'se-puede-ganar-a-la-ruleta', en: 'can-you-beat-roulette' },
    question: { es: '¿Se puede ganar a la ruleta a largo plazo?', en: 'Can you beat roulette in the long run?' },
    answer: {
      es: 'No. En una noche se puede ganar, pero cuanto más juegas, menos probable es ir ganando: tras 100 tiradas al rojo va por delante el 36 % de los jugadores; tras 1.000, el 19 %; tras 10.000, 3 de cada 1.000. El cero hace que cada apuesta devuelva 97,30 céntimos por euro.',
      en: 'No. You can win on a given night, but the longer you play, the less likely you are to be ahead: after 100 spins on red, 36% of players are ahead; after 1,000, 19%; after 10,000, 3 in 1,000. The zero makes every bet pay back 97.30 cents per euro.',
    },
    kicker: { es: 'Ruleta', en: 'Roulette' },
    related: ['roulette', 'lab', 'games'],
    published: '2026-10-02',
  },
  {
    id: 'rtp',
    slug: { es: 'que-es-el-rtp', en: 'what-is-rtp' },
    question: { es: '¿Qué es el RTP de una tragaperras?', en: 'What is RTP on a slot machine?' },
    answer: {
      es: 'El RTP es la parte de lo apostado que la máquina devuelve a largo plazo. Un RTP del 96 % significa que la casa se queda 4 céntimos de cada euro que pasa por la máquina, en cada tirada. A 1 € por tirada y 600 tiradas por hora, son 24 € por hora de media.',
      en: 'RTP is the share of the money staked that a machine pays back in the long run. An RTP of 96% means the house keeps 4 cents of every euro that goes through the machine, on every spin. At €1 a spin and 600 spins an hour, that is €24 an hour on average.',
    },
    kicker: { es: 'Tragaperras', en: 'Slots' },
    related: ['slots', 'games', 'lab'],
    published: '2026-10-02',
  },
  {
    id: 'betting',
    slug: { es: 'se-puede-vivir-de-las-apuestas', en: 'can-you-make-a-living-from-betting' },
    question: { es: '¿Se puede vivir de las apuestas deportivas?', en: 'Can you make a living from sports betting?' },
    answer: {
      es: 'Casi nadie lo consigue. Cada cuota lleva una comisión de en torno al 6–8 %, y en 113.026 partidos de diez temporadas ninguna regla sencilla dio beneficios. Quien gana de forma sostenida suele acabar con la cuenta limitada por la propia casa.',
      en: 'Almost nobody does. Every price carries a fee of around 6–8%, and across 113,026 matches over ten seasons no simple rule made a profit. The few who win consistently tend to have their accounts restricted by the bookmaker.',
    },
    kicker: { es: 'Apuestas deportivas', en: 'Sports betting' },
    related: ['odds', 'sports', 'way3'],
    published: '2026-10-02',
  },
];

export const questionById = (id: string) => QUESTIONS.find((q) => q.id === id)!;
