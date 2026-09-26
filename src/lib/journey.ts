/**
 * Estado de El Camino, guardado únicamente en el navegador.
 *
 * Decisión deliberada: **nada de esto sale del dispositivo**. Son datos sobre
 * adicción, deudas y salud mental; un backend convertiría el recurso en un
 * riesgo para quien lo usa. Si el proyecto añade cuentas algún día, tendrá que
 * ser con consentimiento explícito y separado, nunca heredando de aquí.
 */

import type { PgsiAnswer } from './pgsi';
import type { Channel, GameKind, Goal, TriggerId } from './plan';

const STORAGE_KEY = 'ug.journey.v1';

export interface JourneyState {
  pgsi: {
    answers: Array<PgsiAnswer | null>;
    score: number | null;
    completedAt: string | null;
  };
  plan: {
    goal: Goal;
    channels: Channel[];
    games: GameKind[];
    triggers: TriggerId[];
    hasSupport: boolean;
    supportName: string;
    builtAt: string | null;
  };
  /** Pasos marcados como leídos, para la barra de progreso. */
  stepsDone: number[];
}

export function emptyJourney(): JourneyState {
  return {
    pgsi: { answers: Array(9).fill(null), score: null, completedAt: null },
    plan: {
      goal: 'reduce',
      channels: [],
      games: [],
      triggers: [],
      hasSupport: false,
      supportName: '',
      builtAt: null,
    },
    stepsDone: [],
  };
}

export function loadJourney(): JourneyState {
  if (typeof localStorage === 'undefined') return emptyJourney();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyJourney();
    // Fusión superficial con el estado vacío: si una versión futura añade campos,
    // los guardados antiguos siguen cargando en vez de romper la página.
    const parsed = JSON.parse(raw) as Partial<JourneyState>;
    const base = emptyJourney();
    return {
      pgsi: { ...base.pgsi, ...parsed.pgsi },
      plan: { ...base.plan, ...parsed.plan },
      stepsDone: parsed.stepsDone ?? base.stepsDone,
    };
  } catch {
    return emptyJourney();
  }
}

export function saveJourney(state: JourneyState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Modo privado o almacenamiento lleno: la herramienta sigue funcionando
    // dentro de la sesión, solo se pierde al recargar. Mejor que romperse.
  }
}

export function clearJourney(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignorado a propósito */
  }
}

/** Fecha de la próxima revisión a partir de la cadencia que fije el plan. */
export function nextReviewDate(reviewDays: number, from = new Date()): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + reviewDays);
  return next;
}
