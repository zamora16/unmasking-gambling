/**
 * Session model for a slot machine where volatility changes the *shape* of the
 * payout distribution while the RTP stays exactly the same: payoutTable()
 * rescales each shape to the requested RTP. Two machines with identical RTP
 * give opposite sessions and the same expected end. The peak is what people
 * remember; the final balance is what they pay.
 */
import { mulberry32 } from './rng';

export type Volatility = 'low' | 'medium' | 'high';

/**
 * Forma de la distribución de premios: pares [multiplicador, probabilidad].
 *
 * Los multiplicadores son relativos: `payoutTable()` los reescala para que el
 * RTP salga exactamente el pedido. Así la volatilidad cambia la **forma** del
 * reparto sin tocar el total devuelto, que es justo lo que hay que demostrar.
 */
const SHAPES: Record<Volatility, Array<[number, number]>> = {
  // Premios pequeños y constantes: casi la mitad de las tiradas devuelven algo.
  low: [
    [0, 0.55],
    [1, 0.26],
    [2, 0.13],
    [4, 0.05],
    [10, 0.009],
    [40, 0.001],
  ],
  medium: [
    [0, 0.72],
    [1, 0.13],
    [3, 0.09],
    [8, 0.045],
    [30, 0.014],
    [150, 0.001],
  ],
  // Rachas largas sin nada y algún premio grande muy de tarde en tarde.
  high: [
    [0, 0.88],
    [2, 0.06],
    [6, 0.035],
    [25, 0.018],
    [120, 0.006],
    [800, 0.001],
  ],
};

export interface Outcome {
  multiplier: number;
  probability: number;
}

/** Tabla de premios calibrada para que el RTP sea exactamente `rtp` (0.95 = 95 %). */
export function payoutTable(volatility: Volatility, rtp: number): Outcome[] {
  const shape = SHAPES[volatility];
  const rawEv = shape.reduce((sum, [multiplier, p]) => sum + multiplier * p, 0);
  const scale = rawEv > 0 ? rtp / rawEv : 0;
  return shape.map(([multiplier, probability]) => ({
    multiplier: multiplier * scale,
    probability,
  }));
}

/** Proporción de tiradas que devuelven algo. Es lo que se percibe como "está pagando". */
export function hitFrequency(volatility: Volatility): number {
  return SHAPES[volatility]
    .filter(([multiplier]) => multiplier > 0)
    .reduce((sum, [, p]) => sum + p, 0);
}

function spin(table: Outcome[], random: () => number): number {
  let roll = random();
  for (const outcome of table) {
    roll -= outcome.probability;
    if (roll <= 0) return outcome.multiplier;
  }
  return table[table.length - 1].multiplier;
}

export interface SessionResult {
  /** Saldo tras cada tirada, incluido el inicial. */
  balance: number[];
  spins: number;
  /** Saldo máximo alcanzado: la cifra que la memoria retiene. */
  peak: number;
  peakSpin: number;
  finalBalance: number;
  /** Tiradas en las que se iba por encima del saldo inicial. */
  spinsAhead: number;
  /** Dinero total apostado. Casi siempre mucho mayor que lo perdido. */
  turnover: number;
  totalWon: number;
  biggestWin: number;
  /** Si el saldo llegó a cero antes de agotar las tiradas previstas. */
  busted: boolean;
}

export function simulateSession(options: {
  bankroll: number;
  bet: number;
  spins: number;
  rtp: number;
  volatility: Volatility;
  seed: number;
}): SessionResult {
  const { bankroll, bet, spins, rtp, volatility, seed } = options;
  const table = payoutTable(volatility, rtp);
  const random = mulberry32(seed);

  const balance: number[] = [bankroll];
  let current = bankroll;
  let peak = bankroll;
  let peakSpin = 0;
  let spinsAhead = 0;
  let turnover = 0;
  let totalWon = 0;
  let biggestWin = 0;
  let played = 0;

  for (let i = 0; i < spins; i += 1) {
    if (current < bet) break;

    current -= bet;
    turnover += bet;
    played += 1;

    const win = spin(table, random) * bet;
    current += win;
    totalWon += win;
    if (win > biggestWin) biggestWin = win;

    if (current > peak) {
      peak = current;
      peakSpin = played;
    }
    if (current > bankroll) spinsAhead += 1;

    balance.push(current);
  }

  return {
    balance,
    spins: played,
    peak,
    peakSpin,
    finalBalance: current,
    spinsAhead,
    turnover,
    totalWon,
    biggestWin,
    busted: current < bet,
  };
}
