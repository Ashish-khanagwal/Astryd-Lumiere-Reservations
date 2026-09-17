import { useEffect, useState } from 'react';
import { PanelTop } from 'lucide-react';
import { useBrandDraft, usePublishWebsite, useUpdateBrand, useWebsiteStatus } from '../../hooks/api/useWebsite';
import { useAdminToast } from '../../context/AdminToastContext';
import { PublishBar } from '../../components/PublishBar';
import { ImagePickerField } from '../../components/forms/ImagePickerField';
import { ColorTokenSelect } from '../../components/forms/ColorTokenSelect';
import { useMedia } from '../../hooks/api/useMedia';
import { PageHeader } from '../../components/PageHeader';
import { SectionCard } from '../../components/SectionCard';
import { TextField } from '../../components/forms/Field';
import { FormSkeleton } from '../../components/Skeleton';
import type { BrandSettings } from '../../../types';

export function HeaderSettingsPage() {
  const { data: brand } = useBrandDraft();
  const { data: website } = useWebsiteStatus();
  const updateBrand = useUpdateBrand();
  const publishWebsite = usePublishWebsite();
  const { showToast } = useAdminToast();
  const { data: media } = useMedia();

  const [draft, setDraft] = useState<BrandSettings | null>(null);
  useEffect(() => {
    if (brand) setDraft(brand);
  }, [brand]);

  const header = <PageHeader icon={PanelTop} title="Header" description="Logo, restaurant name, and header appearance." />;

  if (!draft) {
    return (
      <div className="space-y-6">
        {header}
        <FormSkeleton />
      </div>
    );
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(brand);
  const logoUrl = media?.items.find((m) => m.id === draft.logoMediaId)?.fileUrl;

  const handleSaveDraft = async () => {
    await updateBrand.mutateAsync(draft);
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

        <SectionCard title="Appearance" description="Header background, text and button colors follow this site-wide theme.">
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
