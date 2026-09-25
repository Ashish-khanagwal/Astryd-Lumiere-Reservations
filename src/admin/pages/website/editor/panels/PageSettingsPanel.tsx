import { useState } from 'react';
import { Info } from 'lucide-react';
import { useUpdatePageConfig } from '../../../../hooks/api/usePageConfigs';
import { useAdminToast } from '../../../../context/AdminToastContext';
import { TextField } from '../../../../components/forms/Field';
import { ToggleField } from '../../../../components/forms/ToggleField';
import { SectionCard } from '../../../../components/SectionCard';
import { Button } from '../../../../components/Button';
import { MODULE_DESCRIPTION } from '../../../settings/pageConfigMeta';
import type { PageConfig } from '../../../../../types';

/** Page name in the navigation + whether it's shown. These apply right away (they aren't part of the draft). */
export function PageSettingsPanel({ config, onSaved }: { config: PageConfig; onSaved: () => void }) {
  const updateConfig = useUpdatePageConfig();
  const { showToast } = useAdminToast();
  const [navLabel, setNavLabel] = useState(config.navLabel);
  const trimmed = navLabel.trim();
  const labelChanged = Boolean(trimmed) && trimmed !== config.navLabel;

  const saveLabel = () =>
    updateConfig.mutate(
      { module: config.module, patch: { navLabel: trimmed } },
      { onSuccess: () => { showToast('Page name updated.'); onSaved(); } },
    );

  return (
    <div className="space-y-5">
      <SectionCard title="Page name" description="What visitors see in your site's navigation menu.">
        <div className="space-y-3">
          <TextField
            label="Name in navigation"
            value={navLabel}
            onChange={(e) => setNavLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && labelChanged && saveLabel()}
          />
          <div className="flex justify-end">
            <Button variant="primary" size="sm" disabled={!labelChanged} loading={updateConfig.isPending} onClick={saveLabel}>
              Save name
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Visibility" description={MODULE_DESCRIPTION[config.module]}>
        <ToggleField
          label={config.enabled ? 'Shown in navigation' : 'Hidden from navigation'}
          description="Hidden pages disappear from the menu and footer links."
          checked={config.enabled}
          onChange={(enabled) =>
            updateConfig.mutate({ module: config.module, patch: { enabled } }, { onSuccess: () => { showToast(enabled ? 'Page shown in navigation.' : 'Page hidden from navigation.'); onSaved(); } })
          }
        />
      </SectionCard>

      <div className="flex items-start gap-2.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/20 p-4">
        <Info className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
        <p className="text-xs text-secondary">
          Name and visibility apply to your live site straight away. To change the order pages appear in the menu, drag them on the Pages list.
        </p>
      </div>
    </div>
  );
}
