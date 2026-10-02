import { useMemo, useState } from 'react';
import { simulateBonus, wageringRequired, edgeCost, type BonusInput } from '../../lib/bonus';
import type { Volatility } from '../../lib/volatility';
import { fmt, type Lang } from '../../i18n';
import { Dual } from '../../charts/core';

const RUNS = 1000;
const VOLS: Volatility[] = ['low', 'medium', 'high'];

const T = {
  es: {
    deposit: 'Depósito',
    bonus: 'Bono',
    mult: 'Requisito de apuesta',
    base: 'Se calcula sobre',
    baseBonus: 'el bono',
    baseBoth: 'depósito + bono',
    rtp: 'RTP del juego',
    vol: 'Volatilidad',
    vols: { low: 'Baja', medium: 'Media', high: 'Alta' } as Record<Volatility, string>,
    bet: 'Apuesta por tirada',
    required: 'Tienes que apostar',
    cost: 'Pérdida media por la ventaja',
    completed: 'Llegan a cobrar algo',
    ahead: 'Acaban con más de lo que depositaron',
    net: 'Resultado medio frente a no jugar',
    sim: (n: string) => `${n} personas simuladas aceptan este bono y juegan hasta cumplir el requisito o quedarse sin saldo.`,
    simple: (req: string, ahead: string) =>
      `El bono parece dinero gratis, pero solo se convierte en dinero de verdad después de apostar ${req}. Por el camino, la mayoría se queda sin saldo y pierde también su depósito: solo el ${ahead} termina con más de lo que puso.`,
    tech: (cost: string) =>
      `Modelo simplificado: depósito y bono forman un solo saldo, cada tirada cuenta al 100 % para el requisito y no hay tope de ganancia ni de apuesta. La ventaja sobre el requisito cuesta ${cost}, pero el resultado medio puede salir mejor porque quien se arruina deja de apostar. Las condiciones reales (apuesta máxima, tope de retirada, juegos que cuentan menos o están excluidos, plazos) existen precisamente para cerrar ese hueco.`,
  },
  en: {
    deposit: 'Deposit',
    bonus: 'Bonus',
    mult: 'Wagering requirement',
    base: 'Calculated on',
    baseBonus: 'the bonus',
    baseBoth: 'deposit + bonus',
    rtp: 'Game RTP',
    vol: 'Volatility',
    vols: { low: 'Low', medium: 'Medium', high: 'High' } as Record<Volatility, string>,
    bet: 'Bet per spin',
    required: 'You must stake',
    cost: 'Average loss to the edge',
    completed: 'Get to cash anything',
    ahead: 'End with more than they deposited',
    net: 'Average result vs not playing',
    sim: (n: string) => `${n} simulated people accept this bonus and play until they meet the requirement or run out of money.`,
    simple: (req: string, ahead: string) =>
      `The bonus looks like free money, but it only becomes real money after you stake ${req}. Along the way, most people run out of balance and lose their deposit too: only ${ahead} end with more than they put in.`,
    tech: (cost: string) =>
      `Simplified model: deposit and bonus form one balance, every spin counts 100% towards the requirement and there is no cap on winnings or stakes. The edge on the requirement costs ${cost}, but the average result can come out better because those who go bust stop betting. Real terms (maximum bet, withdrawal cap, games that count less or are excluded, deadlines) exist precisely to close that gap.`,
  },
};

export default function BonusCalc({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [deposit, setDeposit] = useState(100);
  const [bonus, setBonus] = useState(100);
  const [multiplier, setMultiplier] = useState(35);
  const [base, setBase] = useState<BonusInput['base']>('bonus');
  const [rtp, setRtp] = useState(96);
  const [volatility, setVolatility] = useState<Volatility>('medium');
  const [bet, setBet] = useState(1);
  const input: BonusInput = { deposit, bonus, multiplier, base, rtp: rtp / 100, volatility, bet };
  const ok = deposit > 0 && bonus >= 0 && bet > 0;
  const res = useMemo(() => (ok ? simulateBonus(input, RUNS, 5) : null), [deposit, bonus, multiplier, base, rtp, volatility, bet]);

  return (
    <div className="game bonus">
      <section className="panel wide-panel">
        <div className="sim-controls">
          <label className="field-inline">
            <span>{t.deposit}</span>
            <input type="number" min={10} step={10} value={deposit} onChange={(e) => setDeposit(Math.max(0, Number(e.target.value)))} />
          </label>
          <label className="field-inline">
            <span>{t.bonus}</span>
            <input type="number" min={0} step={10} value={bonus} onChange={(e) => setBonus(Math.max(0, Number(e.target.value)))} />
          </label>
          <label className="field-inline grow">
            <span>
              {t.mult}: <strong className="num">{multiplier}×</strong>
            </span>
            <input type="range" min={1} max={60} value={multiplier} onChange={(e) => setMultiplier(Number(e.target.value))} />
          </label>
          <div className="field-inline">
            <span>{t.base}</span>
            <div className="seg-group" role="radiogroup" aria-label={t.base}>
              {(['bonus', 'both'] as const).map((b) => (
                <button key={b} type="button" role="radio" aria-checked={base === b} className={`seg-btn${base === b ? ' on' : ''}`} onClick={() => setBase(b)}>
                  {b === 'bonus' ? t.baseBonus : t.baseBoth}
                </button>
              ))}
            </div>
          </div>
          <label className="field-inline grow">
            <span>
              {t.rtp}: <strong className="num">{f.num(rtp, 1)} %</strong>
            </span>
            <input type="range" min={90} max={99} step={0.5} value={rtp} onChange={(e) => setRtp(Number(e.target.value))} />
          </label>
          <div className="field-inline">
            <span>{t.vol}</span>
            <div className="seg-group" role="radiogroup" aria-label={t.vol}>
              {VOLS.map((v) => (
                <button key={v} type="button" role="radio" aria-checked={volatility === v} className={`seg-btn${volatility === v ? ' on' : ''}`} onClick={() => setVolatility(v)}>
                  {t.vols[v]}
                </button>
              ))}
            </div>
          </div>
          <label className="field-inline">
            <span>{t.bet}</span>
            <select value={bet} onChange={(e) => setBet(Number(e.target.value))}>
              {[0.5, 1, 2, 5].map((b) => (
                <option key={b} value={b}>
                  {f.eur(b, b < 1 ? 2 : 0)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {res && (
          <>
            <dl className="scores four">
              <div>
                <dt>{t.required}</dt>
                <dd>{f.eur(wageringRequired(input))}</dd>
              </div>
              <div>
                <dt>{t.ahead}</dt>
                <dd>{f.pct(res.ahead, 0)}</dd>
              </div>
              <div>
                <dt>{t.completed}</dt>
                <dd>{f.pct(res.completed, 0)}</dd>
              </div>
              <div>
                <dt>{t.net}</dt>
                <dd className={res.meanNet < 0 ? 'loss' : 'win'}>{(res.meanNet < 0 ? '−' : '+') + f.eur(Math.abs(res.meanNet))}</dd>
              </div>
            </dl>
            <p className="figure-foot">{t.sim(f.int(RUNS))}</p>
            <p className="figure-foot">
              <Dual simple={t.simple(f.eur(wageringRequired(input)), f.pct(res.ahead, 0))} tech={t.tech(f.eur(edgeCost(input)))} />
            </p>
          </>
        )}
      </section>
    </div>
  );
}
