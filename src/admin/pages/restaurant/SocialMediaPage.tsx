import { useEffect, useState } from 'react';
import { useBrandDraft, usePublishWebsite, useUpdateBrand, useWebsiteStatus } from '../../hooks/api/useWebsite';
import { useAdminToast } from '../../context/AdminToastContext';
import { PublishBar } from '../../components/PublishBar';
import type { BrandSettings } from '../../../types';

const SOCIAL_KEYS = ['instagram', 'facebook', 'youtube', 'x', 'whatsapp'] as const;

export function SocialMediaPage() {
  const { data: brand, isLoading } = useBrandDraft();
  const { data: website } = useWebsiteStatus();
  const updateBrand = useUpdateBrand();
  const publishWebsite = usePublishWebsite();
  const { showToast } = useAdminToast();

  const [draft, setDraft] = useState<BrandSettings | null>(null);
  useEffect(() => {
    if (!isLoading) setDraft((brand ?? {}) as BrandSettings);
  }, [brand, isLoading]);

  if (isLoading && !draft) return <p className="text-secondary text-sm">Loading...</p>;
  if (!draft) return null;
  const isDirty = JSON.stringify(draft) !== JSON.stringify(brand);

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
        onPreview={() => window.open('/?preview=true', '_blank')}
        onPublish={handlePublish}
        lastPublishedAt={website?.publishedAt}
      />
      <h1 className="font-serif text-2xl font-bold text-on-surface mb-6">Social Media</h1>

      <div className="space-y-4 max-w-xl">
        {SOCIAL_KEYS.map((key) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-on-surface mb-1.5 capitalize">{key}</label>
            <input
              value={draft.socialLinks?.[key] ?? ''}
              onChange={(e) => setDraft({ ...draft, socialLinks: { ...(draft.socialLinks ?? {}), [key]: e.target.value } })}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant/40 bg-surface focus:border-primary outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
