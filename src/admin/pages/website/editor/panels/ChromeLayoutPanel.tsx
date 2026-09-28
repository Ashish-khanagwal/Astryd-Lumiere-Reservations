import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useBrandDraft, useUpdateBrand } from '../../../../hooks/api/useWebsite';
import { useAdminToast } from '../../../../context/AdminToastContext';
import { Button } from '../../../../components/Button';
import { FormSkeleton } from '../../../../components/Skeleton';
import { PanelLoadError } from './PanelLoadError';
import { CHROME_VARIANT_INFO } from '../../../settings/pageConfigMeta';
import { TEMPLATE_VARIANTS, type TemplateVariant } from '../../../../../types';

type ChromePart = 'header' | 'footer';
const PART_LABEL: Record<ChromePart, string> = { header: 'Header', footer: 'Footer' };

interface ChromeLayoutPanelProps {
  onPreviewOverride: (override: { key: ChromePart; variant: TemplateVariant } | null) => void;
  onApplied: () => void;
}

/** One Header layout picker and one Footer layout picker, side by side - only ever one of them being
 * live-previewed at a time, the same "preview then Apply" pattern as a module or section layout. */
export function ChromeLayoutPanel({ onPreviewOverride, onApplied }: ChromeLayoutPanelProps) {
  const { data: brand, isError, isFetching, refetch } = useBrandDraft();
  const updateBrand = useUpdateBrand();
  const { showToast } = useAdminToast();
  const [active, setActive] = useState<{ part: ChromePart; variant: TemplateVariant } | null>(null);

  const currentVariant = (part: ChromePart): TemplateVariant => (part === 'header' ? brand?.headerVariant : brand?.footerVariant) ?? 'a';

  useEffect(() => {
    onPreviewOverride(active && active.variant !== currentVariant(active.part) ? { key: active.part, variant: active.variant } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, brand?.headerVariant, brand?.footerVariant]);
  useEffect(() => () => onPreviewOverride(null), [onPreviewOverride]);

  if (!brand) return isError ? <PanelLoadError onRetry={() => void refetch()} isRetrying={isFetching} /> : <FormSkeleton />;

  const apply = (part: ChromePart, variant: TemplateVariant) =>
    updateBrand.mutate(
      { [part === 'header' ? 'headerVariant' : 'footerVariant']: variant },
      {
        onSuccess: () => {
          showToast(`${PART_LABEL[part]} now uses ${CHROME_VARIANT_INFO[part][variant].name}.`);
          setActive(null);
          onApplied();
        },
      },
    );

  const renderPart = (part: ChromePart) => {
    const info = CHROME_VARIANT_INFO[part];
    const saved = currentVariant(part);
    const previewing = active?.part === part ? active.variant : saved;
    const isCurrent = previewing === saved;

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-on-surface">{PART_LABEL[part]}</h3>
        <div className="space-y-3">
          {TEMPLATE_VARIANTS.map((variant) => {
            const selected = variant === previewing;
            return (
              <button
                key={variant}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive({ part, variant })}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                  selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant/30 bg-surface hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">Layout {variant.toUpperCase()}</span>
                  {variant === saved && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      <Check className="h-3 w-3" /> Current
                    </span>
                  )}
                </div>
                <div className="font-bold text-on-surface mt-1">{info[variant].name}</div>
                <p className="text-xs text-secondary mt-1 leading-relaxed">{info[variant].description}</p>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-secondary">{isCurrent ? 'This is what your site uses.' : `Previewing ${info[previewing].name}`}</span>
          <Button variant="primary" size="sm" disabled={isCurrent} loading={updateBrand.isPending} onClick={() => apply(part, previewing)}>
            {isCurrent ? 'Current' : 'Apply'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-secondary">Click a layout to preview it with your real content. The same content works in every layout.</p>
      {renderPart('header')}
      <div className="h-px bg-outline-variant/15" />
      {renderPart('footer')}
    </div>
  );
}
