/**
 * Motor del plan personal.
 *
 * El plan anterior era un formulario de veinte campos que se imprimía tal cual:
 * alguien con juego diario y cribado severo recibía el mismo documento que alguien
 * que juega la lotería una vez al mes. Aquí el plan **se ramifica**.
 *
 * Tres decisiones sostienen el diseño:
 *
 * 1. La gravedad manda sobre el objetivo declarado. Si el cribado indica juego
 *    problemático y la persona dice querer "reducir", el plan lo señala en vez de
 *    aceptarlo en silencio: en esa banda el juego controlado no es el objetivo
 *    que respalda la evidencia.
 * 2. Las barreras dependen del canal. Autoexcluirse del RGIAJ no sirve de nada a
 *    quien juega en una máquina de bar, y bloquear apps no sirve a quien no juega
 *    en el móvil.
 * 3. Cada disparador declarado genera una táctica concreta, no un consejo genérico.
 */

import { bandForScore, type SeverityBand, type SeverityDefinition } from './pgsi';

export type Channel = 'online' | 'venue' | 'lottery-shop';
export type GameKind = 'slots' | 'sports' | 'casino' | 'lottery' | 'poker';
export type TriggerId =
  | 'stress'
  | 'boredom'
  | 'alcohol'
  | 'social'
  | 'money-trouble'
  | 'low-mood'
  | 'payday'
  | 'sport-events';
export type Goal = 'maintain' | 'reduce' | 'stop';

export type BarrierId =
  | 'rgiaj'
  | 'venue-exclusion'
  | 'app-block'
  | 'bank-block'
  | 'cash-only'
  | 'deposit-limit'
  | 'time-limit'
  | 'delete-accounts'
  | 'remove-shortcuts'
  | 'money-custodian';

export interface PlanProfile {
  /** Puntuación PGSI. `null` si la persona no hizo el cribado. */
  pgsiScore: number | null;
  goal: Goal;
  channels: Channel[];
  games: GameKind[];
  triggers: TriggerId[];
  /** Si tiene a alguien de confianza a quien recurrir. */
  hasSupport: boolean;
}

export type WarningId = 'goal-below-severity' | 'no-support' | 'no-screening' | 'no-barriers';

export interface PlanOutput {
  band: SeverityBand;
  severity: SeverityDefinition;
  /** El objetivo que el plan recomienda, que puede diferir del declarado. */
  recommendedGoal: Goal;
  /** Barreras ordenadas por eficacia para este perfil. Las primeras son las que importan. */
  barriers: BarrierId[];
  /** Una táctica por disparador declarado. */
  triggerTactics: Array<{ trigger: TriggerId; tactic: string }>;
  /** Pasos del protocolo de impulso, en orden. Cuanto mayor la gravedad, más concreto. */
  emergencySteps: EmergencyStepId[];
  referral: 'none' | 'suggested' | 'recommended';
  reviewDays: number;
  warnings: WarningId[];
}

export type EmergencyStepId =
  | 'wait-15'
  | 'leave-place'
  | 'call-person'
  | 'call-helpline'
  | 'hand-over-cards'
  | 'move-body'
  | 'write-cost';

/** Cada disparador tiene una táctica propia: dónde falla, qué se pone en su lugar. */
const TRIGGER_TACTICS: Record<TriggerId, string> = {
  stress: 'sustitucion-fisica',
  boredom: 'plan-alternativo',
  alcohol: 'regla-absoluta',
  social: 'guion-social',
  'money-trouble': 'ayuda-financiera',
  'low-mood': 'contacto-humano',
  payday: 'automatizar-dinero',
  'sport-events': 'cambiar-consumo',
};

/**
 * Barreras por canal, ordenadas por eficacia real. La autoexclusión oficial va
 * primero donde aplica porque es la única que no depende de la fuerza de voluntad
 * en el momento del impulso.
 */
