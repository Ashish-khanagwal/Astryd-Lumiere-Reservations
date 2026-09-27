import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, Eye, EyeOff, Rows3, Sparkles } from 'lucide-react';
import { useHomepageDraft, useReorderSections, useUpdateSection } from '../../../../hooks/api/useWebsite';
import { useRegisterDraftFlush } from '../../../../context/DraftSaveContext';
import { ReorderableList } from '../../../../components/ReorderableList';
import { ToggleField } from '../../../../components/forms/ToggleField';
import { Button } from '../../../../components/Button';
import { ListSkeleton } from '../../../../components/Skeleton';
import { SECTION_ICON, SECTION_LABEL } from '../../sectionMeta';
import { SectionContentEditor } from './SectionContentEditor';
import { PanelLoadError } from './PanelLoadError';
import type { PanelCallbacks } from './panelTypes';
import type { HomepageSection, HomepageSectionType } from '../../../../../types';

interface SectionsPanelProps extends PanelCallbacks {
  openSection: HomepageSectionType | null;
  onOpenSection: (type: HomepageSectionType | null) => void;
  onOpenExtras: () => void;
}

const orderKey = (sections: HomepageSection[]) => sections.map((s) => s.id).join(',');

function SectionList({ sections, onOpenSection, onOpenExtras, onSaved }: { sections: HomepageSection[] } & Pick<SectionsPanelProps, 'onOpenSection' | 'onOpenExtras' | 'onSaved'>) {
  const reorderSections = useReorderSections();
  const updateSection = useUpdateSection();
  const [draftOrder, setDraftOrder] = useState<HomepageSection[]>(sections);

  // Keep local order, but pick up server-side changes (visibility, content) for the rows we already have.
  useEffect(() => {
    setDraftOrder((prev) => {
      const byId = new Map(sections.map((s) => [s.id, s]));
      const kept = prev.filter((s) => byId.has(s.id)).map((s) => byId.get(s.id)!);
      return [...kept, ...sections.filter((s) => !kept.some((k) => k.id === s.id))];
    });
  }, [sections]);

  const isDirty = orderKey(draftOrder) !== orderKey(sections);
  const saveOrder = useCallback(async () => {
    if (!isDirty) return;
    await reorderSections.mutateAsync(draftOrder.map((s, idx) => ({ sectionId: s.id, order: idx + 1 })));
    onSaved();
  }, [draftOrder, isDirty, onSaved, reorderSections]);
  useRegisterDraftFlush(saveOrder);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-secondary">Drag to reorder. Click a section to edit it - or click it in the preview.</p>
        {isDirty && (
          <Button variant="primary" size="sm" loading={reorderSections.isPending} onClick={() => void saveOrder()}>
            Save order
          </Button>
        )}
      </div>

      <ReorderableList
        items={draftOrder}
        onReorder={setDraftOrder}
        renderItem={(section, dragHandle) => {
          const Icon = SECTION_ICON[section.type] ?? Rows3;
          return (
            <div className={`flex items-center gap-2 rounded-xl border border-outline-variant/25 pl-1 pr-2 py-1.5 transition-colors ${section.visible ? 'bg-surface hover:border-primary/40' : 'bg-surface-container-low/70'}`}>
              {dragHandle}
              <button type="button" onClick={() => onOpenSection(section.type)} className="flex flex-1 min-w-0 items-center gap-3 py-1.5 text-left">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${section.visible ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-secondary'}`}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-semibold truncate ${section.visible ? 'text-on-surface' : 'text-secondary'}`}>{SECTION_LABEL[section.type] ?? section.type}</span>
                  <span className="flex items-center gap-1 text-[11px] text-secondary">
                    {section.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {section.visible ? 'Shown' : 'Hidden'}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-secondary shrink-0" />
              </button>
              <ToggleField
                label=""
                checked={section.visible}
                onChange={(visible) => updateSection.mutate({ type: section.type, payload: { visible } }, { onSuccess: onSaved })}
              />
            </div>
          );
        }}
      />

      <button
        type="button"
        onClick={onOpenExtras}
        className="w-full flex items-center gap-3 rounded-xl border border-dashed border-outline-variant/50 px-3 py-3 text-left hover:border-primary/50 hover:bg-primary/5 transition-colors"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-secondary">
          <Sparkles className="h-[18px] w-[18px]" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-on-surface">Quick action bar & info cards</span>
          <span className="block text-[11px] text-secondary">The strip under the hero, amenity cards and other homepage text</span>
        </span>
        <ChevronRight className="h-4 w-4 text-secondary shrink-0" />
      </button>
    </div>
  );
}

/** Home → Sections tab: reorder / show / hide, then drill into a section to edit it (Wix-style panel). */
export function SectionsPanel({ openSection, onOpenSection, onOpenExtras, ...callbacks }: SectionsPanelProps) {
  const { data: homepage, isLoading, isError, isFetching, refetch } = useHomepageDraft();
  const sections = useMemo(() => [...(homepage?.sections ?? [])].sort((a, b) => a.order - b.order), [homepage]);

  if (!homepage && isError) return <PanelLoadError onRetry={() => void refetch()} isRetrying={isFetching} />;
  if (isLoading || !homepage) return <ListSkeleton rows={7} />;

  const active = openSection ? sections.find((s) => s.type === openSection) : undefined;
  if (active) {
    const Icon = SECTION_ICON[active.type] ?? Rows3;
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => onOpenSection(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-secondary hover:text-on-surface transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All sections
        </button>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-on-surface leading-tight">{SECTION_LABEL[active.type]}</h2>
            <p className="text-xs text-secondary">{active.visible ? 'Shown on your homepage' : 'Hidden - turn it on from the section list'}</p>
          </div>
        </div>
        <SectionContentEditor key={active.id} section={active} {...callbacks} />
      </div>
    );
  }

  return <SectionList sections={sections} onOpenSection={onOpenSection} onOpenExtras={onOpenExtras} onSaved={callbacks.onSaved} />;
}
