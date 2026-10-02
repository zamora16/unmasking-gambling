/**
 * A calendar reminder (.ics) built in the browser, so a review date can live
 * in the person's own calendar without anything being sent anywhere.
 */

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

/** RFC 5545 text escaping. */
function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Lines longer than 75 octets are folded (approximated with characters). */
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ' ' + rest.slice(74);
  }
  out.push(rest);
  return out.join('\r\n');
}

export interface Reminder {
  date: Date;
  title: string;
  description: string;
  url?: string;
  /** Repeat every n days, `count` times in total. */
  repeatDays?: number;
  count?: number;
  uid: string;
}

/** An all-day event with an alert at 9:00 that day. */
export function reminderIcs(r: Reminder, now = new Date()): string {
  const end = new Date(r.date);
  end.setDate(end.getDate() + 1);
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Unmasking Gambling//Plan//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${r.uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ymd(r.date)}`,
    `DTEND;VALUE=DATE:${ymd(end)}`,
    `SUMMARY:${esc(r.title)}`,
    `DESCRIPTION:${esc(r.description + (r.url ? `\n${r.url}` : ''))}`,
    ...(r.url ? [`URL:${r.url}`] : []),
    ...(r.repeatDays ? [`RRULE:FREQ=DAILY;INTERVAL=${r.repeatDays}${r.count ? `;COUNT=${r.count}` : ''}`] : []),
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(r.title)}`,
    'TRIGGER;RELATED=START:PT9H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

/** Offer a text file for download, in the browser. */
export function downloadText(name: string, text: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
