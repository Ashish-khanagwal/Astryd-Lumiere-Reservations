import { useCallback, useEffect, useState } from 'react';
import { PanelTop, AlignCenter, AlignRight } from 'lucide-react';
import { useBrandDraft, usePublishWebsite, useUpdateBrand, useWebsiteStatus } from '../../hooks/api/useWebsite';
import { useAdminToast } from '../../context/AdminToastContext';
import { useAutoSave } from '../../hooks/useAutoSave';
import { PublishBar } from '../../components/PublishBar';
import { ImagePickerField } from '../../components/forms/ImagePickerField';
import { ColorTokenSelect } from '../../components/forms/ColorTokenSelect';
import { HexColorField } from '../../components/forms/HexColorField';
import { useMedia } from '../../hooks/api/useMedia';
import { PageHeader } from '../../components/PageHeader';
import { SectionCard } from '../../components/SectionCard';
import { TextField } from '../../components/forms/Field';
import { FormSkeleton } from '../../components/Skeleton';
import type { BrandSettings, NavPosition } from '../../../types';

const NAV_POSITION_OPTIONS: { value: NavPosition; label: string; icon: typeof AlignRight }[] = [
  { value: 'right', label: 'Right', icon: AlignRight },
  { value: 'center', label: 'Center', icon: AlignCenter },
];

export function HeaderSettingsPage() {
  const { data: brand } = useBrandDraft();
  const { data: website } = useWebsiteStatus();
  const updateBrand = useUpdateBrand();
  const publishWebsite = usePublishWebsite();
  const { showToast } = useAdminToast();
  const { data: media } = useMedia();

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

  const header = <PageHeader icon={PanelTop} title="Header" description="Logo, restaurant name, and header appearance." />;

  if (!draft) {
    return (
      <div className="space-y-6">
        {header}
        <FormSkeleton />
      </div>
    );
  }

  const logoUrl = media?.items.find((m) => m.id === draft.logoMediaId)?.fileUrl;

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

        <SectionCard title="Logo & Name">
          <div className="space-y-5">
            <ImagePickerField
              label="Logo"
              currentImageUrl={logoUrl}
              onSelect={(asset) => setDraft({ ...draft, logoMediaId: asset.id })}
              onRemove={() => setDraft({ ...draft, logoMediaId: null })}
            />
            <TextField
              label="Restaurant Name"
              maxLength={100}
              value={draft.restaurantName}
              onChange={(e) => setDraft({ ...draft, restaurantName: e.target.value })}
            />
          </div>
        </SectionCard>

        <SectionCard title="Navigation" description="Position of the Discover, Menu, and Reservation links in the header.">
          <div className="flex gap-2">
            {NAV_POSITION_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                type="button"
                key={value}
                onClick={() => setDraft({ ...draft, navPosition: value })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  (draft.navPosition ?? 'right') === value
                    ? 'bg-primary text-on-primary border-primary'
                    : 'border-outline-variant/40 text-secondary hover:border-primary/40'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Header Colors" description="Override the header's own background and link text colors, independent of the site-wide theme below.">
          <div className="space-y-5">
            <HexColorField
              label="Header Background"
              defaultColor="#fbf9f9"
              value={draft.headerBackgroundColor}
              onChange={(headerBackgroundColor) => setDraft({ ...draft, headerBackgroundColor })}
            />
            <HexColorField
              label="Link Text — Normal"
              defaultColor="#5f5e5e"
              value={draft.headerTextColor}
              onChange={(headerTextColor) => setDraft({ ...draft, headerTextColor })}
            />
            <HexColorField
              label="Link Text — Hover"
              defaultColor="#1b1c1c"
              value={draft.headerTextHoverColor}
              onChange={(headerTextHoverColor) => setDraft({ ...draft, headerTextHoverColor })}
            />
          </div>
        </SectionCard>

        <SectionCard title="Appearance" description="Site-wide theme, used everywhere a color isn't overridden above.">
          <ColorTokenSelect
            themePresetId={draft.themePresetId}
            customPrimaryColor={draft.customPrimaryColor}
            onChange={(value) => setDraft({ ...draft, ...value })}
          />
        </SectionCard>
      </div>
    </div>
  );
}
