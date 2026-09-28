import { Check } from 'lucide-react';
import { useUpdateSection } from '../../../../hooks/api/useWebsite';
import { useAdminToast } from '../../../../context/AdminToastContext';
import { Button } from '../../../../components/Button';
import { SECTION_VARIANT_INFO } from '../../sectionMeta';
import { TEMPLATE_VARIANTS, type HomepageSection, type TemplateVariant } from '../../../../../types';

interface SectionLayoutPanelProps {
  section: HomepageSection;
  previewVariant: TemplateVariant;
  onPreviewVariant: (variant: TemplateVariant) => void;
  onApplied: () => void;
}

/** Pick a layout for one homepage section: the preview switches instantly; nothing changes on the site
 * until "Apply" - the same pattern as the per-module Layout tab (see `LayoutPanel.tsx`). */
export function SectionLayoutPanel({ section, previewVariant, onPreviewVariant, onApplied }: SectionLayoutPanelProps) {
  const updateSection = useUpdateSection();
  const { showToast } = useAdminToast();
  const info = SECTION_VARIANT_INFO[section.type];
  const isCurrent = previewVariant === section.templateVariant;

  const apply = () =>
    updateSection.mutate(
      { type: section.type, payload: { templateVariant: previewVariant } },
      {
        onSuccess: () => {
          showToast(`This section now uses ${info[previewVariant].name}.`);
          onApplied();
        },
      },
    );

  return (
    <div className="space-y-4">
      <p className="text-xs text-secondary">Click a layout to preview it with your real content. The same content works in every layout.</p>
      <div className="space-y-3">
        {TEMPLATE_VARIANTS.map((variant) => {
          const v = info[variant];
          const selected = variant === previewVariant;
          return (
            <button
              key={variant}
              type="button"
              aria-pressed={selected}
              onClick={() => onPreviewVariant(variant)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant/30 bg-surface hover:border-primary/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">Layout {variant.toUpperCase()}</span>
                {variant === section.templateVariant && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <Check className="h-3 w-3" /> Current
                  </span>
                )}
              </div>
              <div className="font-bold text-on-surface mt-1">{v.name}</div>
              <p className="text-xs text-secondary mt-1 leading-relaxed">{v.description}</p>
            </button>
          );
        })}
      </div>
      <div className="sticky bottom-0 -mx-5 px-5 py-4 bg-surface border-t border-outline-variant/15 flex items-center justify-between gap-3">
        <span className="text-xs text-secondary">{isCurrent ? 'This is the layout your site uses.' : `Previewing ${info[previewVariant].name}`}</span>
        <Button variant="primary" disabled={isCurrent} loading={updateSection.isPending} onClick={apply}>
          {isCurrent ? 'Current layout' : 'Apply layout'}
        </Button>
      </div>
    </div>
  );
}
