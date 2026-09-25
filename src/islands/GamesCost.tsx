import { useState } from 'react';
import { fmt, type Lang } from '../i18n';

export interface GameRow {
  key: string;
  edge: number;
  pace: number; // default bets per hour
}

export const GAME_ROWS: GameRow[] = [
  { key: 'euromillones', edge: 0.5, pace: 1 },
  { key: 'primitiva', edge: 0.45, pace: 1 },
  { key: 'nacional', edge: 0.3, pace: 1 },
  { key: 'acca', edge: 1 - (1 / 1.067) ** 3, pace: 4 },
  { key: 'sports', edge: 0.067 / 1.067, pace: 4 },
  { key: 'rouletteUS', edge: 2 / 38, pace: 60 },
  { key: 'slots', edge: 0.04, pace: 600 },
  { key: 'rouletteEU', edge: 1 / 37, pace: 60 },
  { key: 'craps', edge: 7 / 495, pace: 60 },
  { key: 'baccarat', edge: 0.0106, pace: 70 },
  { key: 'blackjack', edge: 0.005, pace: 70 },
];

const T = {
  es: {
    names: {
      euromillones: 'EuroMillones',
      primitiva: 'La Primitiva',
      nacional: 'Lotería Nacional',
      acca: 'Combinada de 3 partidos',
      rouletteUS: 'Ruleta americana',
      sports: 'Apuesta deportiva simple',
      slots: 'Tragaperras (RTP 96 %)',
      rouletteEU: 'Ruleta europea',
      craps: 'Dados (craps), línea de pase',
      baccarat: 'Baccarat, a la banca',
      blackjack: 'Blackjack con estrategia perfecta',
    } as Record<string, string>,
    game: 'Juego',
    stake: 'Dinero por apuesta',
    pace: 'Apuestas por hora',
    hours: 'Horas a la semana',
    perHour: 'Pérdida esperada por hora',
    perYear: 'Pérdida esperada al año',
    wagered: 'Total apostado al año',
    title: '¿Cuánto cuesta jugar?',
    sub: 'La pérdida esperada es la ventaja de la casa multiplicada por todo lo que apuestas. Ajusta tu ritmo.',
    note: (x: string) => `La casa se queda de media con ${x} de cada euro que pasa por el juego.`,
  },
  en: {
    names: {
      euromillones: 'EuroMillions',
      primitiva: 'La Primitiva (Spanish lotto)',
      nacional: 'Spanish National Lottery',
      acca: '3-match accumulator',
      rouletteUS: 'American roulette',
      sports: 'Single sports bet',
      slots: 'Slot machine (96% RTP)',
      rouletteEU: 'European roulette',
      craps: 'Craps, pass line',
      baccarat: 'Baccarat, banker',
      blackjack: 'Blackjack with perfect strategy',
    } as Record<string, string>,
    game: 'Game',
    stake: 'Money per bet',
    pace: 'Bets per hour',
    hours: 'Hours per week',
    perHour: 'Expected loss per hour',
    perYear: 'Expected loss per year',
    wagered: 'Total wagered per year',
    title: 'What does it cost to play?',
    sub: 'The expected loss is the house edge times everything you wager. Set your own pace.',
    note: (x: string) => `On average the house keeps ${x} of every euro that goes through the game.`,
  },
};

export default function GamesCost({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [key, setKey] = useState('slots');
  const g = GAME_ROWS.find((r) => r.key === key)!;
  const [stake, setStake] = useState(1);
  const [pace, setPace] = useState(g.pace);
  const [hours, setHours] = useState(3);
  const perHour = g.edge * stake * pace;
  const wagered = stake * pace * hours * 52;
  return (
    <div className="calc cost">
      <p className="figure-title">{t.title}</p>
      <p className="figure-sub">{t.sub}</p>
      <div className="cost-grid">
        <label>
          <span>{t.game}</span>
          <select
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setPace(GAME_ROWS.find((r) => r.key === e.target.value)!.pace);
            }}
          >
            {GAME_ROWS.map((r) => (
              <option key={r.key} value={r.key}>
                {t.names[r.key]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{t.stake}</span>
          <input type="number" min={0.1} step={0.5} value={stake} onChange={(e) => setStake(Math.max(0, Number(e.target.value)))} />
        </label>
        <label>
          <span>{t.pace}</span>
          <input type="number" min={1} step={1} value={pace} onChange={(e) => setPace(Math.max(1, Number(e.target.value)))} />
        </label>
        <label>
          <span>{t.hours}</span>
          <input type="number" min={0} step={1} value={hours} onChange={(e) => setHours(Math.max(0, Number(e.target.value)))} />
        </label>
      </div>
      <div className="cost-out" aria-live="polite">
        <div>
          <span>{t.perHour}</span>
          <strong className="num">{f.eur(perHour, 2)}</strong>
        </div>
        <div>
          <span>{t.wagered}</span>
          <strong className="num">{f.eur(wagered)}</strong>
        </div>
        <div className="big">
          <span>{t.perYear}</span>
          <strong className="num">{f.eur(perHour * hours * 52)}</strong>
        </div>
      </div>
      <p className="figure-foot">{t.note(f.eur(g.edge, 3))}</p>
    </div>
  );
}
