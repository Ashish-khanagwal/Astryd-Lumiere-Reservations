import type { BusinessHoursEntry, LocationSectionContent, TemplateVariant } from '../types';
import { usePageContent } from '../context/usePageContent';
import { formatClockTime } from '../content/formatTime';

interface LocationSectionProps {
  variant?: TemplateVariant;
  content?: Partial<LocationSectionContent> | null;
  address?: string;
  phone?: string;
  mapEmbedUrl?: string;
  businessHours?: BusinessHoursEntry[];
}

interface HoursRow {
  day: string;
  label: string;
  value: string;
}

interface ResolvedLocation {
  heading?: string;
  address: string;
  phone: string;
  mapEmbedUrl?: string;
  mapTitle: string;
  hoursTitle: string;
  showHoursTable: boolean;
  hoursRows: HoursRow[];
}

function MapFrame({ mapEmbedUrl, mapTitle, className = '' }: { mapEmbedUrl?: string; mapTitle: string; className?: string }) {
  return (
    <div className={`rounded-2xl overflow-hidden shadow-sm border border-outline-variant/20 bg-surface-container-low min-h-[320px] ${className}`}>
      {mapEmbedUrl ? (
        <iframe src={mapEmbedUrl} className="w-full h-full min-h-[320px]" loading="lazy" title={mapTitle} />
      ) : (
        <div className="w-full h-full min-h-[320px] flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined text-4xl">map</span>
        </div>
      )}
    </div>
  );
}

/** Layout A - Classic: map left, an info card (address/phone/hours) right. */
const LocationSectionA = ({ heading, address, phone, mapEmbedUrl, mapTitle, hoursTitle, showHoursTable, hoursRows }: ResolvedLocation) => (
  <section className="py-section-gap bg-[#F4EFE6] w-full">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <div className="mb-12 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-on-surface">{heading}</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <MapFrame mapEmbedUrl={mapEmbedUrl} mapTitle={mapTitle} />
        <div className="bg-surface rounded-2xl p-8 shadow-sm border border-outline-variant/20 space-y-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
            <span className="font-sans text-sm text-on-surface font-medium">{address}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">call</span>
            <span className="font-sans text-sm text-on-surface font-medium">{phone}</span>
          </div>
          {showHoursTable && (
            <div>
              <h4 className="font-label-sm text-secondary uppercase tracking-widest mb-3">{hoursTitle}</h4>
              <ul className="space-y-2 font-sans text-sm">
                {hoursRows.map((h) => (
                  <li key={h.day} className="flex justify-between border-b border-outline-variant/10 pb-2">
                    <span className="text-secondary">{h.label}</span>
                    <span className="text-on-surface font-semibold">{h.value}</span>
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

/** Layout B - Editorial: three stat-style info blocks on top, full-width map below. */
const LocationSectionB = ({ heading, address, phone, mapEmbedUrl, mapTitle, hoursTitle, showHoursTable, hoursRows }: ResolvedLocation) => (
  <section className="py-section-gap bg-[#F4EFE6] w-full">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <div className="mb-10 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-on-surface">{heading}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant/20 text-center">
          <span className="material-symbols-outlined text-primary text-3xl mb-2 inline-block">location_on</span>
          <p className="font-sans text-sm text-on-surface font-medium">{address}</p>
        </div>
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant/20 text-center">
          <span className="material-symbols-outlined text-primary text-3xl mb-2 inline-block">call</span>
          <p className="font-sans text-sm text-on-surface font-medium">{phone}</p>
        </div>
        {showHoursTable && (
          <div className="bg-surface rounded-2xl p-6 shadow-sm border border-outline-variant/20">
            <h4 className="font-label-sm text-secondary uppercase tracking-widest mb-2 text-center">{hoursTitle}</h4>
            <ul className="space-y-1 font-sans text-xs">
              {hoursRows.map((h) => (
                <li key={h.day} className="flex justify-between">
                  <span className="text-secondary">{h.label}</span>
                  <span className="text-on-surface font-semibold">{h.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <MapFrame mapEmbedUrl={mapEmbedUrl} mapTitle={mapTitle} className="h-[360px]" />
    </div>
  </section>
);

/** Layout C - Minimal: a large map with a floating info card over its bottom-left corner. */
const LocationSectionC = ({ heading, address, phone, mapEmbedUrl, mapTitle, hoursTitle, showHoursTable, hoursRows }: ResolvedLocation) => (
  <section className="py-section-gap bg-[#F4EFE6] w-full">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <div className="mb-10 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-on-surface">{heading}</h2>
      </div>
      <div className="relative">
        <MapFrame mapEmbedUrl={mapEmbedUrl} mapTitle={mapTitle} className="h-[440px]" />
        <div className="absolute left-4 bottom-4 right-4 sm:right-auto sm:w-80 bg-surface rounded-2xl p-6 shadow-xl border border-outline-variant/20 space-y-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-xl">location_on</span>
            <span className="font-sans text-sm text-on-surface font-medium">{address}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-xl">call</span>
            <span className="font-sans text-sm text-on-surface font-medium">{phone}</span>
          </div>
          {showHoursTable && (
            <div>
              <h4 className="font-label-sm text-secondary uppercase tracking-widest mb-2">{hoursTitle}</h4>
              <ul className="space-y-1.5 font-sans text-xs">
                {hoursRows.map((h) => (
                  <li key={h.day} className="flex justify-between">
                    <span className="text-secondary">{h.label}</span>
                    <span className="text-on-surface font-semibold">{h.value}</span>
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

export const LocationSection = ({ variant = 'a', content, address, phone, mapEmbedUrl, businessHours }: LocationSectionProps) => {
  const c = usePageContent('landing');
  if (!content || Object.keys(content).length === 0) return null;
  const hours = Array.isArray(businessHours) ? businessHours : [];
  const dayLabel = new Map(c.list('weekdays').map((d) => [d.id, d.full]));
  const resolved: ResolvedLocation = {
    heading: content?.heading,
    address: address ?? '',
    phone: phone ?? '',
    mapEmbedUrl,
    mapTitle: c.text('mapTitle'),
    hoursTitle: c.text('locationHoursTitle'),
    showHoursTable: Boolean(content?.showHoursTable),
    hoursRows: hours.map((h) => ({
      day: h.day,
      label: dayLabel.get(h.day) ?? h.day,
      value: h.isClosed ? c.text('closedLabel') : c.text('hoursRange', { open: formatClockTime(h.openTime, c.text('clockFormat')), close: formatClockTime(h.closeTime, c.text('clockFormat')) }),
    })),
  };

  if (variant === 'b') return <LocationSectionB {...resolved} />;
  if (variant === 'c') return <LocationSectionC {...resolved} />;
  return <LocationSectionA {...resolved} />;
};
