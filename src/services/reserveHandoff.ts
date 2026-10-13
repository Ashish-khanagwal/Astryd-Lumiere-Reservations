/** Reserve links carry booking choices only; tenant resolution stays with /s/:slug. */
export function parseReserveHandoff(params: URLSearchParams, businessId: string) {
  if (params.get('source') !== 'astryd-reserve' || params.get('reserve_business') !== businessId) return null;
  const date = params.get('reserve_date') ?? '';
  const time = params.get('reserve_time') ?? '';
  const partySize = Number(params.get('reserve_party'));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) || !Number.isInteger(partySize) || partySize < 1 || partySize > 20) return null;
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime()) || `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}` !== date) return null;
  return { date, time, partySize };
}

export function clearReserveHandoff() {
  const url = new URL(window.location.href);
  for (const name of ['reserve_date', 'reserve_time', 'reserve_party', 'reserve_business', 'source']) url.searchParams.delete(name);
  window.history.replaceState(window.history.state, '', url);
}
