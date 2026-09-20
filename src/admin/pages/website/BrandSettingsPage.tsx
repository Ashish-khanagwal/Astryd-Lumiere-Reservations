import { useCallback, useEffect, useState } from 'react';
import { Palette, Type, Info } from 'lucide-react';
import { useBrandDraft, usePublishWebsite, useUpdateBrand, useWebsiteStatus } from '../../hooks/api/useWebsite';
import { useAdminToast } from '../../context/AdminToastContext';
import { useAutoSave } from '../../hooks/useAutoSave';
import { PublishBar } from '../../components/PublishBar';
import { FontSelect } from '../../components/forms/FontSelect';
import { ColorTokenSelect } from '../../components/forms/ColorTokenSelect';
import { PageHeader } from '../../components/PageHeader';
import { SectionCard } from '../../components/SectionCard';
import { SelectField } from '../../components/forms/Field';
import { FormSkeleton } from '../../components/Skeleton';
import { FONT_WEIGHTS, type BrandSettings, type FontWeight } from '../../../types';

export function BrandSettingsPage() {
  const { data: brand } = useBrandDraft();
  const { data: website } = useWebsiteStatus();
  const updateBrand = useUpdateBrand();
  const publishWebsite = usePublishWebsite();
  const { showToast } = useAdminToast();

  const [draft, setDraft] = useState<BrandSettings | null>(null);
  useEffect(() => {
    if (brand) setDraft((prev) => prev ?? brand);
  }, [brand]);

  const isDirty = Boolean(draft && JSON.stringify(draft) !== JSON.stringify(brand));
  const persistDraft = useCallback(async () => {
    if (!draft) return;
    await updateBrand.mutateAsync(draft);
  }, [draft, updateBrand]);
  const { status: autoSaveStatus } = useAutoSave({
    isDirty,
    value: draft,
    onSave: persistDraft,
    enabled: Boolean(draft),
  });

  const header = <PageHeader icon={Palette} title="Branding" description="Fonts and colors used across your public website." />;

  if (!draft) {
    return (
      <div className="space-y-6">
        {header}
        <FormSkeleton />
      </div>
    );
  }

  const handleSaveDraft = async () => {
    await persistDraft();
    showToast('Draft saved.');
  };

  const handlePublish = async () => {
    if (isDirty) await updateBrand.mutateAsync(draft);
    await publishWebsite.mutateAsync();
    showToast('Website published.');
  };

  return (
    <div>
      <PublishBar
        isDirty={isDirty}
        isSaving={updateBrand.isPending}
        isPublishing={publishWebsite.isPending}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        lastPublishedAt={website?.publishedAt}
        autoSaveStatus={autoSaveStatus}
      />

      <div className="space-y-6 max-w-4xl">
        {header}

        <SectionCard title="Typography" icon={Type}>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <FontSelect label="Primary Font (body, nav, buttons)" value={draft.primaryFont} onChange={(primaryFont) => setDraft({ ...draft, primaryFont })} />
              <FontSelect label="Heading Font" value={draft.headingFont} onChange={(headingFont) => setDraft({ ...draft, headingFont })} />
            </div>
            <SelectField label="Font Weight" value={draft.fontWeight} onChange={(e) => setDraft({ ...draft, fontWeight: e.target.value as FontWeight })}>
              {FONT_WEIGHTS.map((w) => (
                <option key={w} value={w} className="capitalize">
                  {w}
                </option>
              ))}
            </SelectField>
          </div>
        </SectionCard>

        <SectionCard title="Color" icon={Palette}>
          <ColorTokenSelect
            themePresetId={draft.themePresetId}
            customPrimaryColor={draft.customPrimaryColor}
            onChange={(value) => setDraft({ ...draft, ...value })}
          />
        </SectionCard>

        <div className="flex items-start gap-2.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/20 p-4">
          <Info className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
          <p className="text-xs text-secondary">
            Social links, contact details, and business information are managed under Restaurant in the sidebar.
          </p>
        </div>
      </div>
    </div>
  );
}
