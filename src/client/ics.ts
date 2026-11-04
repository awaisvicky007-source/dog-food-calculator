/** Account-free reminders as downloadable .ics files (PRD V1: "ics first"). */
const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

function wrap(events: string[]): string {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PawVortex//Dog Food Calculator//EN', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n');
}
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}@pawvortex.com`;
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');

export function reorderIcs(petName: string, daysLeft: number): string {
  const due = new Date();
  due.setDate(due.getDate() + Math.max(1, Math.floor(daysLeft) - 7)); // remind a week before running out
  const next = new Date(due);
  next.setDate(next.getDate() + 1);
  return wrap([
    'BEGIN:VEVENT',
    `UID:${uid()}`,
    `DTSTAMP:${stamp()}`,
    `DTSTART;VALUE=DATE:${ymd(due)}`,
    `DTEND;VALUE=DATE:${ymd(next)}`,
    `SUMMARY:${esc(`Reorder food for ${petName}`)}`,
    `DESCRIPTION:${esc('Estimated from your bag size and daily amount. Adjust to your dog\u2019s body condition.')}`,
    'END:VEVENT',
  ]);
}

export function mealsIcs(petName: string, meals: number, perMeal: string): string {
  const times = { 1: [8], 2: [8, 18], 3: [7, 13, 19], 4: [7, 11, 15, 19] } as Record<number, number[]>;
  const hours = times[meals] ?? [8, 18];
  const today = new Date();
  const events = hours.map((h) =>
    [
      'BEGIN:VEVENT',
      `UID:${uid()}`,
      `DTSTAMP:${stamp()}`,
      `DTSTART:${ymd(today)}T${pad(h)}0000`,
      `DTEND:${ymd(today)}T${pad(h)}1500`,
      'RRULE:FREQ=DAILY',
      `SUMMARY:${esc(`Feed ${petName}`)}`,
      `DESCRIPTION:${esc(`Planned amount: ${perMeal}`)}`,
      'END:VEVENT',
    ].join('\r\n'),
  );
  return wrap(events);
}

export function download(filename: string, text: string, mime = 'text/calendar') {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
