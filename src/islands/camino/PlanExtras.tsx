/**
 * Ways to take the plan out of the website: a calendar reminder for the
 * review date, and an image of the urge protocol to keep on the phone.
 * Both are made in the browser; nothing is uploaded.
 */
import { reminderIcs, downloadText } from '../../lib/ics';
import type { Lang } from '../../i18n';

interface Props {
  lang: Lang;
  reviewDate: Date;
  reviewDays: number;
  steps: string[];
  supportName: string;
  planUrl: string;
}

const T = {
  es: {
    calendar: 'Añadir las revisiones a mi calendario',
    card: 'Descargar tarjeta para el móvil',
    hint: 'La tarjeta es una imagen con tu protocolo para cuando lleguen las ganas. Guárdala en la galería o ponla de fondo de pantalla.',
    icsTitle: 'Revisar mi plan de juego',
    icsBody: 'Abre tu plan y repasa: ¿qué ha funcionado?, ¿qué te ha costado?, ¿hace falta otra barrera?',
    cardTitle: 'Si me entran ganas de jugar',
    cardFoot: 'Las ganas suben y bajan. Aguanta 15 minutos.',
    phones: ['FEJAR · 900 200 225', 'Crisis · 024 · Emergencias · 112'],
    contact: (n: string) => `Mi persona: ${n}`,
  },
  en: {
    calendar: 'Add the reviews to my calendar',
    card: 'Download a card for my phone',
    hint: 'The card is an image with your plan for when an urge comes. Save it to your photos or use it as your lock screen.',
    icsTitle: 'Review my gambling plan',
    icsBody: 'Open your plan and go over it: what worked? what was hard? do you need another barrier?',
    cardTitle: 'If I get the urge to gamble',
    cardFoot: 'Urges rise and fall. Hold on for 15 minutes.',
    phones: ['UK · 0808 8020 133', 'US · 1-800-GAMBLER'],
    contact: (n: string) => `My person: ${n}`,
  },
};

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > width && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

async function drawCard(lang: Lang, steps: string[], supportName: string): Promise<Blob | null> {
  const t = T[lang];
  const W = 1080;
  const H = 1920;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  try {
    await document.fonts.ready;
  } catch {
    // system fonts are fine
  }
  const g = ctx.createRadialGradient(W / 2, -200, 100, W / 2, 0, 1400);
  g.addColorStop(0, '#1f4633');
  g.addColorStop(1, '#0e1d16');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const sans = "'Inter Tight Variable', 'Inter Tight', system-ui, sans-serif";
  const display = "'Barlow Condensed', 'Arial Narrow', sans-serif";
  const x = 90;
  let y = 330; // leave room for the clock on a lock screen
  ctx.fillStyle = '#c9a45c';
  ctx.font = `600 92px ${display}`;
  for (const l of wrap(ctx, t.cardTitle.toUpperCase(), W - 2 * x)) {
    ctx.fillText(l, x, y);
    y += 96;
  }
  y += 40;
  steps.forEach((s, i) => {
    ctx.fillStyle = '#c9a45c';
    ctx.font = `600 44px ${sans}`;
    ctx.fillText(String(i + 1), x, y);
    ctx.fillStyle = '#f2ecdf';
    ctx.font = `400 42px ${sans}`;
    for (const l of wrap(ctx, s, W - 2 * x - 70)) {
      ctx.fillText(l, x + 70, y);
      y += 56;
    }
    y += 30;
  });
  y += 20;
  ctx.strokeStyle = '#36573f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(W - x, y);
  ctx.stroke();
  y += 80;
  ctx.font = `600 44px ${sans}`;
  ctx.fillStyle = '#f2ecdf';
  if (supportName.trim()) {
    ctx.fillText(t.contact(supportName.trim()), x, y);
    y += 70;
  }
  for (const p of t.phones) {
    ctx.fillText(p, x, y);
    y += 70;
  }
  ctx.fillStyle = '#e0553d';
  ctx.fillRect(x, H - 260, 140, 10);
  ctx.fillStyle = '#c7c0ae';
  ctx.font = `400 40px ${sans}`;
  for (const l of wrap(ctx, t.cardFoot, W - 2 * x)) {
    ctx.fillText(l, x, H - 190);
  }
  return new Promise((res) => c.toBlob((b) => res(b), 'image/png'));
}

export default function PlanExtras({ lang, reviewDate, reviewDays, steps, supportName, planUrl }: Props) {
  const t = T[lang];
  const ics = () =>
    downloadText(
      lang === 'es' ? 'revision-plan.ics' : 'plan-review.ics',
      reminderIcs({ date: reviewDate, title: t.icsTitle, description: t.icsBody, url: planUrl, repeatDays: reviewDays, count: 6, uid: `plan-${Date.now()}@unmasking-gambling` }),
      'text/calendar',
    );
  const card = async () => {
    const blob = await drawCard(lang, steps, supportName);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = lang === 'es' ? 'mi-plan-impulso.png' : 'my-urge-plan.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <>
      <div className="cam-actions">
        <button type="button" className="btn ghost" onClick={ics}>
          {t.calendar}
        </button>
        <button type="button" className="btn ghost" onClick={card}>
          {t.card}
        </button>
      </div>
      <p className="cam-small">{t.hint}</p>
    </>
  );
}
