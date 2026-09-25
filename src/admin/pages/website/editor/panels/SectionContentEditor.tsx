import { useCallback, useState } from 'react';
import { useUpdateSection } from '../../../../hooks/api/useWebsite';
import { useAutoSave } from '../../../../hooks/useAutoSave';
import { HeroSectionEditor } from '../../sections/HeroSectionEditor';
import { AboutSectionEditor } from '../../sections/AboutSectionEditor';
import { FeaturedMenuSectionEditor } from '../../sections/FeaturedMenuSectionEditor';
import { GallerySectionEditor } from '../../sections/GallerySectionEditor';
import { OffersSectionEditor } from '../../sections/OffersSectionEditor';
import { TestimonialsSectionEditor } from '../../sections/TestimonialsSectionEditor';
import { LocationSectionEditor } from '../../sections/LocationSectionEditor';
import { useReportAutoSave, type PanelCallbacks } from './panelTypes';
import type { HomepageSection } from '../../../../../types';

type Content = HomepageSection['content'];

/** One homepage section's content form with its own draft + auto-save. Remount (key) per section. */
export function SectionContentEditor({ section, ...callbacks }: { section: HomepageSection } & PanelCallbacks) {
  const updateSection = useUpdateSection();
  const [saved, setSaved] = useState<Content>(section.content ?? ({} as Content));
  const [draft, setDraft] = useState<Content>(section.content ?? ({} as Content));

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const persist = useCallback(async () => {
    await updateSection.mutateAsync({ type: section.type, payload: { content: draft as unknown as Record<string, unknown> } });
    setSaved(draft);
  }, [draft, section.type, updateSection]);

  const { status } = useAutoSave({ isDirty, value: draft, onSave: persist });
  useReportAutoSave(status, callbacks);

  const onChange = (patch: Partial<Content>) => setDraft((prev) => ({ ...(prev as object), ...patch }) as Content);
  const props = { content: draft as never, onChange };

  switch (section.type) {
    case 'hero':
      return <HeroSectionEditor {...props} />;
    case 'about':
      return <AboutSectionEditor {...props} />;
    case 'featured_menu':
      return <FeaturedMenuSectionEditor {...props} />;
    case 'gallery':
      return <GallerySectionEditor {...props} />;
    case 'offers':
      return <OffersSectionEditor {...props} />;
    case 'testimonials':
      return <TestimonialsSectionEditor {...props} />;
    case 'location':
      return <LocationSectionEditor {...props} />;
    default:
      return null;
  }
}
