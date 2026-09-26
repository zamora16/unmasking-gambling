/**
 * Contenido de El Camino: cribado PGSI, vocabulario del plan y los seis pasos.
 *
 * Los ítems del PGSI son los del Canadian Problem Gambling Index (Ferris y Wynne,
 * 2001). La redacción castellana busca ser natural sin alterar lo que cada ítem
 * pregunta: cambiar el sentido invalidaría los puntos de corte.
 */

import type { Lang as Locale } from '../../i18n';
import type { BarrierId, EmergencyStepId, Goal, TriggerId, WarningId } from '../../lib/plan';
import type { SeverityBand } from '../../lib/pgsi';

export interface TheWayStrings {
  hub: {
    kicker: string;
    title: string;
    lead: string;
    stepsLabel: string;
    privacyNote: string;
    startCta: string;
    resumeCta: string;
    steps: Array<{ title: string; summary: string; minutes: number }>;
  };

  pgsi: {
    intro: string;
    timeframe: string;
    disclaimer: string;
    /** Las cuatro opciones de respuesta, en orden de puntuación 0 a 3. */
    scale: [string, string, string, string];
    items: string[];
    attribution: string;
    submit: string;
    incomplete: string;
    resultTitle: string;
    scoreLabel: string;
    bands: Record<SeverityBand, { name: string; meaning: string; advice: string }>;
    concernsLabel: string;
    retake: string;
    continueCta: string;
    savedNote: string;
  };

  plan: {
    intro: string;
    goalLabel: string;
    goals: Record<Goal, string>;
    channelLabel: string;
    channels: Record<'online' | 'venue' | 'lottery-shop', string>;
    gamesLabel: string;
    games: Record<'slots' | 'sports' | 'casino' | 'lottery' | 'poker', string>;
    triggersLabel: string;
    triggers: Record<TriggerId, string>;
    supportLabel: string;
    supportYes: string;
    supportNo: string;
    supportNameLabel: string;
    buildCta: string;

    resultTitle: string;
    goalSection: string;
    barriersSection: string;
    triggersSection: string;
    emergencySection: string;
    reviewSection: string;
    referralSection: string;

    barriers: Record<BarrierId, { title: string; how: string }>;
    tactics: Record<string, { title: string; how: string }>;
    emergencySteps: Record<EmergencyStepId, string>;
    warnings: Record<WarningId, string>;
    referral: Record<'none' | 'suggested' | 'recommended', string>;
    reviewEvery: string;
    printCta: string;
    privacyNote: string;
  };
}

