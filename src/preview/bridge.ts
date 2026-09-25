/**
 * postMessage protocol between the admin Site Editor (parent) and the public site rendered in its
 * preview iframe (child, loaded with `?preview=true&editor=1`). Kept backend-agnostic: the editor only
 * says "content changed, refetch" - it never pushes content itself.
 */

export const EDITOR_SOURCE = 'lumiere-editor';
export const PREVIEW_SOURCE = 'lumiere-preview';

export type EditorToPreviewMessage =
  | { source: typeof EDITOR_SOURCE; type: 'refresh' }
  | { source: typeof EDITOR_SOURCE; type: 'navigate'; hash: string }
  | { source: typeof EDITOR_SOURCE; type: 'scrollTo'; section: string };

export type PreviewToEditorMessage =
  | { source: typeof PREVIEW_SOURCE; type: 'ready'; hash: string }
  | { source: typeof PREVIEW_SOURCE; type: 'navigated'; hash: string }
  | { source: typeof PREVIEW_SOURCE; type: 'selectSection'; section: string };

/** A message minus its `source` tag, distributed over the union (plain `Omit` would collapse it to the shared keys). */
export type MessageBody<T> = T extends unknown ? Omit<T, 'source'> : never;

/** `data-section` marker values for things on the homepage that aren't CMS sections. */
export const LANDING_EXTRAS_SECTION = 'landing-extras';

export function isEditorMessage(data: unknown): data is EditorToPreviewMessage {
  return typeof data === 'object' && data !== null && (data as { source?: string }).source === EDITOR_SOURCE;
}

export function isPreviewMessage(data: unknown): data is PreviewToEditorMessage {
  return typeof data === 'object' && data !== null && (data as { source?: string }).source === PREVIEW_SOURCE;
}

export function normalizeHash(hash: string): string {
  const h = hash.replace(/^#\/?/, '').toLowerCase();
  return h ? `#/${h}` : '#/';
}
