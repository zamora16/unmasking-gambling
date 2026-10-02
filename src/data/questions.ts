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
  /** Section of the index page. */
  group: Group;
  /** Closing box: the screening test, help lines, or support for relatives. */
  nudge?: 'screening' | 'help' | 'family';
  published: string;
}

export type Group = 'casino' | 'betting' | 'lottery' | 'help';
export const GROUPS: { key: Group; label: L }[] = [
  { key: 'help', label: { es: 'Ayuda práctica', en: 'Practical help' } },
  { key: 'casino', label: { es: 'Casino y tragaperras', en: 'Casino and slots' } },
  { key: 'betting', label: { es: 'Apuestas y bonos', en: 'Betting and bonuses' } },
  { key: 'lottery', label: { es: 'Loterías', en: 'Lotteries' } },
];

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
    group: 'casino',
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
    group: 'casino',
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
    group: 'casino',
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
    group: 'betting',
    published: '2026-10-02',
  },
  {
    id: 'navidad',
    slug: { es: 'probabilidad-loteria-de-navidad', en: 'christmas-lottery-odds' },
    question: { es: '¿Qué probabilidad hay de que toque la Lotería de Navidad?', en: 'What are the odds of winning the Spanish Christmas Lottery?' },
    answer: {
      es: 'El Gordo toca a 1 de cada 100.000 décimos. Algún premio, a 1 de cada 7, pero casi siempre es el reintegro o 100 €. De cada 20 € que cuesta un décimo vuelven de media 14 €, y unos 13 € después de pagar a Hacienda.',
      en: 'The Gordo comes up for 1 in 100,000 décimos. Some prize, for 1 in 7, but it is almost always the refund or €100. Of every €20 a décimo costs, €14 comes back on average, and about €13 after tax.',
    },
    kicker: { es: 'Loterías', en: 'Lotteries' },
    related: ['lottery', 'games', 'way3'],
    group: 'lottery',
    published: '2026-10-02',
  },
  {
    id: 'slotsPay',
    slug: { es: 'cuando-paga-una-tragaperras', en: 'when-does-a-slot-machine-pay' },
    question: { es: '¿Cuándo paga una tragaperras?', en: 'When does a slot machine pay out?' },
    answer: {
      es: 'No hay un momento. En las online, cada tirada es independiente: llevar horas sin premio no acerca el siguiente. Las de bar deben devolver un mínimo en ciclos de miles de partidas, pero no sabes en qué punto del ciclo están, y la norma solo les exige devolver entre el 70 % y el 75 %.',
      en: 'There is no right moment. Online, every spin is independent: hours without a prize do not bring the next one closer. Spanish bar machines must return a minimum over cycles of thousands of games, but you cannot know where in the cycle they are, and the rules only require 70–75% back.',
    },
    kicker: { es: 'Tragaperras', en: 'Slots' },
    related: ['slots', 'way3', 'lab'],
    group: 'casino',
    published: '2026-10-02',
  },
  {
    id: 'bonus',
    slug: { es: 'merece-la-pena-un-bono-de-casino', en: 'are-casino-bonuses-worth-it' },
    question: { es: '¿Merece la pena un bono de casino o de apuestas?', en: 'Are casino and betting bonuses worth it?' },
    answer: {
      es: 'Para la mayoría, no. Un bono de 100 € con requisito de 35 veces obliga a apostar 3.500 € antes de cobrar. En nuestra simulación, solo entre 1 de cada 5 y 1 de cada 3 personas acaban con más dinero del que depositaron; el resto pierde el depósito por el camino.',
      en: 'For most people, no. A €100 bonus with a 35× requirement means staking €3,500 before you can cash out. In our simulation, only between 1 in 5 and 1 in 3 people end with more money than they deposited; the rest lose their deposit along the way.',
    },
    kicker: { es: 'Bonos', en: 'Bonuses' },
    related: ['market', 'slots', 'way3'],
    group: 'betting',
    published: '2026-10-02',
  },
  {
    id: 'tipsters',
    slug: { es: 'funcionan-los-tipsters', en: 'do-tipsters-work' },
    question: { es: '¿Funcionan los tipsters de apuestas?', en: 'Do betting tipsters work?' },
    answer: {
      es: 'Entre miles de pronosticadores, el azar siempre fabrica algunos con meses espectaculares, y son los que se anuncian. Si sigues a los mejores de una temporada, en la siguiente rinden como cualquiera: pierden la comisión de la casa. Separar talento de suerte exige miles de apuestas.',
      en: 'Among thousands of tipsters, chance always produces a few with spectacular months, and those are the ones advertised. Follow the best of one season and in the next they perform like anyone else: they lose the bookmaker’s fee. Telling skill from luck takes thousands of bets.',
    },
    kicker: { es: 'Apuestas deportivas', en: 'Sports betting' },
    related: ['sports', 'odds', 'way3'],
    group: 'betting',
    published: '2026-10-02',
  },
  {
    id: 'rgiaj',
    slug: { es: 'como-autoexcluirse-del-juego', en: 'how-to-self-exclude-from-gambling-in-spain' },
    question: { es: '¿Cómo autoexcluirse del juego en España?', en: 'How do you self-exclude from gambling in Spain?' },
    answer: {
      es: 'Inscribiéndote en el RGIAJ, el registro estatal de prohibidos. Se hace por internet con certificado digital o DNI electrónico, o en persona en un registro público, una oficina de Correos o una comisaría. Es indefinido y te bloquea en todo el juego online con licencia.',
      en: 'By registering in the RGIAJ, Spain’s national self-exclusion register. You can do it online with a digital certificate or electronic ID card, or in person at a public registry office, a post office or a police station. It is indefinite and blocks you from all licensed online gambling.',
    },
    kicker: { es: 'Ayuda', en: 'Help' },
    related: ['help', 'way4', 'way5'],
    group: 'help',
    nudge: 'help',
    published: '2026-10-02',
  },
  {
    id: 'block',
    slug: { es: 'como-bloquear-las-apuestas', en: 'how-to-block-gambling' },
    question: { es: '¿Cómo bloquear las apuestas y el juego online?', en: 'How do you block betting and online gambling?' },
    answer: {
      es: 'Con varias barreras a la vez: el RGIAJ para las webs con licencia, un bloqueador como BetBlocker en el móvil y el ordenador, el bloqueo de pagos de juego en el banco y menos anuncios de juego. Cuantas más capas, menos depende todo de tu fuerza de voluntad en el peor momento.',
      en: 'With several barriers at once: self-exclusion for licensed sites, a blocker such as BetBlocker on your phone and computer, a gambling block at your bank and fewer gambling ads. The more layers, the less it all depends on your willpower at the worst moment.',
    },
    kicker: { es: 'Ayuda', en: 'Help' },
    related: ['way4', 'help', 'way5'],
    group: 'help',
    nudge: 'help',
    published: '2026-10-02',
  },
  {
    id: 'family',
    slug: { es: 'como-ayudar-a-un-familiar-con-problemas-de-juego', en: 'how-to-help-someone-with-a-gambling-problem' },
    question: { es: '¿Cómo ayudar a un familiar con problemas de juego?', en: 'How can you help someone with a gambling problem?' },
    answer: {
      es: 'Habla con calma, en un momento tranquilo y sin reproches: describe lo que ves y cómo te afecta. No pagues sus deudas ni le prestes dinero, y protege tus cuentas. Y busca apoyo para ti: las asociaciones de FEJAR tienen grupos para familias.',
      en: 'Talk calmly, at a quiet moment and without blame: describe what you see and how it affects you. Do not pay their debts or lend them money, and protect your own accounts. And get support for yourself: many gambling support services run groups for families.',
    },
    kicker: { es: 'Ayuda', en: 'Help' },
    related: ['help', 'way6', 'way2'],
    group: 'help',
    nudge: 'family',
    published: '2026-10-02',
  },
  {
    id: 'cost',
    slug: { es: 'cuanto-he-perdido-en-el-juego', en: 'how-much-have-i-lost-gambling' },
    question: { es: '¿Cuánto dinero he perdido en el juego?', en: 'How much money have I lost gambling?' },
    answer: {
      es: 'Probablemente más de lo que crees: la memoria guarda los premios y difumina las pérdidas. La cuenta fiable es lo que has ingresado menos lo que has retirado, según el historial de tu banco y de cada casa. La calculadora de esta página te ayuda a estimarlo.',
      en: 'Probably more than you think: memory keeps the wins and blurs the losses. The reliable figure is what you deposited minus what you withdrew, from your bank’s and each site’s history. The calculator on this page helps you estimate it.',
    },
    kicker: { es: 'Ayuda', en: 'Help' },
    related: ['way2', 'help', 'way5'],
    group: 'help',
    published: '2026-10-02',
  },
];

export const questionById = (id: string) => QUESTIONS.find((q) => q.id === id)!;
