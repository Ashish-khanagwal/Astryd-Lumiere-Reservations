import { useEffect, useState } from 'react';
import { Share2, Link2 } from 'lucide-react';
import { useBrandDraft, usePublishWebsite, useUpdateBrand, useWebsiteStatus } from '../../hooks/api/useWebsite';
import { useAdminToast } from '../../context/AdminToastContext';
import { PublishBar } from '../../components/PublishBar';
import { PageHeader } from '../../components/PageHeader';
import { SectionCard } from '../../components/SectionCard';
import { TextField } from '../../components/forms/Field';
import { FormSkeleton } from '../../components/Skeleton';
import type { BrandSettings } from '../../../types';

const SOCIAL_KEYS = ['instagram', 'facebook', 'youtube', 'x', 'whatsapp'] as const;
const SOCIAL_LABEL: Record<(typeof SOCIAL_KEYS)[number], string> = {
  instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube', x: 'X (Twitter)', whatsapp: 'WhatsApp',
};

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

  const header = <PageHeader icon={Share2} title="Social Media" description="Links shown in your website footer and header." />;

  if (isLoading && !draft) {
    return (
      <div className="space-y-6">
        {header}
        <FormSkeleton />
      </div>
    );
  }
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
        onPublish={handlePublish}
        lastPublishedAt={website?.publishedAt}
      />

      <div className="space-y-6 max-w-4xl">
        {header}

        <SectionCard title="Profile Links" description="Paste the full URL for each platform you're active on.">
          <div className="grid sm:grid-cols-2 gap-4">
            {SOCIAL_KEYS.map((key) => (
              <TextField
                key={key}
                label={SOCIAL_LABEL[key]}
                icon={Link2}
                value={draft.socialLinks?.[key] ?? ''}
                onChange={(e) => setDraft({ ...draft, socialLinks: { ...(draft.socialLinks ?? {}), [key]: e.target.value } })}
                placeholder="https://..."
              />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
