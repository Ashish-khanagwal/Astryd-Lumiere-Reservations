import { useCallback, useRef, useState } from 'react';
import { clearReserveHandoff, parseReserveHandoff } from '../../services/reserveHandoff';
import type { PublicAvailability } from '../../types';

/** Consume URL choices once, only after current tenant availability is loaded. */
export function useReserveHandoff(businessId: string) {
  const [handoff] = useState(() => parseReserveHandoff(new URLSearchParams(window.location.search), businessId));
  const applied = useRef(false);
  const [error, setError] = useState('');
  const apply = useCallback((result: PublicAvailability, date: string, party: number) => {
    if (!handoff || applied.current) return null;
    applied.current = true;
    clearReserveHandoff();
    const slot = [...result.slots.afternoon, ...result.slots.evening].find((value) => value.time24 === handoff.time && value.available);
    if (slot && date === handoff.date && party === handoff.partySize) return slot.time24;
    setError('The time selected on Astryd Reserve is no longer available. Please choose another time.');
    return null;
  }, [handoff]);
  return { handoff, apply, error };
}
