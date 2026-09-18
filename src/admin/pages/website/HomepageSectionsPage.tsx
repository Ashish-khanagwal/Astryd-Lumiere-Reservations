import { useNavigate } from 'react-router-dom';
import { Rows3, SquarePen } from 'lucide-react';
import { useHomepageDraft, useReorderSections, useUpdateSection } from '../../hooks/api/useWebsite';
import { ReorderableList } from '../../components/ReorderableList';
import { ToggleField } from '../../components/forms/ToggleField';
import { PageHeader } from '../../components/PageHeader';
import { ListSkeleton } from '../../components/Skeleton';
import { SECTION_LABEL, SECTION_ICON } from './sectionMeta';
import type { HomepageSection } from '../../../types';

export function HomepageSectionsPage() {
  const { data: homepage, isLoading } = useHomepageDraft();
  const reorderSections = useReorderSections();
  const updateSection = useUpdateSection();
  const navigate = useNavigate();

  const header = <PageHeader icon={Rows3} title="Homepage Sections" description="Drag to reorder, toggle visibility, or edit each section's content." />;

  if (isLoading || !homepage) {
    return (
      <div className="space-y-6">
        {header}
        <ListSkeleton rows={7} />
      </div>
    );
  }

  const sections = [...homepage.sections].sort((a, b) => a.order - b.order);

  const handleReorder = (next: HomepageSection[]) => {
    reorderSections.mutate(next.map((s, idx) => ({ sectionId: s.id, order: idx + 1 })));
  };

  return (
    <div className="space-y-6">
      {header}

      <ReorderableList
        items={sections}
        onReorder={handleReorder}
        renderItem={(section, dragHandle) => {
          const Icon = SECTION_ICON[section.type] ?? Rows3;
          return (
            <div className={`flex items-center gap-3 rounded-xl border border-outline-variant/20 p-4 shadow-sm transition-all hover:shadow-md ${section.visible ? 'bg-surface' : 'bg-surface-container-low/50'}`}>
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
  );
}
