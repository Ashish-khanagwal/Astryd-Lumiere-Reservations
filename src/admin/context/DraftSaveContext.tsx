import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';

type FlushFn = () => Promise<void>;

interface DraftSaveContextValue {
  registerFlush: (flush: FlushFn) => () => void;
  flushDraft: () => Promise<void>;
}

const DraftSaveContext = createContext<DraftSaveContextValue | undefined>(undefined);

export function draftPreviewUrl() {
  return `/?preview=true&t=${Date.now()}`;
}

export function DraftSaveProvider({ children }: { children: ReactNode }) {
  const flushRef = useRef<FlushFn | null>(null);

  const registerFlush = useCallback((flush: FlushFn) => {
    flushRef.current = flush;
    return () => {
      if (flushRef.current === flush) flushRef.current = null;
    };
  }, []);

  const flushDraft = useCallback(async () => {
    await flushRef.current?.();
  }, []);

  return <DraftSaveContext.Provider value={{ registerFlush, flushDraft }}>{children}</DraftSaveContext.Provider>;
}

export function useDraftSave() {
  const ctx = useContext(DraftSaveContext);
  if (!ctx) throw new Error('useDraftSave must be used within DraftSaveProvider');
  return ctx;
}

export function useRegisterDraftFlush(flush: FlushFn) {
  const ctx = useContext(DraftSaveContext);
  useEffect(() => {
    if (!ctx) return;
    return ctx.registerFlush(flush);
  }, [ctx, flush]);
}
