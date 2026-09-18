import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Rows3 } from 'lucide-react';
import { useHomepageDraft, usePublishWebsite, useUpdateSection, useWebsiteStatus } from '../../hooks/api/useWebsite';
import { useAdminToast } from '../../context/AdminToastContext';
import { PublishBar } from '../../components/PublishBar';
import { FormSkeleton } from '../../components/Skeleton';
import { SECTION_LABEL, SECTION_ICON } from './sectionMeta';
import { HeroSectionEditor } from './sections/HeroSectionEditor';
import { AboutSectionEditor } from './sections/AboutSectionEditor';
import { FeaturedMenuSectionEditor } from './sections/FeaturedMenuSectionEditor';
import { GallerySectionEditor } from './sections/GallerySectionEditor';
import { OffersSectionEditor } from './sections/OffersSectionEditor';
import { TestimonialsSectionEditor } from './sections/TestimonialsSectionEditor';
import { LocationSectionEditor } from './sections/LocationSectionEditor';
import type { HomepageSection, HomepageSectionType } from '../../../types';

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
    return (
      <div className="max-w-4xl space-y-6">
        <div className="h-6 w-48 rounded-lg bg-surface-container-high animate-pulse" />
        <FormSkeleton />
      </div>
    );
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

  const orderedSections = [...(homepage?.sections ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div>
      <PublishBar
        isDirty={isDirty}
        isSaving={updateSection.isPending}
        isPublishing={publishWebsite.isPending}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        lastPublishedAt={website?.publishedAt}
      />

      <div className="lg:flex lg:items-start lg:gap-6">
        <div className="hidden lg:block w-64 shrink-0 sticky top-20 admin-card p-3 self-start">
          <Link
            to="/admin/website/homepage"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 mb-2 text-xs font-bold uppercase tracking-wide text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Sections
          </Link>
          <div className="h-px bg-outline-variant/15 mb-2" />
          <nav className="space-y-1.5">
            {orderedSections.map((s) => {
              const Icon = SECTION_ICON[s.type] ?? Rows3;
              const isActive = s.type === type;
              return (
                <Link
                  key={s.id}
                  to={`/admin/website/homepage/${s.type}`}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-colors ${
                    isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-secondary hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive ? 'bg-primary/15 text-primary' : 'bg-surface-container-high text-secondary'
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="truncate flex-1">{SECTION_LABEL[s.type] ?? s.type}</span>
                  {!s.visible && <span className="h-1.5 w-1.5 rounded-full bg-outline-variant/60 shrink-0" title="Hidden from website" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 min-w-0 max-w-4xl">
          <button onClick={() => navigate('/admin/website/homepage')} className="lg:hidden inline-flex items-center gap-1.5 text-sm text-secondary hover:text-on-surface transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Homepage Sections
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mb-6">{SECTION_LABEL[type]} Section</h1>
          {renderEditor()}
        </div>
      </div>
    </div>
  );
}
