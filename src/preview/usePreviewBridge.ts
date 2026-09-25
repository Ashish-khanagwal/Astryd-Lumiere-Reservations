import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PREVIEW_SOURCE, isEditorMessage, normalizeHash, type MessageBody, type PreviewToEditorMessage } from './bridge';

const params = new URLSearchParams(window.location.search);
/** True only inside the admin Site Editor's preview iframe. */
export const IS_EDITOR_PREVIEW = params.get('preview') === 'true' && params.get('editor') === '1' && window.parent !== window;

const HEADER_OFFSET = 150;

function post(message: MessageBody<PreviewToEditorMessage>) {
  window.parent.postMessage({ source: PREVIEW_SOURCE, ...message }, window.location.origin);
}

/**
 * Child side of the Site Editor bridge (see ./bridge.ts). Only active inside the editor's iframe:
 * refetches on "refresh", follows "navigate"/"scrollTo", reports page changes, and turns clicks on a
 * homepage section into "edit this section" (links inside sections are disabled while editing, like Wix).
 */
export function usePreviewBridge() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!IS_EDITOR_PREVIEW) return;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !isEditorMessage(event.data)) return;
      const msg = event.data;
      if (msg.type === 'refresh') {
        // Small delay so the mock DB's cross-document storage sync lands before we refetch.
        window.setTimeout(() => void queryClient.invalidateQueries(), 60);
      } else if (msg.type === 'navigate') {
        if (normalizeHash(window.location.hash) !== normalizeHash(msg.hash)) window.location.hash = msg.hash;
      } else if (msg.type === 'scrollTo') {
        const el = document.querySelector(`[data-section="${CSS.escape(msg.section)}"]`);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET, behavior: 'smooth' });
      }
    };

    const onHashChange = () => post({ type: 'navigated', hash: normalizeHash(window.location.hash) });

    const onClick = (event: MouseEvent) => {
      const section = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-section]');
      if (!section) return;
      event.preventDefault();
      event.stopPropagation();
      post({ type: 'selectSection', section: section.dataset.section ?? '' });
    };

    const style = document.createElement('style');
    style.textContent = `
      [data-section] { position: relative; cursor: pointer; }
      [data-section]:hover { outline: 2px solid #4f46e5; outline-offset: -2px; }
      [data-section]:hover::after {
        content: 'Click to edit'; position: absolute; bottom: 16px; right: 16px; z-index: 60;
        background: #4f46e5; color: #fff; font: 600 12px/1 system-ui, sans-serif;
        padding: 6px 10px; border-radius: 999px; box-shadow: 0 4px 14px rgba(79,70,229,.35); pointer-events: none;
      }`;
    document.head.appendChild(style);

    window.addEventListener('message', onMessage);
    window.addEventListener('hashchange', onHashChange);
    document.addEventListener('click', onClick, true);
    post({ type: 'ready', hash: normalizeHash(window.location.hash) });

    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('hashchange', onHashChange);
      document.removeEventListener('click', onClick, true);
      style.remove();
    };
  }, [queryClient]);
}
