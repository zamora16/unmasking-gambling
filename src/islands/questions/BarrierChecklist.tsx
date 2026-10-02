import { useEffect, useState } from 'react';
import { questionHref, type Lang } from '../../i18n';

// slug of the regional self-exclusion page (src/data/questions.ts, id 'ccaa')
const CCAA = { es: 'autoprohibicion-juego-comunidades-autonomas', en: 'gambling-self-exclusion-by-region-spain' };

const KEY = 'ug-barriers';

type Item = { id: string; title: string; how: string; link?: { label: string; url: string } };

const T: Record<Lang, { title: string; progress: (d: number, n: number) => string; reset: string; note: string; items: Item[] }> = {
  es: {
    title: 'Tus barreras',
    progress: (d, n) => `${d} de ${n} capas activadas`,
    reset: 'Empezar de cero',
    note: 'Las casillas se guardan solo en este navegador.',
    items: [
      {
        id: 'rgiaj',
        title: 'Inscribirme en el RGIAJ',
        how: 'Bloquea todo el juego online con licencia en España y las loterías presenciales donde se pide identificación.',
        link: { label: 'Sede de la DGOJ', url: 'https://www.ordenacionjuego.es/participantes-juego/juego-seguro/rgiaj' },
      },
      { id: 'regional', title: 'Inscribirme en el registro de mi comunidad autónoma', how: 'Salones, bingos y casinos físicos dependen de cada comunidad. Muchas están conectadas con el RGIAJ, pero conviene pedir las dos inscripciones.', link: { label: 'Trámite de cada comunidad', url: questionHref('es', CCAA) } },
      { id: 'accounts', title: 'Cerrar mis cuentas en casas de apuestas y casinos', how: 'Pide la autoexclusión o el cierre en cada una. Mientras tanto, pon el límite de depósito al mínimo.' },
      { id: 'blocker', title: 'Instalar un bloqueador en el móvil y el ordenador', how: 'BetBlocker es gratuito; Gamban es de pago. Deja la contraseña en manos de otra persona.', link: { label: 'BetBlocker', url: 'https://betblocker.org' } },
      { id: 'bank', title: 'Bloquear los pagos de juego en mi banco', how: 'Busca la opción en la app o pídelo por teléfono: bloqueo de pagos a comercios de juego y apuestas (código de comercio 7995). Baja también los límites de la tarjeta.' },
      { id: 'cards', title: 'Borrar las tarjetas guardadas', how: 'En el navegador, en las apps de pago y en cualquier web donde estén guardadas.' },
      { id: 'ads', title: 'Quitar los anuncios de juego', how: 'En Google, «Mi centro de anuncios» permite limitar los anuncios de juegos de azar. Deja de seguir cuentas de apuestas y tipsters en redes.' },
      { id: 'person', title: 'Contárselo a una persona de confianza', how: 'Alguien a quien escribir cuando llegue el impulso y que pueda guardar contraseñas o tarjetas un tiempo.' },
    ],
  },
  en: {
    title: 'Your barriers',
    progress: (d, n) => `${d} of ${n} layers in place`,
    reset: 'Start again',
    note: 'The boxes are saved only in this browser.',
    items: [
      { id: 'rgiaj', title: 'Join my national self-exclusion scheme', how: 'RGIAJ in Spain, GAMSTOP in the UK. It blocks licensed online gambling across the country.' },
      { id: 'regional', title: 'Exclude myself from venues', how: 'Arcades, bingo halls and casinos often have separate schemes, by region or by operator. Ask at each one.', link: { label: 'Spain, region by region', url: questionHref('en', CCAA) } },
      { id: 'accounts', title: 'Close my betting and casino accounts', how: 'Ask each one for self-exclusion or closure. In the meantime, set the deposit limit to the minimum.' },
      { id: 'blocker', title: 'Install a blocker on my phone and computer', how: 'BetBlocker is free; Gamban is paid. Let someone else hold the password.', link: { label: 'BetBlocker', url: 'https://betblocker.org' } },
      { id: 'bank', title: 'Block gambling payments at my bank', how: 'Look for the option in your banking app or ask by phone: a block on payments to gambling merchants (merchant code 7995). Lower your card limits too.' },
      { id: 'cards', title: 'Delete saved cards', how: 'In your browser, in payment apps and on any site where they are stored.' },
      { id: 'ads', title: 'Turn off gambling ads', how: 'Google’s “My Ad Center” lets you limit gambling ads. Unfollow betting and tipster accounts on social media.' },
      { id: 'person', title: 'Tell someone I trust', how: 'Someone to message when the urge comes, who can hold passwords or cards for a while.' },
    ],
  },
};

function load(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}

export default function BarrierChecklist({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => setDone(load()), []);
  const save = (next: Record<string, boolean>) => {
    setDone(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // private mode: the list still works for this visit
    }
  };
  const count = t.items.filter((i) => done[i.id]).length;

  return (
    <div className="game barriers">
      <section className="panel wide-panel">
        <div className="sim-controls">
          <p className="panel-label grow">
            {t.title} · {t.progress(count, t.items.length)}
          </p>
          {count > 0 && (
            <button type="button" className="btn ghost small" onClick={() => save({})}>
              {t.reset}
            </button>
          )}
        </div>
        <div className="bar-track" aria-hidden="true">
          <div className="bar-fill" style={{ width: `${(100 * count) / t.items.length}%` }} />
        </div>
        <ul className="checklist">
          {t.items.map((i) => (
            <li key={i.id} className={done[i.id] ? 'on' : ''}>
              <label>
                <input type="checkbox" checked={!!done[i.id]} onChange={(e) => save({ ...done, [i.id]: e.target.checked })} />
                <span>
                  <strong>{i.title}</strong>
                  <span className="how">
                    {i.how}
                    {i.link && (
                      <>
                        {' '}
                        <a href={i.link.url} rel="noopener">
                          {i.link.label} ↗
                        </a>
                      </>
                    )}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <p className="figure-foot">{t.note}</p>
      </section>
    </div>
  );
}
