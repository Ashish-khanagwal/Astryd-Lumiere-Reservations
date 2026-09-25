import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePageContentDraft, useUpdatePageContent } from '../../../../hooks/api/usePageContent';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { FormSkeleton } from '../../../../components/Skeleton';
import { CONTENT_PAGES, contentDefaults } from '../../../../../content/registry';
import { ContentGroupsEditor } from '../../content/ContentGroupsEditor';
import { useReportAutoSave, type PanelCallbacks } from './panelTypes';
import type { ContentFields, ContentPageKey, TemplateVariant, Vertical } from '../../../../../types';

interface PageContentPanelProps extends PanelCallbacks {
  page: ContentPageKey;
  vertical: Vertical;
  activeVariant?: TemplateVariant;
}

/** Text & images for one page (Admin → Page Content), with auto-save into the draft. Remount per page. */
export function PageContentPanel({ page, vertical, activeVariant, ...callbacks }: PageContentPanelProps) {
  const { data: stored } = usePageContentDraft();
  const updateContent = useUpdatePageContent();
  const serverFields = useMemo(() => (stored ? (stored[page] ?? {}) : undefined), [stored, page]);
  const [draft, setDraft] = useState<ContentFields | null>(null);

  // Seed once; later refetches (after our own saves) must not overwrite what the owner is typing.
  useEffect(() => {
    if (serverFields && !draft) setDraft(serverFields);
  }, [serverFields, draft]);

  const isDirty = Boolean(draft && serverFields && JSON.stringify(draft) !== JSON.stringify(serverFields));
  const persist = useCallback(async () => {
    if (draft) await updateContent.mutateAsync({ page, fields: draft });
  }, [draft, page, updateContent]);

  const { status } = useAutoSave({ isDirty, value: draft, onSave: persist, enabled: Boolean(draft) });
  useReportAutoSave(status, callbacks);

  if (!draft) return <FormSkeleton />;

  return (
    <ContentGroupsEditor
      definition={CONTENT_PAGES[page]}
      defaults={contentDefaults(vertical, page)}
      overrides={draft}
      activeVariant={activeVariant}
      onChange={setDraft}
    />
  );
}
