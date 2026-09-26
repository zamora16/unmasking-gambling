/**
 * Cuerpo de los pasos de prosa (1, 3, 4 y 6). Los pasos 2 y 5 son interactivos
 * y su contenido vive en theWay.ts junto al cribado y al plan.
 *
 * El paso 3 corrige el fallo que detectó la auditoría: antes explicaba en prosa
 * los sesgos que los simuladores ya demuestran. Ahora cada trampa enlaza con la
 * herramienta que la desmonta, y las dos mitades del sitio por fin se hablan.
 */

import type { Lang as Locale, PageKey as RouteId } from '../../i18n';

export interface StepBlock {
  heading: string;
  body: string[];
  /** Enlace a la herramienta que demuestra lo que el bloque explica. */
  tool?: { routeId: RouteId; label: string };
  /** Recuadro destacado al final del bloque. */
  note?: { tone: 'truth' | 'lure' | 'house'; text: string };
}

export interface StepBody {
  lead: string;
  blocks: StepBlock[];
  takeaway: string;
}

type StepKey = 'step1' | 'step3' | 'step4' | 'step6';

const es: Record<StepKey, StepBody> = {
  step1: {
    lead: 'Antes de decidir nada conviene entender contra qué se está jugando. La adicción al juego no aparece por falta de carácter: aparece porque estas máquinas están diseñadas, con mucho dinero y mucha psicología, para que aparezca.',
    blocks: [
      {
        heading: 'El refuerzo de ratio variable',
        body: [
          'Si una máquina te diera premio cada diez tiradas, dejarías de jugar en cuanto lo consiguieras. Si no te diera nunca, dejarías de jugar también. Lo que engancha es no saber cuándo.',
          'A este patrón se le llama refuerzo de ratio variable y es, con diferencia, el más resistente a la extinción de todos los que se conocen en psicología del aprendizaje. Es el mismo mecanismo que hace que sigas mirando el móvil: la recompensa impredecible sostiene la conducta mucho después de que la recompensa deje de llegar.',
          'Las tragaperras son la aplicación más pura de este principio que existe. No es una casualidad: es el resultado de décadas de optimización.',
        ],
      },
      {
        heading: 'La dopamina va por delante del premio',
        body: [
          'La intuición dice que el subidón llega al ganar. La medición dice otra cosa: el pico de dopamina se produce durante la anticipación, mientras los rodillos giran y todavía no se sabe.',
          'Esto tiene una consecuencia incómoda. Si lo que refuerza es la espera y no el resultado, entonces **perder también refuerza**, siempre que la espera haya sido suficientemente intensa. Por eso puedes salir de una sesión perdedora con ganas de volver.',
        ],
        note: {
          tone: 'lure',
          text: 'Los casi-premios —dos símbolos iguales y el tercero a un paso— activan circuitos parecidos a los de ganar, pese a ser pérdidas. Las máquinas los generan por encima de lo que daría el azar.',
        },
      },
      {
        heading: 'El entorno también está diseñado',
        body: [
          'Sin relojes ni ventanas, con iluminación constante, moqueta que amortigua el sonido y salidas poco visibles: el diseño de un salón de juego busca que se pierda la referencia temporal.',
          'En el juego online el equivalente son las notificaciones, los bonos con caducidad, el depósito de un toque y la ausencia total de fricción. Cada elemento que se ha eliminado del proceso es un momento en el que podrías haber parado.',
        ],
      },
    ],
    takeaway:
      'Nada de esto significa que no puedas salir. Significa que salir no es cuestión de proponérselo con más fuerza, sino de cambiar las condiciones. Los pasos siguientes van de eso.',
  },

  step3: {
    lead: 'Estas son las trampas que sostienen el juego una vez que ya has empezado. No las vas a desactivar leyendo sobre ellas: hay que verlas fallar. Cada una lleva al simulador que la demuestra.',
    blocks: [
      {
        heading: 'La falacia del jugador',
        body: [
          '«Llevo ocho rojos, ya toca negro.» La bola no lleva la cuenta. Cada giro es independiente de todos los anteriores, y la probabilidad del siguiente es exactamente la misma tanto si vienes de ocho rojos como si acabas de sentarte.',
          'Es la trampa más común y la más fácil de comprobar: si el simulador funcionara como cree la intuición, las rachas largas se corregirían. No lo hacen.',
        ],
        tool: { routeId: 'roulette', label: 'Comprobar si la ruleta tiene memoria' },
      },
      {
        heading: 'El sesgo del superviviente',
        body: [
          'Conoces a alguien que acertó diez seguidas. No conoces a los novecientos que fallaron, porque los que fallan no lo cuentan.',
          'Entre mil personas apostando al azar, un número perfectamente predecible encadenará rachas largas. La existencia de la racha no dice nada sobre la habilidad de quien la tuvo — y cuando esa persona eres tú, la conclusión es la misma.',
        ],
        tool: { routeId: 'sports', label: 'Simular mil apostadores al azar' },
      },
      {
        heading: 'La ilusión de control',
        body: [
          'Elegir los números, soplar los dados, pulsar el botón en el momento justo, apostar solo al equipo que conoces. Ninguna de estas acciones cambia la probabilidad, pero todas producen la sensación de estar influyendo en el resultado.',
          'En las apuestas deportivas la ilusión es más difícil de ver, porque ahí el conocimiento **sí** cuenta algo. Lo que no cambia es el margen que hay que superar antes de que empiece a contar.',
        ],
        tool: { routeId: 'odds', label: 'Ver el margen que hay que superar' },
      },
      {
        heading: 'El recuerdo selectivo',
        body: [
          'Las ganancias se recuerdan con detalle: el día, la cantidad, la sensación. Las pérdidas se difuminan en una nube de «bueno, alguna vez pierdes».',
          'Por eso casi nadie sabe cuánto lleva perdido de verdad. Y por eso el paso más incómodo de todos —sentarse a sumarlo— suele ser también el que más cambia las cosas.',
        ],
        tool: { routeId: 'lottery', label: 'Calcular lo que costó de verdad' },
      },
      {
        heading: 'La creencia en los sistemas',
        body: [
          'Doblar tras perder, seguir una secuencia, gestionar el bankroll con reglas estrictas. Todos los sistemas de apuestas reorganizan **cuándo** pierdes, ninguno cambia **cuánto**.',
          'Un sistema puede producir muchas sesiones ganadoras pequeñas seguidas de una pérdida enorme. Eso no es vencer a la casa: es cambiar la forma de la curva dejando intacta la pendiente.',
        ],
        tool: { routeId: 'lab', label: 'Llevar los sistemas hasta que revientan' },
      },
    ],
    takeaway:
      'Si has probado los simuladores, ya tienes algo que no da la teoría: la experiencia de haber visto fallar la intuición. Eso es lo que hace falta para el paso siguiente.',
  },

  step4: {
    lead: 'Las herramientas que funcionan tienen algo en común: no dependen de que tomes la decisión correcta en el peor momento. Se ponen antes, en frío, para que el impulso se encuentre una puerta cerrada.',
    blocks: [
      {
        heading: 'Primero las barreras que no puedes deshacer',
        body: [
          'La autoexclusión oficial es la medida más eficaz de todas por una razón concreta: una vez tramitada, ya no depende de ti. En España el RGIAJ te bloquea en todos los operadores con licencia, online y presenciales, y se solicita en la sede electrónica de la DGOJ.',
          'Los salones y casinos tienen además registros propios de autoprohibición que se piden en recepción y están obligados a tramitar.',
        ],
        note: {
          tone: 'truth',
          text: 'La regla para juzgar cualquier barrera: ¿puedo saltármela en treinta segundos cuando tenga el impulso? Si la respuesta es sí, no es una barrera, es una intención.',
        },
      },
      {
        heading: 'Poner distancia entre tú y el dinero',
        body: [
          'Muchos bancos permiten bloquear la categoría de comercio de juego, y algunos aplican una demora para reactivarlo. Pídelo por escrito.',
          'Cuando el control propio ya ha fallado varias veces, que otra persona custodie tarjetas y accesos durante un periodo acordado deja de ser una humillación y pasa a ser lo que funciona. Es incómodo a propósito: la incomodidad es el mecanismo.',
        ],
      },
      {
        heading: 'Manejar el impulso cuando llega igualmente',
        body: [
          'El impulso no es permanente. Sube, se mantiene unos minutos y baja, aunque mientras dura parezca que no va a bajar nunca. La táctica es sencilla: no discutir con él, sobrevivirlo.',
          'Lo que hace que funcione es tenerlo decidido de antemano. Improvisar con el impulso encima es exactamente lo que no funciona, porque el impulso es precisamente lo que deteriora la capacidad de decidir.',
        ],
        note: {
          tone: 'lure',
          text: 'Quince minutos de espera, salir del sitio y mover el cuerpo cubren la mayoría de los episodios. No porque sean potentes, sino porque el impulso tiene fecha de caducidad corta.',
        },
      },
      {
        heading: 'Quitar los recordatorios',
        body: [
          'Notificaciones, accesos directos, cuentas de pronósticos, grupos donde se comentan cuotas. Nada de esto provoca la recaída por sí solo, pero todo mantiene el tema presente y aumenta el número de ocasiones en que el impulso puede aparecer.',
          'Es la medida más barata de todas y la que más gente se salta por parecer menor.',
        ],
      },
    ],
    takeaway:
      'En el paso siguiente eliges cuáles de estas herramientas entran en tu plan. No entran todas: entran las que corresponden a dónde juegas y a lo que ha dado el cribado.',
  },

  step6: {
    lead: 'Este es el paso que más gente se salta y el que mejor predice que la cosa salga bien. El juego prospera en el aislamiento, y romperlo es lo único que no se puede hacer en solitario.',
    blocks: [
      {
        heading: 'Contárselo a una persona',
        body: [
          'No hace falta contárselo a la familia entera ni dar cifras exactas el primer día. Con una persona basta para cambiar bastante: alguien a quien escribir cuando llega el impulso y ante quien la conducta deja de ser invisible.',
          'La reacción que la gente teme —el juicio, la decepción— suele ser bastante peor en la imaginación que en la realidad. Y quien reacciona mal casi nunca es la única opción disponible.',
        ],
      },
      {
        heading: 'Los grupos de apoyo',
        body: [
          'Las asociaciones de FEJAR ofrecen grupos gratuitos por toda España, presenciales y online, tanto para quien juega como para su familia. No hay que estar en una situación extrema para acudir.',
          'Lo que aporta un grupo y no aporta ninguna web es que ahí nadie tiene que explicar lo básico. Eso ahorra una cantidad enorme de energía.',
        ],
      },
      {
        heading: 'La ayuda profesional',
        body: [
          'El trastorno de juego tiene tratamiento con evidencia, principalmente terapia cognitivo-conductual, y está cubierto por la sanidad pública. También lo ofrecen gratuitamente las asociaciones.',
          'Pedir ayuda profesional no significa que la situación sea grave. Significa que prefieres no comprobar hasta dónde puede llegar.',
        ],
        note: {
          tone: 'house',
          text: 'Si en algún momento aparecen ideas de hacerte daño, eso no es parte del proceso y no hay que esperar: 024, gratuito y las veinticuatro horas.',
        },
      },
      {
        heading: 'Las recaídas forman parte del proceso',
        body: [
          'La mayoría de los procesos de recuperación incluyen recaídas. Una recaída no borra lo anterior ni demuestra que no puedas: demuestra que el plan tenía un hueco por el que se coló algo.',
          'Lo útil después de una recaída no es la culpa, es la pregunta concreta: ¿qué barrera falló y cómo se cierra? Por eso el plan tiene fecha de revisión.',
        ],
      },
    ],
    takeaway:
      'Has terminado el recorrido. Lo que queda no está en esta web: está en hacer el primer trámite del plan hoy, no mañana.',
  },
};

