import { useEffect, useRef } from 'react';
import type { AutoSaveStatus } from '../../../../hooks/useAutoSave';

export interface PanelCallbacks {
  /** A change reached the draft - the live preview should refetch. */
  onSaved: () => void;
  /** Feeds the editor's single "Saving… / All changes saved" indicator. */
  onStatus: (status: AutoSaveStatus) => void;
}

/** Relays a panel's useAutoSave status to the editor shell, and pings the preview after each successful save. */
export function useReportAutoSave(status: AutoSaveStatus, { onSaved, onStatus }: PanelCallbacks) {
  const callbacks = useRef({ onSaved, onStatus });
  callbacks.current = { onSaved, onStatus };
  useEffect(() => {
    callbacks.current.onStatus(status);
    if (status === 'saved') callbacks.current.onSaved();
  }, [status]);
}