const es: TheWayStrings = {
  hub: {
    kicker: 'Guía interactiva de seis pasos',
    title: 'El Camino',
    lead: 'De entender por qué engancha el juego a salir con un plan escrito que se ajusta a tu situación. Con base clínica y sin registro.',
    stepsLabel: 'Los seis pasos',
    privacyNote:
      'Todo lo que respondas se guarda únicamente en tu navegador. No se envía a ningún servidor, no hay cuenta y nadie más puede verlo.',
    startCta: 'Empezar por el paso 1',
    resumeCta: 'Continuar donde lo dejaste',
    steps: [
      {
        title: 'Por qué engancha',
        summary:
          'Refuerzo de ratio variable, dopamina anticipatoria y diseño ambiental. No es falta de voluntad: está diseñado.',
        minutes: 8,
      },
      {
        title: 'Dónde estoy',
        summary:
          'El cribado PGSI, nueve preguntas validadas que sitúan tu relación con el juego con criterios reales.',
        minutes: 5,
      },
      {
        title: 'Trampas mentales',
        summary:
          'Falacia del jugador, ilusión de control y casi-premios. Cada trampa con el simulador que la desmonta.',
        minutes: 10,
      },
      {
        title: 'Herramientas',
        summary:
          'Autoexclusión, bloqueo bancario, límites y manejo del impulso. Barreras que funcionan sin fuerza de voluntad.',
        minutes: 12,
      },
      {
        title: 'Mi plan',
        summary:
          'Un plan que se ramifica según tu gravedad, tus disparadores y cómo juegas. Para guardar e imprimir.',
        minutes: 15,
      },
      {
        title: 'No estás solo',
        summary: 'Grupos de apoyo, terapia y cómo contárselo a alguien. El paso que más sostiene.',
        minutes: 8,
      },
    ],
  },

  pgsi: {
    intro:
      'Estas nueve preguntas son el PGSI, el cuestionario que se usa en los estudios de prevalencia de juego problemático. No lo hemos inventado nosotros y tiene puntos de corte publicados, así que el resultado significa algo concreto.',
    timeframe: 'Piensa en los últimos doce meses.',
    disclaimer:
      'Esto es un cribado, no un diagnóstico. Sitúa tu nivel de riesgo y orienta qué hacer, pero solo un profesional puede diagnosticar un trastorno de juego. Una puntuación baja tampoco descarta que el juego te esté haciendo daño.',
    scale: ['Nunca', 'A veces', 'La mayoría de las veces', 'Casi siempre'],
    items: [
      '¿Has apostado más de lo que realmente podías permitirte perder?',
      '¿Has necesitado apostar cantidades mayores para conseguir la misma sensación de emoción?',
      '¿Has vuelto otro día a intentar recuperar el dinero que perdiste?',
      '¿Has pedido dinero prestado o vendido algo para poder jugar?',
      '¿Has sentido que podrías tener un problema con el juego?',
      '¿El juego te ha causado problemas de salud, incluidos estrés o ansiedad?',
      '¿Alguien ha criticado tu forma de jugar o te ha dicho que tenías un problema, tuvieran razón o no?',
      '¿El juego ha causado problemas económicos a ti o a tu familia?',
      '¿Te has sentido culpable por cómo juegas o por lo que ocurre cuando juegas?',
    ],
    attribution:
      'PGSI (Problem Gambling Severity Index), del Canadian Problem Gambling Index — Ferris y Wynne, 2001.',
    submit: 'Ver mi resultado',
    incomplete: 'Faltan {n} preguntas por responder.',
    resultTitle: 'Tu resultado',
    scoreLabel: 'Puntuación PGSI',
    bands: {
      none: {
        name: 'Sin indicadores de riesgo',
        meaning:
          'No aparecen señales de juego problemático en los últimos doce meses.',
        advice:
          'Si juegas, mantener límites claros de dinero y tiempo es lo que hace que siga siendo así. Conocer la matemática ayuda: es lo que hay en el resto de esta web.',
      },
      low: {
        name: 'Riesgo bajo',
        meaning:
          'Aparecen una o dos señales. En esta banda el juego todavía no suele causar consecuencias visibles, pero las señales rara vez retroceden solas.',
        advice:
          'Es el mejor momento para poner barreras, precisamente porque cuesta poco. Fijar límites ahora es mucho más fácil que retirarse después.',
      },
      moderate: {
        name: 'Riesgo moderado',
        meaning:
          'Hay varias señales y es probable que ya estés notando consecuencias, aunque quizá las expliques por otras causas.',
        advice:
          'En esta banda conviene combinar barreras externas con apoyo. Hablar con un profesional no significa que la situación sea grave: significa que quieres que no llegue a serlo.',
      },
      problem: {
        name: 'Indicadores de juego problemático',
        meaning:
          'La puntuación está en el rango que en investigación se asocia a juego problemático. Es muy probable que el juego esté afectando a tu economía, tu salud o tus relaciones.',
        advice:
          'Lo más eficaz ahora no es proponerse jugar menos, sino poner el dinero y el acceso fuera de tu alcance y buscar ayuda profesional. Hay atención gratuita y confidencial, y pedirla es lo que más cambia el pronóstico.',
      },
    },
    concernsLabel: 'Lo que más pesa en tu resultado',
    retake: 'Volver a responder',
    continueCta: 'Construir mi plan con este resultado',
    savedNote: 'Guardado en tu navegador. Puedes cerrar la página y volver.',
  },

  plan: {
    intro:
      'Este plan se construye con tu resultado del cribado. No es una plantilla: según lo que respondas cambian las barreras que propone, el orden del protocolo de impulso y cada cuánto conviene revisarlo.',
    goalLabel: '¿Qué quieres conseguir?',
    goals: {
      maintain: 'Mantener el control que ya tengo',
      reduce: 'Jugar bastante menos',
      stop: 'Dejar de jugar del todo',
    },
    channelLabel: '¿Dónde juegas?',
    channels: {
      online: 'Online (móvil, ordenador)',
      venue: 'Bares, salones o casinos',
      'lottery-shop': 'Administraciones y estancos',
    },
    gamesLabel: '¿A qué juegas?',
    games: {
      slots: 'Tragaperras',
      sports: 'Apuestas deportivas',
      casino: 'Casino (ruleta, blackjack)',
      lottery: 'Lotería y rascas',
      poker: 'Póker',
    },
    triggersLabel: '¿Qué suele venir justo antes de jugar?',
    triggers: {
      stress: 'Estrés o tensión acumulada',
      boredom: 'Aburrimiento o tiempo muerto',
      alcohol: 'Después de beber',
      social: 'Estar con gente que juega',
      'money-trouble': 'Agobio económico',
      'low-mood': 'Bajón emocional o soledad',
      payday: 'Cobrar la nómina',
      'sport-events': 'Partidos o eventos deportivos',
    },
    supportLabel: '¿Hay alguien de confianza que sepa lo que te pasa?',
    supportYes: 'Sí, alguien lo sabe',
    supportNo: 'Todavía no se lo he contado a nadie',
    supportNameLabel: '¿Quién? (solo para tu plan)',
    buildCta: 'Generar mi plan',

    resultTitle: 'Mi plan',
    goalSection: 'Mi objetivo',
    barriersSection: 'Barreras que voy a poner',
    triggersSection: 'Qué hago con mis disparadores',
    emergencySection: 'Si me viene el impulso',
    reviewSection: 'Revisión',
    referralSection: 'Apoyo profesional',

    barriers: {
      rgiaj: {
        title: 'Inscribirme en el RGIAJ',
        how: 'El Registro General de Interdicciones de Acceso al Juego te bloquea en todos los operadores con licencia en España, online y presenciales. Se solicita en la sede electrónica de la DGOJ y no depende de tu voluntad una vez hecho.',
      },
      'venue-exclusion': {
        title: 'Autoexcluirme de los locales donde juego',
        how: 'Los salones y casinos tienen registro propio de autoprohibición. Pídelo en recepción: están obligados a tramitarlo y a impedirte la entrada.',
      },
      'app-block': {
        title: 'Bloquear apps y webs de juego',
        how: 'Instala un bloqueador a nivel de dispositivo o de DNS y deja la contraseña en manos de otra persona. La clave está en que tú no puedas desactivarlo en el momento del impulso.',
      },
      'bank-block': {
        title: 'Pedir el bloqueo de pagos de juego al banco',
        how: 'Muchos bancos permiten bloquear la categoría de comercio de juego. Llama y pídelo por escrito; algunos aplican además un periodo de espera para reactivarlo.',
      },
      'cash-only': {
        title: 'Salir solo con el efectivo justo',
        how: 'Deja las tarjetas en casa cuando vayas a un sitio donde puedas jugar. Es rudimentario y funciona: convierte el impulso en un trámite.',
      },
      'deposit-limit': {
        title: 'Fijar límites de depósito',
        how: 'Los operadores con licencia están obligados a ofrecerlos. Ponlos bajos: subirlos tiene demora, bajarlos es inmediato. Es una barrera menor, no la principal.',
      },
      'time-limit': {
        title: 'Limitar el tiempo, no solo el dinero',
        how: 'Fija franjas en las que no juegas y ponlas en el calendario. El tiempo de exposición predice el gasto mejor que la intención de gastar poco.',
      },
      'delete-accounts': {
        title: 'Cerrar las cuentas de juego',
        how: 'Cerrar, no solo desinstalar la app. Pide el cierre definitivo por escrito: reabrir tiene fricción, reinstalar no tiene ninguna.',
      },
      'remove-shortcuts': {
        title: 'Quitar los atajos',
        how: 'Desactiva notificaciones, borra accesos directos, deja de seguir cuentas de cuotas y pronósticos. No elimina el impulso, pero elimina los recordatorios que lo provocan.',
      },
      'money-custodian': {
        title: 'Que otra persona gestione el dinero',
        how: 'Alguien de confianza custodia tarjetas y accesos durante un periodo acordado, con una cantidad semanal pactada. Es la barrera más incómoda y la más eficaz cuando el control propio ya ha fallado varias veces.',
      },
    },

    tactics: {
      'sustitucion-fisica': {
        title: 'Estrés: sacarlo por el cuerpo antes de que llegue al móvil',
        how: 'Ten decidida de antemano una acción física de diez minutos —andar rápido, escaleras, ducha fría— y hazla sin decidirlo en el momento. Decidir es justo lo que no funciona con el impulso encima.',
      },
      'plan-alternativo': {
        title: 'Aburrimiento: llenar el hueco antes de que aparezca',
        how: 'Identifica las dos franjas del día en que sueles jugar y deja algo concreto puesto en el calendario para esas franjas. El vacío no se resiste, se ocupa.',
      },
      'regla-absoluta': {
        title: 'Alcohol: una regla sin excepciones',
        how: 'Nada de juego el día que bebes, sin matices ni casos especiales. Las reglas con excepciones se negocian en el momento; las absolutas, no.',
      },
      'guion-social': {
        title: 'Presión social: llevar la frase preparada',
        how: 'Ten decidida la frase exacta con la que te sales, y dila pronto. Improvisar delante de gente es lo que hace que acabes jugando por no dar explicaciones.',
      },
      'ayuda-financiera': {
        title: 'Agobio económico: separar el problema del juego',
        how: 'El impulso de recuperar jugando crece con la deuda. Busca asesoría de deuda gratuita y trata las dos cosas por separado, porque juntas se retroalimentan.',
      },
      'contacto-humano': {
        title: 'Bajón: contacto antes que pantalla',
        how: 'Ten un nombre decidido y escríbele antes de abrir nada. No hace falta contarle lo que pasa: basta con que el primer movimiento sea hacia una persona.',
      },
      'automatizar-dinero': {
        title: 'Nómina: que el dinero se mueva solo',
        how: 'Domicilia el mismo día del cobro los gastos fijos y un traspaso a una cuenta sin tarjeta asociada. Lo que no está disponible no se juega.',
      },
      'cambiar-consumo': {
        title: 'Deportes: cambiar cómo consumes el deporte',
        how: 'Deja de seguir cuentas de pronósticos y cuotas, y ve los partidos acompañado o en diferido. El vínculo entre ver deporte y apostar se rompe cambiando el contexto, no la fuerza de voluntad.',
      },
    },

    emergencySteps: {
      'hand-over-cards': 'Entrego las tarjetas o el móvil a la persona acordada. Primero esto, antes que nada.',
      'wait-15': 'Espero quince minutos antes de hacer nada. El impulso baja solo; parece que no, pero baja.',
      'leave-place': 'Me voy físicamente del sitio donde estoy.',
      'call-person': 'Llamo o escribo a mi persona de confianza.',
      'write-cost': 'Escribo cuánto llevo perdido en total. En números, no de memoria.',
      'move-body': 'Muevo el cuerpo diez minutos: andar, escaleras, lo que sea.',
      'call-helpline': 'Llamo a FEJAR (900 200 225). Es gratuito y confidencial.',
    },

    warnings: {
      'goal-below-severity':
        'Has marcado que quieres reducir, pero tu resultado del cribado está en la banda de juego problemático. En ese rango, la evidencia no respalda el juego controlado como objetivo: lo que funciona es dejarlo con apoyo. Tu plan se ha construido con ese objetivo. Puedes cambiarlo, pero queríamos decírtelo claro.',
      'no-support':
        'Has indicado que nadie de tu entorno lo sabe. Es lo más común y lo más costoso: el aislamiento es el mejor aliado del juego. No hace falta contarlo todo ni a todos — con una persona basta para cambiar mucho.',
      'no-screening':
        'No has hecho el cribado, así que el plan se ha construido con el supuesto más conservador. Hacerlo lleva cinco minutos y ajusta bastante el resultado.',
      'no-barriers':
        'No has marcado dónde juegas, así que no se pueden proponer barreras concretas. Vuelve atrás y márcalo: es la parte del plan que más cambia las cosas.',
    },

    referral: {
      none: 'Tu resultado no indica necesidad de derivación. Si algo cambia, los recursos siguen aquí.',
      suggested:
        'Conviene que hables con un profesional. No porque la situación sea grave, sino porque en esta banda el apoyo externo es lo que evita que lo sea. FEJAR (900 200 225) orienta gratis y sin compromiso.',
      recommended:
        'Te recomendamos buscar ayuda profesional ahora. La atención por juego patológico es gratuita en la sanidad pública y en las asociaciones de FEJAR, y es confidencial. Este plan sirve de apoyo, no sustituye a ese paso.',
    },
    reviewEvery: 'Revisar este plan cada {n} días. Próxima revisión: {date}.',
    printCta: 'Imprimir o guardar en PDF',
    privacyNote:
      'Tu plan se guarda solo en este navegador. Si borras los datos del navegador o usas otro dispositivo, se pierde — imprímelo o guárdalo en PDF si quieres conservarlo.',
  },
};

