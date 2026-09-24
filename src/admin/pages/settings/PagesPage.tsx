import { useEffect, useState } from 'react';
import { LayoutList, ArrowUp, ArrowDown } from 'lucide-react';
import { usePageConfigs, useUpdatePageConfig } from '../../hooks/api/usePageConfigs';
import { useAdminToast } from '../../context/AdminToastContext';
import { PageHeader } from '../../components/PageHeader';
import { ListSkeleton } from '../../components/Skeleton';
import { ToggleField } from '../../components/forms/ToggleField';
import { TextField, SelectField } from '../../components/forms/Field';
import { MODULE_LABEL, MODULE_DESCRIPTION, VARIANT_LABEL } from './pageConfigMeta';
import type { PageConfig, TemplateVariant } from '../../../types';

export function PagesPage() {
  const { data: pageConfigs, isLoading } = usePageConfigs();
  const updateConfig = useUpdatePageConfig();
  const { showToast } = useAdminToast();
  const [rows, setRows] = useState<PageConfig[]>([]);

  useEffect(() => {
    if (pageConfigs) setRows([...pageConfigs].sort((a, b) => a.order - b.order));
  }, [pageConfigs]);

  const header = (
    <PageHeader
      icon={LayoutList}
      title="Pages"
      description="Rename, reorder, enable, and choose a layout for each part of your site - the same 3 layouts work for any kind of business."
    />
  );

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        {header}
        <ListSkeleton rows={3} />
      </div>
    );
  }

  const move = (index: number, dir: -1 | 1) => {
    const next = [...rows];
    const swapWith = index + dir;
    if (swapWith < 0 || swapWith >= next.length) return;
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    setRows(next);
    next.forEach((row, order) => {
      if (row.order !== order) {
        updateConfig.mutate({ module: row.module, patch: { order } });
      }
    });
  };

  const handleLabelBlur = (row: PageConfig, value: string) => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === row.navLabel) return;
    updateConfig.mutate({ module: row.module, patch: { navLabel: trimmed } }, { onSuccess: () => showToast('Page name updated.') });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {header}

      <div className="space-y-3">
        {rows.map((row, index) => {
          return (
            <div key={row.id} className="admin-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary">{MODULE_LABEL[row.module]}</span>
                  </div>
                  <p className="text-xs text-secondary mt-1 max-w-md">{MODULE_DESCRIPTION[row.module]}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                    className="p-1.5 rounded-lg text-secondary hover:bg-surface-container-high disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === rows.length - 1}
                    aria-label="Move down"
                    className="p-1.5 rounded-lg text-secondary hover:bg-surface-container-high disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <TextField
                  label="Nav label"
                  defaultValue={row.navLabel}
                  key={`${row.id}-${row.navLabel}`}
                  onBlur={(e) => handleLabelBlur(row, e.target.value)}
                  hint="What guests see in your site's navigation."
                />

                <SelectField
                  label="Layout"
                  value={row.templateVariant}
                  onChange={(e) =>
                    updateConfig.mutate({ module: row.module, patch: { templateVariant: e.target.value as TemplateVariant } })
                  }
                >
                  {(Object.keys(VARIANT_LABEL[row.module]) as TemplateVariant[]).map((variant) => (
                    <option key={variant} value={variant}>
                      {VARIANT_LABEL[row.module][variant]}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="mt-3 pt-3 border-t border-outline-variant/10">
                <ToggleField
                  label={row.enabled ? 'Shown in navigation' : 'Hidden from navigation'}
                  checked={row.enabled}
                  onChange={(enabled) => updateConfig.mutate({ module: row.module, patch: { enabled } })}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
