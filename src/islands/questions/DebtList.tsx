import { useEffect, useMemo, useState } from 'react';
import { payoff, type Debt } from '../../lib/debts';
import { fmt, type Lang } from '../../i18n';

const KEY = 'ug-debts';

const T = {
  es: {
    title: 'Mis deudas',
    name: 'A quién',
    balance: 'Debo',
    rate: 'Interés anual %',
    min: 'Cuota mínima al mes',
    add: 'Añadir otra',
    remove: 'Quitar',
    budget: 'Lo que puedo dedicar cada mes',
    total: 'Debo en total',
    minSum: 'Cuotas mínimas',
    months: 'Lo termino de pagar en',
    interest: 'Intereses que pagaré',
    monthsN: (n: number, y: string) => `${n} meses (${y} años)`,
    never: 'Con este presupuesto, nunca',
    shortfall: (m: string) => `Te faltan ${m} al mes para cubrir las cuotas mínimas. Es el momento de hablar con los acreedores y de pedir orientación.`,
    order: 'Orden recomendado para el dinero que sobre: primero la deuda más cara.',
    placeholder: 'Banco, tarjeta, préstamo, familiar…',
    note: 'Se guarda solo en este navegador. Los intereses son una estimación con cuota fija.',
  },
  en: {
    title: 'My debts',
    name: 'Who to',
    balance: 'I owe',
    rate: 'Annual interest %',
    min: 'Minimum monthly payment',
    add: 'Add another',
    remove: 'Remove',
    budget: 'What I can put in each month',
    total: 'I owe in total',
    minSum: 'Minimum payments',
    months: 'Paid off in',
    interest: 'Interest I will pay',
    monthsN: (n: number, y: string) => `${n} months (${y} years)`,
    never: 'With this budget, never',
    shortfall: (m: string) => `You are ${m} a month short of the minimum payments. This is the time to talk to creditors and get advice.`,
    order: 'Recommended order for any money left over: the most expensive debt first.',
    placeholder: 'Bank, card, loan, relative…',
    note: 'Saved only in this browser. Interest is an estimate with fixed payments.',
  },
};

const blank = (): Debt => ({ name: '', balance: 0, rate: 0, min: 0 });

export default function DebtList({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [debts, setDebts] = useState<Debt[]>([{ name: '', balance: 1500, rate: 24, min: 60 }, blank()]);
  const [budget, setBudget] = useState(200);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (Array.isArray(s.debts)) setDebts(s.debts);
        if (typeof s.budget === 'number') setBudget(s.budget);
      }
    } catch {
      // nothing saved, or storage blocked
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ debts, budget }));
    } catch {
      // private mode
    }
  }, [debts, budget, loaded]);

  const live = debts.filter((d) => d.balance > 0).map((d, i) => ({ ...d, name: d.name || `#${i + 1}`, rate: d.rate / 100 }));
  const res = useMemo(() => payoff(live, budget), [JSON.stringify(live), budget]);
  const total = live.reduce((s, d) => s + d.balance, 0);
  const minSum = live.reduce((s, d) => s + d.min, 0);
  const set = (i: number, patch: Partial<Debt>) => setDebts((ds) => ds.map((d, j) => (j === i ? { ...d, ...patch } : d)));

  return (
    <div className="game debts">
      <section className="panel wide-panel">
        <p className="panel-label">{t.title}</p>
        <div className="ug-table-scroll full">
          <table className="paytable compare debt-table">
            <thead>
              <tr>
                <th scope="col">{t.name}</th>
                <th scope="col">{t.balance}</th>
                <th scope="col">{t.rate}</th>
                <th scope="col">{t.min}</th>
                <th scope="col">
                  <span className="visually-hidden">{t.remove}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {debts.map((d, i) => (
                <tr key={i}>
                  <td>
                    <input type="text" aria-label={t.name} placeholder={t.placeholder} value={d.name} onChange={(e) => set(i, { name: e.target.value })} />
                  </td>
                  <td>
                    <input type="number" aria-label={t.balance} min={0} step={50} value={d.balance} onChange={(e) => set(i, { balance: Math.max(0, Number(e.target.value)) })} />
                  </td>
                  <td>
                    <input type="number" aria-label={t.rate} min={0} step={1} value={d.rate} onChange={(e) => set(i, { rate: Math.max(0, Number(e.target.value)) })} />
                  </td>
                  <td>
                    <input type="number" aria-label={t.min} min={0} step={10} value={d.min} onChange={(e) => set(i, { min: Math.max(0, Number(e.target.value)) })} />
                  </td>
                  <td>
                    <button type="button" className="btn ghost small" aria-label={t.remove} onClick={() => setDebts((ds) => ds.filter((_, j) => j !== i))}>
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sim-controls">
          <button type="button" className="btn ghost small" onClick={() => setDebts((ds) => [...ds, blank()])}>
            + {t.add}
          </button>
          <label className="field-inline">
            <span>{t.budget}</span>
            <input type="number" min={0} step={10} value={budget} onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))} />
          </label>
        </div>

        {total > 0 && (
          <>
            <dl className="scores four">
              <div>
                <dt>{t.total}</dt>
                <dd>{f.eur(total)}</dd>
              </div>
              <div>
                <dt>{t.minSum}</dt>
                <dd>{f.eur(minSum)}</dd>
              </div>
              <div>
                <dt>{t.months}</dt>
                <dd>{res.months === null ? t.never : t.monthsN(res.months, f.num(res.months / 12, 1))}</dd>
              </div>
              <div>
                <dt>{t.interest}</dt>
                <dd className="loss">{res.months === null ? '—' : f.eur(res.totalInterest)}</dd>
              </div>
            </dl>
            {res.shortfall > 0 && <p className="loss">{t.shortfall(f.eur(res.shortfall))}</p>}
            {res.order.length > 1 && (
              <p>
                {t.order} {res.order.join(' → ')}
              </p>
            )}
          </>
        )}
        <p className="figure-foot">{t.note}</p>
      </section>
    </div>
  );
}
