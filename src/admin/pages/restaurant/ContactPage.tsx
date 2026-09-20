import { useCallback, useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Map } from 'lucide-react';
import { useBrandDraft, usePublishWebsite, useUpdateBrand, useWebsiteStatus } from '../../hooks/api/useWebsite';
import { useAdminToast } from '../../context/AdminToastContext';
import { useAutoSave } from '../../hooks/useAutoSave';
import { PublishBar } from '../../components/PublishBar';
import { PageHeader } from '../../components/PageHeader';
import { SectionCard } from '../../components/SectionCard';
import { TextField } from '../../components/forms/Field';
import { FormSkeleton } from '../../components/Skeleton';
import type { BrandSettings } from '../../../types';

export function ContactPage() {
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

  const header = <PageHeader icon={Phone} title="Contact" description="How guests can reach and find your restaurant." />;

  if (isLoading && !draft) {
    return (
      <div className="space-y-6">
        {header}
        <FormSkeleton />
      </div>
    );
  }
  if (!draft) return null;
  const contact: Partial<BrandSettings['contact']> = draft.contact ?? {};
  const safeContact = { phone: '', email: '', address: '', ...contact };

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

        <SectionCard title="Reach Us">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Phone"
                icon={Phone}
                value={safeContact.phone ?? ''}
                onChange={(e) => setDraft({ ...draft, contact: { ...safeContact, phone: e.target.value } })}
              />
              <TextField
                label="Email"
                icon={Mail}
                type="email"
                value={safeContact.email ?? ''}
                onChange={(e) => setDraft({ ...draft, contact: { ...safeContact, email: e.target.value } })}
              />
            </div>
            <TextField
              label="Address"
              icon={MapPin}
              value={safeContact.address ?? ''}
              onChange={(e) => setDraft({ ...draft, contact: { ...safeContact, address: e.target.value } })}
            />
          </div>
        </SectionCard>

        <SectionCard title="Map" description="Embed a Google Maps location on your website." icon={Map}>
          <TextField
            label="Google Maps Embed URL"
            placeholder="https://www.google.com/maps/embed?..."
            value={safeContact.mapEmbedUrl ?? ''}
            onChange={(e) => setDraft({ ...draft, contact: { ...safeContact, mapEmbedUrl: e.target.value } })}
          />
          {safeContact.mapEmbedUrl && (
            <div className="mt-4 rounded-xl overflow-hidden border border-outline-variant/20">
              <iframe title="Location preview" src={safeContact.mapEmbedUrl} className="w-full h-56" style={{ border: 0 }} loading="lazy" />
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