const BARRIERS_BY_CHANNEL: Record<Channel, BarrierId[]> = {
  online: ['rgiaj', 'app-block', 'bank-block', 'delete-accounts', 'remove-shortcuts', 'deposit-limit'],
  venue: ['venue-exclusion', 'rgiaj', 'cash-only', 'money-custodian', 'time-limit'],
  'lottery-shop': ['cash-only', 'money-custodian', 'remove-shortcuts'],
};

/**
 * Gravedad mínima a partir de la cual cada barrera es proporcionada.
 *
 * Sin este filtro, alguien sin ningún síntoma que juega la lotería una vez al mes
 * recibiría la recomendación de que otra persona le custodie el dinero. Proponer
 * medidas desmedidas no es inocuo: hace que se descarte el plan entero.
 */
const BARRIER_MIN_BAND: Record<BarrierId, SeverityBand> = {
  'remove-shortcuts': 'none',
  'time-limit': 'none',
  'deposit-limit': 'none',
  'cash-only': 'low',
  'app-block': 'low',
  'delete-accounts': 'low',
  rgiaj: 'moderate',
  'venue-exclusion': 'moderate',
  'bank-block': 'moderate',
  'money-custodian': 'problem',
};

const BAND_RANK: Record<SeverityBand, number> = { none: 0, low: 1, moderate: 2, problem: 3 };

export function buildPlan(profile: PlanProfile): PlanOutput {
  const severity = bandForScore(profile.pgsiScore ?? 0);
  const warnings: WarningId[] = [];

  if (profile.pgsiScore === null) warnings.push('no-screening');

  // La gravedad manda sobre el objetivo declarado: en juego problemático, el
  // juego controlado no es el objetivo que respalda la evidencia.
  const goalRank: Record<Goal, number> = { maintain: 0, reduce: 1, stop: 2 };
  const recommendedGoal =
    goalRank[profile.goal] < goalRank[severity.suggestedGoal] ? severity.suggestedGoal : profile.goal;

  if (recommendedGoal !== profile.goal) warnings.push('goal-below-severity');
  if (!profile.hasSupport && severity.urgency !== 'informative') warnings.push('no-support');

  // Barreras: unión de las de cada canal declarado, filtradas por proporcionalidad.
  const barrierSet = new Set<BarrierId>();
  for (const channel of profile.channels) {
    for (const barrier of BARRIERS_BY_CHANNEL[channel]) barrierSet.add(barrier);
  }
  // En banda problemática la custodia del dinero deja de ser opcional.
  if (severity.band === 'problem') barrierSet.add('money-custodian').add('bank-block');

  const barriers = [...barrierSet].filter(
    (barrier) => BAND_RANK[severity.band] >= BAND_RANK[BARRIER_MIN_BAND[barrier]],
  );

  if (barriers.length === 0) warnings.push('no-barriers');

  const triggerTactics = profile.triggers.map((trigger) => ({
    trigger,
    tactic: TRIGGER_TACTICS[trigger],
  }));

  return {
    band: severity.band,
    severity,
    recommendedGoal,
    barriers,
    triggerTactics,
    emergencySteps: emergencyStepsFor(severity.band, profile.hasSupport),
    referral: referralFor(severity.band),
    reviewDays: severity.reviewDays,
    warnings,
  };
}

/**
 * El protocolo se vuelve más concreto y menos dependiente de la voluntad a medida
 * que sube la gravedad: en banda problemática lo primero no es respirar, es poner
 * el dinero fuera de alcance.
 */
function emergencyStepsFor(band: SeverityBand, hasSupport: boolean): EmergencyStepId[] {
  const base: EmergencyStepId[] = ['wait-15', 'leave-place', 'move-body'];

  if (band === 'none' || band === 'low') return base;

  const escalated: EmergencyStepId[] = ['wait-15', 'leave-place', 'write-cost', 'move-body'];
  if (hasSupport) escalated.splice(2, 0, 'call-person');

  if (band === 'problem') {
    return ['hand-over-cards', ...escalated, 'call-helpline'];
  }
  return [...escalated, 'call-helpline'];
}

function referralFor(band: SeverityBand): PlanOutput['referral'] {
  if (band === 'problem') return 'recommended';
  if (band === 'moderate') return 'suggested';
  return 'none';
}
