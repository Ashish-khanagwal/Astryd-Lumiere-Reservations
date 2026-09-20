import { useCallback, useEffect, useRef, useState } from 'react';
import { useRegisterDraftFlush } from '../context/DraftSaveContext';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions<T> {
  isDirty: boolean;
  value: T;
  onSave: () => Promise<void>;
  delayMs?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({
  isDirty,
  value,
  onSave,
  delayMs = 800,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const onSaveRef = useRef(onSave);
  const isDirtyRef = useRef(isDirty);
  const valueKeyRef = useRef('');
  const lastSavedKeyRef = useRef('');
  const inFlightRef = useRef<Promise<void> | null>(null);
  const timerRef = useRef(0);

  onSaveRef.current = onSave;
  isDirtyRef.current = isDirty;
  valueKeyRef.current = JSON.stringify(value);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    }
    if (inFlightRef.current) {
      await inFlightRef.current;
    }
    if (!isDirtyRef.current) return;
    if (lastSavedKeyRef.current === valueKeyRef.current) return;

    const savingKey = valueKeyRef.current;
    setStatus('saving');
    const run = onSaveRef.current();
    inFlightRef.current = run;
    try {
      await run;
      lastSavedKeyRef.current = savingKey;
      setStatus('saved');
    } catch {
      setStatus('error');
      throw new Error('Draft save failed');
    } finally {
      inFlightRef.current = null;
    }

    if (isDirtyRef.current && valueKeyRef.current !== savingKey) {
      await flush();
    }
  }, []);

  useRegisterDraftFlush(flush);

  useEffect(() => {
    if (!enabled || !isDirty) return;
    timerRef.current = window.setTimeout(() => {
      void flush().catch(() => undefined);
    }, delayMs);
    return () => {
      window.clearTimeout(timerRef.current);
      timerRef.current = 0;
    };
  }, [isDirty, value, delayMs, enabled, flush]);

  useEffect(() => {
    return () => {
      if (!isDirtyRef.current) return;
      void onSaveRef.current().catch(() => undefined);
    };
  }, []);

  return { status, flush, isSaving: status === 'saving' };
}
