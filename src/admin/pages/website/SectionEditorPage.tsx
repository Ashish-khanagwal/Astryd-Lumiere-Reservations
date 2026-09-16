import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHomepageDraft, usePublishWebsite, useUpdateSection, useWebsiteStatus } from '../../hooks/api/useWebsite';
import { useAdminToast } from '../../context/AdminToastContext';
import { PublishBar } from '../../components/PublishBar';
import { HeroSectionEditor } from './sections/HeroSectionEditor';
import { AboutSectionEditor } from './sections/AboutSectionEditor';
import { FeaturedMenuSectionEditor } from './sections/FeaturedMenuSectionEditor';
import { GallerySectionEditor } from './sections/GallerySectionEditor';
import { OffersSectionEditor } from './sections/OffersSectionEditor';
import { TestimonialsSectionEditor } from './sections/TestimonialsSectionEditor';
import { LocationSectionEditor } from './sections/LocationSectionEditor';
import type { HomepageSection, HomepageSectionType } from '../../../types';

const SECTION_LABEL: Record<string, string> = {
  hero: 'Hero', about: 'About', featured_menu: 'Featured Menu', gallery: 'Gallery',
  offers: 'Offers', testimonials: 'Testimonials', location: 'Location',
};

export function SectionEditorPage() {
  const { type } = useParams<{ type: HomepageSectionType }>();
  const navigate = useNavigate();
  const { data: homepage } = useHomepageDraft();
  const { data: website } = useWebsiteStatus();
  const updateSection = useUpdateSection();
  const publishWebsite = usePublishWebsite();
  const { showToast } = useAdminToast();

  const serverSection = homepage?.sections?.find((s) => s.type === type);
  const [draft, setDraft] = useState<HomepageSection['content'] | null>(null);

  useEffect(() => {
    if (serverSection) setDraft((serverSection.content ?? {}) as HomepageSection['content']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverSection?.id]);

  if (!type || !serverSection || !draft) {
    return <p className="text-secondary text-sm">Loading section...</p>;
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(serverSection.content ?? {});

  const handleSaveDraft = async () => {
    await updateSection.mutateAsync({ type, payload: { content: draft as unknown as Record<string, unknown> } });
    showToast('Draft saved.');
  };

  const handlePublish = async () => {
    if (isDirty) await updateSection.mutateAsync({ type, payload: { content: draft as unknown as Record<string, unknown> } });
    await publishWebsite.mutateAsync();
    showToast('Website published.');
  };

  const onChange = (patch: Partial<HomepageSection['content']>) => setDraft((prev) => ({ ...(prev as object), ...patch }) as HomepageSection['content']);

  const renderEditor = () => {
    switch (type) {
      case 'hero':
        return <HeroSectionEditor content={draft as never} onChange={onChange} />;
      case 'about':
        return <AboutSectionEditor content={draft as never} onChange={onChange} />;
      case 'featured_menu':
        return <FeaturedMenuSectionEditor content={draft as never} onChange={onChange} />;
      case 'gallery':
        return <GallerySectionEditor content={draft as never} onChange={onChange} />;
      case 'offers':
        return <OffersSectionEditor content={draft as never} onChange={onChange} />;
      case 'testimonials':
        return <TestimonialsSectionEditor content={draft as never} onChange={onChange} />;
      case 'location':
        return <LocationSectionEditor content={draft as never} onChange={onChange} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <PublishBar
        isDirty={isDirty}
        isSaving={updateSection.isPending}
        isPublishing={publishWebsite.isPending}
        onSaveDraft={handleSaveDraft}
        onPreview={() => window.open('/?preview=true', '_blank')}
        onPublish={handlePublish}
        lastPublishedAt={website?.publishedAt}
      />
      <button onClick={() => navigate('/admin/website/homepage')} className="flex items-center gap-1 text-sm text-secondary hover:text-on-surface mb-4">
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Back to Homepage Sections
      </button>
      <h1 className="font-serif text-2xl font-bold text-on-surface mb-6">{SECTION_LABEL[type]} Section</h1>
      {renderEditor()}
    </div>
  );
}