const en: TheWayStrings = {
  hub: {
    kicker: 'Interactive six-step guide',
    title: 'The Way',
    lead: 'From understanding why gambling hooks you to leaving with a written plan fitted to your situation. Clinically grounded, no sign-up.',
    stepsLabel: 'The six steps',
    privacyNote:
      'Everything you answer is stored only in your browser. Nothing is sent to a server, there is no account, and nobody else can see it.',
    startCta: 'Start with step 1',
    resumeCta: 'Pick up where you left off',
    steps: [
      {
        title: 'Why it hooks you',
        summary:
          'Variable ratio reinforcement, anticipatory dopamine and environmental design. Not weak willpower: deliberate design.',
        minutes: 8,
      },
      {
        title: 'Where I stand',
        summary:
          'The PGSI screen — nine validated questions that locate your relationship with gambling using real criteria.',
        minutes: 5,
      },
      {
        title: 'Mental traps',
        summary:
          'Gambler’s fallacy, illusion of control and near misses. Each trap paired with the simulator that dismantles it.',
        minutes: 10,
      },
      {
        title: 'Tools',
        summary:
          'Self-exclusion, bank blocks, limits and urge management. Barriers that work without relying on willpower.',
        minutes: 12,
      },
      {
        title: 'My plan',
        summary:
          'A plan that branches on your severity, your triggers and how you gamble. To keep and print.',
        minutes: 15,
      },
      {
        title: 'You are not alone',
        summary: 'Support groups, therapy and how to tell someone. The step that holds everything up.',
        minutes: 8,
      },
    ],
  },

  pgsi: {
    intro:
      'These nine questions are the PGSI, the questionnaire used in problem gambling prevalence studies. We did not invent it and it has published cut-offs, so the result means something specific.',
    timeframe: 'Think about the last twelve months.',
    disclaimer:
      'This is a screen, not a diagnosis. It locates your level of risk and guides what to do, but only a professional can diagnose a gambling disorder. A low score also does not rule out that gambling is harming you.',
    scale: ['Never', 'Sometimes', 'Most of the time', 'Almost always'],
    items: [
      'Have you bet more than you could really afford to lose?',
      'Have you needed to gamble with larger amounts to get the same feeling of excitement?',
      'Have you gone back another day to try to win back the money you lost?',
      'Have you borrowed money or sold anything to get money to gamble?',
      'Have you felt that you might have a problem with gambling?',
      'Has gambling caused you any health problems, including stress or anxiety?',
      'Has anyone criticised your gambling or told you that you had a problem, whether or not you thought they were right?',
      'Has your gambling caused financial problems for you or your household?',
      'Have you felt guilty about the way you gamble or what happens when you gamble?',
    ],
    attribution:
      'PGSI (Problem Gambling Severity Index), from the Canadian Problem Gambling Index — Ferris and Wynne, 2001.',
    submit: 'See my result',
    incomplete: '{n} questions still unanswered.',
    resultTitle: 'Your result',
    scoreLabel: 'PGSI score',
    bands: {
      none: {
        name: 'No risk indicators',
        meaning: 'No signs of problem gambling appear over the last twelve months.',
        advice:
          'If you gamble, keeping clear money and time limits is what keeps it that way. Knowing the maths helps: that is what the rest of this site is for.',
      },
      low: {
        name: 'Low risk',
        meaning:
          'One or two signs appear. At this level gambling does not usually cause visible consequences yet, but the signs rarely recede on their own.',
        advice:
          'This is the best moment to put barriers in place, precisely because it costs little. Setting limits now is far easier than pulling back later.',
      },
      moderate: {
        name: 'Moderate risk',
        meaning:
          'Several signs are present and you are probably already noticing consequences, even if you explain them by other causes.',
        advice:
          'At this level it helps to combine external barriers with support. Speaking to a professional does not mean the situation is severe — it means you want to keep it from becoming so.',
      },
      problem: {
        name: 'Problem gambling indicators',
        meaning:
          'Your score falls in the range research associates with problem gambling. Gambling is very likely affecting your finances, your health or your relationships.',
        advice:
          'The most effective thing now is not resolving to gamble less, but putting money and access out of your own reach and seeking professional help. Free, confidential support exists, and asking for it is what most changes the outcome.',
      },
    },
    concernsLabel: 'What weighs most in your result',
    retake: 'Answer again',
    continueCta: 'Build my plan from this result',
    savedNote: 'Saved in your browser. You can close the page and come back.',
  },

  plan: {
    intro:
      'This plan is built from your screening result. It is not a template: what you answer changes the barriers it proposes, the order of the urge protocol and how often to review it.',
    goalLabel: 'What do you want to achieve?',
    goals: {
      maintain: 'Keep the control I already have',
      reduce: 'Gamble considerably less',
      stop: 'Stop gambling altogether',
    },
    channelLabel: 'Where do you gamble?',
    channels: {
      online: 'Online (phone, computer)',
      venue: 'Bars, arcades or casinos',
      'lottery-shop': 'Lottery and newsagents',
    },
    gamesLabel: 'What do you play?',
    games: {
      slots: 'Slot machines',
      sports: 'Sports betting',
      casino: 'Casino (roulette, blackjack)',
      lottery: 'Lottery and scratch cards',
      poker: 'Poker',
    },
    triggersLabel: 'What usually comes right before you gamble?',
    triggers: {
      stress: 'Stress or built-up tension',
      boredom: 'Boredom or dead time',
      alcohol: 'After drinking',
      social: 'Being around people who gamble',
      'money-trouble': 'Money worries',
      'low-mood': 'Low mood or loneliness',
      payday: 'Getting paid',
      'sport-events': 'Matches or sporting events',
    },
    supportLabel: 'Does someone you trust know what is going on?',
    supportYes: 'Yes, someone knows',
    supportNo: 'I have not told anyone yet',
    supportNameLabel: 'Who? (for your plan only)',
    buildCta: 'Generate my plan',

    resultTitle: 'My plan',
    goalSection: 'My goal',
    barriersSection: 'Barriers I will put in place',
    triggersSection: 'What I do about my triggers',
    emergencySection: 'If the urge hits',
    reviewSection: 'Review',
    referralSection: 'Professional support',

    barriers: {
      rgiaj: {
        title: 'Register with the national self-exclusion scheme',
        how: 'In Spain the RGIAJ blocks you across every licensed operator, online and in person. Apply through the DGOJ electronic office; once done it no longer depends on your willpower.',
      },
      'venue-exclusion': {
        title: 'Self-exclude from the venues where I play',
        how: 'Arcades and casinos keep their own self-exclusion registers. Ask at reception: they are obliged to process it and to refuse you entry.',
      },
      'app-block': {
        title: 'Block gambling apps and sites',
        how: 'Install a device-level or DNS blocker and leave the password with someone else. The whole point is that you cannot disable it in the moment.',
      },
      'bank-block': {
        title: 'Ask my bank to block gambling payments',
        how: 'Many banks can block the gambling merchant category. Call and request it in writing; some also apply a cooling-off period before it can be lifted.',
      },
      'cash-only': {
        title: 'Carry only the cash I need',
        how: 'Leave the cards at home when going somewhere you could gamble. It is crude and it works: it turns an impulse into an errand.',
      },
      'deposit-limit': {
        title: 'Set deposit limits',
        how: 'Licensed operators are obliged to offer them. Set them low: raising them is delayed, lowering them is immediate. A minor barrier, not the main one.',
      },
      'time-limit': {
        title: 'Limit time, not just money',
        how: 'Fix windows in which you do not gamble and put them in the calendar. Exposure time predicts spending better than the intention to spend little.',
      },
      'delete-accounts': {
        title: 'Close my gambling accounts',
        how: 'Close them, do not just delete the app. Request permanent closure in writing: reopening has friction, reinstalling has none.',
      },
      'remove-shortcuts': {
        title: 'Remove the shortcuts',
        how: 'Turn off notifications, delete shortcuts, unfollow tipster and odds accounts. It does not remove the urge, but it removes the reminders that trigger it.',
      },
      'money-custodian': {
        title: 'Have someone else manage the money',
        how: 'Someone you trust holds cards and access for an agreed period, with an agreed weekly amount. It is the most uncomfortable barrier and the most effective once self-control has failed several times.',
      },
    },

    tactics: {
      'sustitucion-fisica': {
        title: 'Stress: get it out through the body before it reaches the phone',
        how: 'Decide in advance on a ten-minute physical action — fast walk, stairs, cold shower — and do it without deciding in the moment. Deciding is exactly what fails with the urge on you.',
      },
      'plan-alternativo': {
        title: 'Boredom: fill the gap before it appears',
        how: 'Identify the two windows of the day when you usually gamble and put something specific in the calendar for them. Emptiness is not resisted, it is occupied.',
      },
      'regla-absoluta': {
        title: 'Alcohol: a rule with no exceptions',
        how: 'No gambling on a day you drink, no nuances, no special cases. Rules with exceptions get renegotiated in the moment; absolute ones do not.',
      },
      'guion-social': {
        title: 'Social pressure: have the line ready',
        how: 'Decide the exact sentence you leave with, and say it early. Improvising in front of people is what ends with you gambling to avoid explaining yourself.',
      },
      'ayuda-financiera': {
        title: 'Money worries: separate the debt from the gambling',
        how: 'The urge to win it back grows with the debt. Find free debt advice and treat the two separately, because together they feed each other.',
      },
      'contacto-humano': {
        title: 'Low mood: contact before screen',
        how: 'Have a name decided and message them before opening anything. You do not have to explain what is happening — it is enough that the first move is toward a person.',
      },
      'automatizar-dinero': {
        title: 'Payday: make the money move by itself',
        how: 'Schedule fixed costs and a transfer to a card-less account for the day you are paid. What is not available does not get gambled.',
      },
      'cambiar-consumo': {
        title: 'Sport: change how you consume sport',
        how: 'Unfollow tipster and odds accounts, and watch matches with company or on delay. The link between watching sport and betting breaks by changing the context, not the willpower.',
      },
    },

    emergencySteps: {
      'hand-over-cards': 'Hand my cards or phone to the agreed person. This first, before anything else.',
      'wait-15': 'Wait fifteen minutes before doing anything. The urge subsides on its own — it does not feel like it, but it does.',
      'leave-place': 'Physically leave wherever I am.',
      'call-person': 'Call or message the person I trust.',
      'write-cost': 'Write down how much I have lost in total. In figures, not from memory.',
      'move-body': 'Move my body for ten minutes: walk, stairs, anything.',
      'call-helpline': 'Call a gambling helpline. Free and confidential.',
    },

    warnings: {
      'goal-below-severity':
        'You chose to cut down, but your screening result falls in the problem gambling band. In that range the evidence does not support controlled gambling as a goal: what works is stopping, with support. Your plan has been built around that goal. You can change it, but we wanted to say so plainly.',
      'no-support':
        'You indicated that nobody around you knows. That is the most common answer and the most costly: isolation is gambling’s greatest ally. You do not have to tell everyone or tell everything — one person changes a great deal.',
      'no-screening':
        'You have not completed the screen, so the plan was built on the most conservative assumption. It takes five minutes and sharpens the result considerably.',
      'no-barriers':
        'You have not indicated where you gamble, so no specific barriers can be proposed. Go back and mark it: it is the part of the plan that changes the most.',
    },

    referral: {
      none: 'Your result does not indicate a need for referral. If anything changes, the resources remain here.',
      suggested:
        'It is worth speaking to a professional. Not because the situation is severe, but because at this level outside support is what stops it becoming so. Helplines advise free and without commitment.',
      recommended:
        'We recommend seeking professional help now. Treatment for gambling disorder is free through public health services and member associations, and it is confidential. This plan supports that step, it does not replace it.',
    },
    reviewEvery: 'Review this plan every {n} days. Next review: {date}.',
    printCta: 'Print or save as PDF',
    privacyNote:
      'Your plan is stored only in this browser. If you clear browser data or use another device it is lost — print it or save it as a PDF if you want to keep it.',
  },
};

export const theWayContent: Record<Locale, TheWayStrings> = { es, en };
