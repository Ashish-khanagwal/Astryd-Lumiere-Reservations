/** Formats a stored "HH:mm" time for display - "20:00" stays as-is on a 24-hour Site, "8:00 PM" on a 12-hour (US-style) one. */
export function formatClockTime(time: string | null | undefined, clockFormat: string): string {
  if (!time) return '';
  if (clockFormat !== '12h') return time;
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return time;
  const hour = Number(match[1]);
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${match[2]} ${period}`;
}
