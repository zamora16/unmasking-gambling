/**
 * PGSI — Problem Gambling Severity Index.
 *
 * Instrumento de cribado de nueve ítems del Canadian Problem Gambling Index
 * (Ferris y Wynne, 2001), de uso libre en salud pública e investigación. Es el
 * estándar en estudios poblacionales y tiene puntos de corte publicados, a
 * diferencia del cuestionario casero que había antes en el paso 2.
 *
 * IMPORTANTE: es un cribado, no un diagnóstico. Sitúa a la persona en una banda
 * de riesgo y orienta la intensidad de la respuesta. El diagnóstico de trastorno
 * de juego solo puede hacerlo un profesional. Todo texto de resultado debe
 * decirlo de forma explícita.
 *
 * Marco temporal de las preguntas: los últimos 12 meses.
 */

export const PGSI_ITEM_COUNT = 9;
export const PGSI_MAX_SCORE = 27; // 9 ítems × 3 puntos

/** Escala de cada ítem. El orden importa: el índice es la puntuación. */
export type PgsiAnswer = 0 | 1 | 2 | 3;

export type SeverityBand = 'none' | 'low' | 'moderate' | 'problem';

export interface SeverityDefinition {
  band: SeverityBand;
  min: number;
  max: number;
  /** Intensidad de la respuesta que corresponde a esta banda. */
  urgency: 'informative' | 'preventive' | 'active' | 'urgent';
  /** Si la banda justifica recomendar derivación profesional. */
  referral: boolean;
  /** Objetivo que el plan propone por defecto en esta banda. */
  suggestedGoal: 'maintain' | 'reduce' | 'stop';
  /** Cada cuántos días conviene revisar el plan. */
  reviewDays: number;
}

/**
 * Puntos de corte del PGSI. Son los publicados, no una interpretación propia:
 * cambiarlos invalidaría la comparabilidad con la literatura.
 */
export const SEVERITY_BANDS: SeverityDefinition[] = [
  {
    band: 'none',
    min: 0,
    max: 0,
    urgency: 'informative',
    referral: false,
    suggestedGoal: 'maintain',
    reviewDays: 90,
  },
  {
    band: 'low',
    min: 1,
    max: 2,
    urgency: 'preventive',
    referral: false,
    suggestedGoal: 'reduce',
    reviewDays: 30,
  },
  {
    band: 'moderate',
    min: 3,
    max: 7,
    urgency: 'active',
    referral: true,
    suggestedGoal: 'reduce',
    reviewDays: 14,
  },
  {
    band: 'problem',
    min: 8,
    max: PGSI_MAX_SCORE,
    urgency: 'urgent',
    referral: true,
    suggestedGoal: 'stop',
    reviewDays: 7,
  },
];

export function scorePgsi(answers: Array<PgsiAnswer | null>): number | null {
  if (answers.length !== PGSI_ITEM_COUNT) return null;
  if (answers.some((answer) => answer === null)) return null;
  return (answers as PgsiAnswer[]).reduce<number>((total, answer) => total + answer, 0);
}

export function bandForScore(score: number): SeverityDefinition {
  const clamped = Math.min(Math.max(score, 0), PGSI_MAX_SCORE);
  // El último tramo cubre hasta el máximo, así que siempre hay coincidencia.
  return (
    SEVERITY_BANDS.find((definition) => clamped >= definition.min && clamped <= definition.max) ??
    SEVERITY_BANDS[SEVERITY_BANDS.length - 1]
  );
}

/**
 * Los ítems que más pesan en el resultado, para poder devolver una lectura
 * concreta ("esto es lo que más te está afectando") en lugar de solo una cifra.
 */
export function topConcerns(answers: Array<PgsiAnswer | null>, limit = 2): number[] {
  return answers
    .map((answer, index) => ({ index, value: answer ?? 0 }))
    .filter((entry) => entry.value >= 2)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((entry) => entry.index);
}
