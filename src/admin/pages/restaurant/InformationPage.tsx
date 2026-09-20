import { useCallback, useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import { useBrandDraft, usePublishWebsite, useUpdateBrand, useWebsiteStatus } from '../../hooks/api/useWebsite';
import { useAdminToast } from '../../context/AdminToastContext';
import { useAutoSave } from '../../hooks/useAutoSave';
import { PublishBar } from '../../components/PublishBar';
import { PageHeader } from '../../components/PageHeader';
import { SectionCard } from '../../components/SectionCard';
import { TextField, TextareaField } from '../../components/forms/Field';
import { FormSkeleton } from '../../components/Skeleton';
import type { BrandSettings } from '../../../types';

export function InformationPage() {
  const { data: brand, isLoading } = useBrandDraft();
  const { data: website } = useWebsiteStatus();
  const updateBrand = useUpdateBrand();
  const publishWebsite = usePublishWebsite();
  const { showToast } = useAdminToast();

  const [draft, setDraft] = useState<BrandSettings | null>(null);
  useEffect(() => {
    if (!isLoading) setDraft((prev) => prev ?? ((brand ?? {}) as BrandSettings));
  }, [brand, isLoading]);

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

  const header = <PageHeader icon={Store} title="Restaurant Information" description="The story and cuisine details shown across your public website." />;

  if (isLoading && !draft) {
    return (
      <div className="space-y-6">
        {header}
        <FormSkeleton />
      </div>
    );
  }
  if (!draft) return null;

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

        <SectionCard title="Details">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField
                label="Tagline"
                hint="A short line shown near your restaurant name."
                value={draft?.tagline ?? ''}
                onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
              />
              <TextField
                label="Cuisine Type"
                placeholder="e.g. Modern French"
                value={draft?.cuisineType ?? ''}
                onChange={(e) => setDraft({ ...draft, cuisineType: e.target.value })}
              />
            </div>
            <TextareaField
              label="Description"
              rows={4}
              maxLength={300}
              hint={`${(draft?.description ?? '').length}/300`}
              value={draft?.description ?? ''}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
