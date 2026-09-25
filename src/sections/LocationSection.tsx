import type { BusinessHoursEntry, LocationSectionContent } from '../types';
import { usePageContent } from '../context/usePageContent';

interface LocationSectionProps {
  content?: Partial<LocationSectionContent> | null;
  address?: string;
  phone?: string;
  mapEmbedUrl?: string;
  businessHours?: BusinessHoursEntry[];
}

export const LocationSection = ({ content, address, phone, mapEmbedUrl, businessHours }: LocationSectionProps) => {
  const c = usePageContent('landing');
  if (!content || Object.keys(content).length === 0) return null;
  const hours = Array.isArray(businessHours) ? businessHours : [];
  const dayLabel = new Map(c.list('weekdays').map((d) => [d.id, d.full]));

  return (
    <section className="py-section-gap bg-[#F4EFE6] w-full">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-on-surface">{content?.heading}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="rounded-2xl overflow-hidden shadow-sm border border-outline-variant/20 bg-surface-container-low min-h-[320px]">
            {mapEmbedUrl ? (
              <iframe src={mapEmbedUrl} className="w-full h-full min-h-[320px]" loading="lazy" title={c.text('mapTitle')} />
            ) : (
              <div className="w-full h-full min-h-[320px] flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-4xl">map</span>
              </div>
            )}
          </div>

          <div className="bg-surface rounded-2xl p-8 shadow-sm border border-outline-variant/20 space-y-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
              <span className="font-sans text-sm text-on-surface font-medium">{address ?? ''}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">call</span>
              <span className="font-sans text-sm text-on-surface font-medium">{phone ?? ''}</span>
            </div>

            {content?.showHoursTable && (
              <div>
                <h4 className="font-label-sm text-secondary uppercase tracking-widest mb-3">{c.text('locationHoursTitle')}</h4>
                <ul className="space-y-2 font-sans text-sm">
                  {hours.map((h) => (
                    <li key={h.day} className="flex justify-between border-b border-outline-variant/10 pb-2">
                      <span className="text-secondary">{dayLabel.get(h.day)}</span>
                      <span className="text-on-surface font-semibold">
                        {h.isClosed ? c.text('closedLabel') : c.text('hoursRange', { open: h.openTime ?? '', close: h.closeTime ?? '' })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