const en: Record<StepKey, StepBody> = {
  step1: {
    lead: 'Before deciding anything it helps to understand what you are up against. Gambling addiction does not appear through weak character: it appears because these machines are designed, with a great deal of money and psychology, to produce it.',
    blocks: [
      {
        heading: 'Variable ratio reinforcement',
        body: [
          'If a machine paid out every ten spins, you would stop as soon as you got it. If it never paid, you would stop too. What hooks you is not knowing when.',
          'This pattern is called variable ratio reinforcement and it is by far the most resistant to extinction of any known in the psychology of learning. It is the same mechanism that keeps you checking your phone: unpredictable reward sustains behaviour long after the reward stops arriving.',
          'Slot machines are the purest application of this principle in existence. That is not an accident: it is the result of decades of optimisation.',
        ],
      },
      {
        heading: 'Dopamine arrives before the prize',
        body: [
          'Intuition says the rush comes from winning. Measurement says otherwise: the dopamine peak occurs during anticipation, while the reels spin and the outcome is still unknown.',
          'This has an uncomfortable consequence. If what reinforces is the wait rather than the result, then **losing also reinforces**, provided the wait was intense enough. That is why you can leave a losing session wanting to come back.',
        ],
        note: {
          tone: 'lure',
          text: 'Near misses — two matching symbols and the third one short — activate circuits similar to winning, despite being losses. Machines generate them more often than chance alone would.',
        },
      },
      {
        heading: 'The environment is designed too',
        body: [
          'No clocks, no windows, constant lighting, carpet that absorbs sound and exits that are hard to spot: the design of a gambling venue works to remove your sense of time.',
          'Online, the equivalents are notifications, bonuses with expiry dates, one-tap deposits and the total absence of friction. Every element removed from the process is a moment at which you could have stopped.',
        ],
      },
    ],
    takeaway:
      'None of this means you cannot get out. It means getting out is not a matter of resolving harder, but of changing the conditions. That is what the following steps are for.',
  },

  step3: {
    lead: 'These are the traps that keep gambling going once you have started. You will not disarm them by reading about them: you have to watch them fail. Each one links to the simulator that demonstrates it.',
    blocks: [
      {
        heading: 'The gambler’s fallacy',
        body: [
          '“Eight reds — black must be due.” The ball keeps no count. Every spin is independent of every previous one, and the probability of the next is exactly the same whether you arrive after eight reds or have only just sat down.',
          'It is the most common trap and the easiest to check: if the simulator behaved the way intuition expects, long runs would correct themselves. They do not.',
        ],
        tool: { routeId: 'roulette', label: 'Check whether the wheel remembers' },
      },
      {
        heading: 'Survivorship bias',
        body: [
          'You know somebody who won ten in a row. You do not know the nine hundred who lost, because the ones who lose do not tell you.',
          'Among a thousand people betting at random, a perfectly predictable number will string together long runs. The existence of the streak says nothing about the skill of whoever had it — and when that person is you, the conclusion is the same.',
        ],
        tool: { routeId: 'sports', label: 'Simulate a thousand random bettors' },
      },
      {
        heading: 'The illusion of control',
        body: [
          'Choosing the numbers, blowing on the dice, pressing the button at just the right moment, betting only on the team you follow. None of these changes the probability, but all of them produce the sensation of influencing the outcome.',
          'In sports betting the illusion is harder to see, because there knowledge **does** count for something. What does not change is the margin you have to clear before it starts counting.',
        ],
        tool: { routeId: 'odds', label: 'See the margin you have to clear' },
      },
      {
        heading: 'Selective recall',
        body: [
          'Wins are remembered in detail: the day, the amount, the feeling. Losses blur into a haze of “well, you lose sometimes”.',
          'That is why almost nobody knows how much they have really lost. And why the most uncomfortable step of all — sitting down and adding it up — is usually the one that changes the most.',
        ],
        tool: { routeId: 'lottery', label: 'Work out what it really cost' },
      },
      {
        heading: 'Belief in systems',
        body: [
          'Doubling after a loss, following a sequence, managing a bankroll by strict rules. Every betting system rearranges **when** you lose; none changes **how much**.',
          'A system can produce many small winning sessions followed by one enormous loss. That is not beating the house: it is changing the shape of the curve while leaving the slope untouched.',
        ],
        tool: { routeId: 'lab', label: 'Run the systems until they break' },
      },
    ],
    takeaway:
      'If you have tried the simulators, you now have something theory cannot give: the experience of having watched your intuition fail. That is what the next step needs.',
  },

  step4: {
    lead: 'The tools that work share one property: they do not depend on you making the right decision at the worst moment. They are set up beforehand, in the cold, so the urge meets a locked door.',
    blocks: [
      {
        heading: 'Barriers you cannot undo come first',
        body: [
          'Official self-exclusion is the single most effective measure for one specific reason: once processed, it no longer depends on you. National schemes block you across every licensed operator, online and in person.',
          'Arcades and casinos additionally keep their own self-exclusion registers, requested at reception, which they are obliged to process.',
        ],
        note: {
          tone: 'truth',
          text: 'The test for any barrier: can I get around it in thirty seconds once the urge hits? If yes, it is not a barrier — it is an intention.',
        },
      },
      {
        heading: 'Put distance between you and the money',
        body: [
          'Many banks can block the gambling merchant category, and some apply a delay before it can be lifted. Request it in writing.',
          'Once self-control has failed several times, having someone else hold cards and access for an agreed period stops being humiliating and becomes the thing that works. It is uncomfortable on purpose: the discomfort is the mechanism.',
        ],
      },
      {
        heading: 'Handling the urge when it comes anyway',
        body: [
          'The urge is not permanent. It rises, holds for a few minutes and falls, however permanent it feels while it lasts. The tactic is simple: do not argue with it, outlast it.',
          'What makes it work is having decided in advance. Improvising with the urge on you is precisely what fails, because the urge is exactly what degrades your capacity to decide.',
        ],
        note: {
          tone: 'lure',
          text: 'Fifteen minutes of waiting, leaving the place and moving your body cover most episodes. Not because they are powerful, but because the urge has a short shelf life.',
        },
      },
      {
        heading: 'Remove the reminders',
        body: [
          'Notifications, shortcuts, tipster accounts, group chats where odds get discussed. None of this causes a relapse on its own, but all of it keeps the subject present and increases the number of occasions on which an urge can arise.',
          'It is the cheapest measure of all and the one most people skip for seeming minor.',
        ],
      },
    ],
    takeaway:
      'In the next step you choose which of these tools go into your plan. Not all of them: the ones that match where you gamble and what the screening returned.',
  },

  step6: {
    lead: 'This is the step most people skip and the one that best predicts things going well. Gambling thrives on isolation, and breaking it is the one thing that cannot be done alone.',
    blocks: [
      {
        heading: 'Telling one person',
        body: [
          'You do not have to tell the whole family or give exact figures on day one. One person is enough to change a great deal: somebody to message when the urge arrives, and in front of whom the behaviour stops being invisible.',
          'The reaction people fear — the judgement, the disappointment — is usually a good deal worse in the imagination than in reality. And whoever does react badly is almost never the only option available.',
        ],
      },
      {
        heading: 'Support groups',
        body: [
          'Member associations run free groups, in person and online, both for the person gambling and for their family. You do not have to be in an extreme situation to attend.',
          'What a group offers that no website can is that nobody there has to explain the basics. That saves an enormous amount of energy.',
        ],
      },
      {
        heading: 'Professional help',
        body: [
          'Gambling disorder has treatment with an evidence base, principally cognitive behavioural therapy, and it is covered by public health services. Associations also provide it free.',
          'Asking for professional help does not mean the situation is severe. It means you would rather not find out how far it can go.',
        ],
        note: {
          tone: 'house',
          text: 'If thoughts of harming yourself appear at any point, that is not part of the process and it should not wait. Crisis lines are free and available around the clock.',
        },
      },
      {
        heading: 'Relapses are part of the process',
        body: [
          'Most recovery processes include relapses. A relapse does not erase what came before or prove you cannot do it: it shows the plan had a gap that something slipped through.',
          'What helps after a relapse is not guilt but the specific question: which barrier failed, and how does it get closed? That is why the plan has a review date.',
        ],
      },
    ],
    takeaway:
      'You have finished the route. What remains is not on this website: it is in completing the first item of your plan today, not tomorrow.',
  },
};

export const theWayStepBodies: Record<Locale, Record<StepKey, StepBody>> = { es, en };
