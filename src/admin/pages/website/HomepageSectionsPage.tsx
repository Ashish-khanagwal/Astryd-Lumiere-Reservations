import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rows3, SquarePen } from 'lucide-react';
import {
  useHomepageDraft,
  usePublishWebsite,
  useReorderSections,
  useUpdateSection,
  useWebsiteStatus,
} from '../../hooks/api/useWebsite';
import { useAdminToast } from '../../context/AdminToastContext';
import { useRegisterDraftFlush } from '../../context/DraftSaveContext';
import { ReorderableList } from '../../components/ReorderableList';
import { ToggleField } from '../../components/forms/ToggleField';
import { PageHeader } from '../../components/PageHeader';
import { PublishBar } from '../../components/PublishBar';
import { Button } from '../../components/Button';
import { ListSkeleton } from '../../components/Skeleton';
import { SECTION_LABEL, SECTION_ICON } from './sectionMeta';
import type { HomepageSection } from '../../../types';

function sectionOrderKey(sections: HomepageSection[]) {
  return sections.map((section) => section.id).join(',');
}

export function HomepageSectionsPage() {
  const { data: homepage, isLoading } = useHomepageDraft();
  const { data: website } = useWebsiteStatus();
  const reorderSections = useReorderSections();
  const updateSection = useUpdateSection();
  const publishWebsite = usePublishWebsite();
  const { showToast } = useAdminToast();
  const navigate = useNavigate();

  const serverSections = useMemo(
    () => (homepage ? [...homepage.sections].sort((a, b) => a.order - b.order) : []),
    [homepage],
  );

  const [draftSections, setDraftSections] = useState<HomepageSection[]>([]);

  useEffect(() => {
    if (!serverSections.length) return;
    setDraftSections((prev) => {
      const byId = new Map(serverSections.map((section) => [section.id, section]));
      if (!prev.length) return serverSections;
      const kept = prev.filter((section) => byId.has(section.id)).map((section) => byId.get(section.id)!);
      const seen = new Set(kept.map((section) => section.id));
      for (const section of serverSections) {
        if (!seen.has(section.id)) kept.push(section);
      }
      return kept;
    });
  }, [serverSections]);

  const isDirty = Boolean(draftSections.length) && sectionOrderKey(draftSections) !== sectionOrderKey(serverSections);

  const persistDraft = useCallback(async () => {
    if (!isDirty) return;
    await reorderSections.mutateAsync(draftSections.map((section, idx) => ({ sectionId: section.id, order: idx + 1 })));
  }, [draftSections, isDirty, reorderSections]);

  useRegisterDraftFlush(persistDraft);

  const handleSaveDraft = async () => {
    await persistDraft();
    showToast('Section order saved.');
  };

  const handlePublish = async () => {
    if (isDirty) await persistDraft();
    await publishWebsite.mutateAsync();
    showToast('Website published.');
  };

  const header = (
    <PageHeader
      icon={Rows3}
      title="Homepage Sections"
      description="Drag to reorder, then save. Toggle visibility or edit each section's content."
      actions={
        <Button variant="primary" disabled={!isDirty} loading={reorderSections.isPending} onClick={() => void handleSaveDraft()}>
          Save order
        </Button>
      }
    />
  );

  if (isLoading || !homepage) {
    return (
      <div className="space-y-6">
        {header}
        <ListSkeleton rows={7} />
      </div>
    );
  }

  const sections = draftSections.length ? draftSections : serverSections;

  return (
    <div>
      <PublishBar
        isDirty={isDirty}
        isSaving={reorderSections.isPending}
        isPublishing={publishWebsite.isPending}
        onSaveDraft={() => void handleSaveDraft()}
        onPublish={() => void handlePublish()}
        lastPublishedAt={website?.publishedAt}
      />

      <div className="space-y-6">
        {header}

        <ReorderableList
          items={sections}
          onReorder={setDraftSections}
          renderItem={(section, dragHandle) => {
            const Icon = SECTION_ICON[section.type] ?? Rows3;
            return (
              <div className={`flex items-center gap-3 rounded-xl border border-outline-variant/20 p-4 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing ${section.visible ? 'bg-surface' : 'bg-surface-container-low/50'}`}>
                {dragHandle}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${section.visible ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-secondary'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold ${section.visible ? 'text-on-surface' : 'text-secondary'}`}>{SECTION_LABEL[section.type] ?? section.type}</div>
                  {!section.visible && <div className="text-xs text-secondary">Hidden from website</div>}
                </div>
                <ToggleField
                  label=""
                  checked={section.visible}
                  onChange={(visible) => updateSection.mutate({ type: section.type, payload: { visible } })}
                />
                <button
                  onClick={() => navigate(`/admin/website/homepage/${section.type}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-outline-variant/40 text-sm font-medium hover:bg-surface-container-high transition-colors"
                >
                  <SquarePen className="h-4 w-4" />
                  Edit
                </button>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
