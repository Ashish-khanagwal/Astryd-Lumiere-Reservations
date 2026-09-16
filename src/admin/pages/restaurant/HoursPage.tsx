import { useEffect, useState } from 'react';
import { useBrandDraft, usePublishWebsite, useUpdateBrand, useWebsiteStatus } from '../../hooks/api/useWebsite';
import { useAdminToast } from '../../context/AdminToastContext';
import { PublishBar } from '../../components/PublishBar';
import { ToggleField } from '../../components/forms/ToggleField';
import type { BusinessHoursEntry } from '../../../types';

const DEFAULT_BUSINESS_HOURS: BusinessHoursEntry[] = [
  { day: 'mon', isClosed: false, openTime: '18:00', closeTime: '23:00' },
  { day: 'tue', isClosed: false, openTime: '18:00', closeTime: '23:00' },
  { day: 'wed', isClosed: false, openTime: '18:00', closeTime: '23:00' },
  { day: 'thu', isClosed: false, openTime: '18:00', closeTime: '23:00' },
  { day: 'fri', isClosed: false, openTime: '12:00', closeTime: '00:00' },
  { day: 'sat', isClosed: false, openTime: '12:00', closeTime: '00:00' },
  { day: 'sun', isClosed: false, openTime: '12:00', closeTime: '21:00' },
];

const DAY_LABEL: Record<BusinessHoursEntry['day'], string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

function normalizeBusinessHours(hours: BusinessHoursEntry[] | undefined): BusinessHoursEntry[] {
  const configuredHours = Array.isArray(hours) ? hours : [];
  return DEFAULT_BUSINESS_HOURS.map((fallback) => ({
    ...fallback,
    ...configuredHours.find((entry) => entry?.day === fallback.day),
    day: fallback.day,
  }));
}

export function HoursPage() {
  const { data: brand, isLoading } = useBrandDraft();
  const { data: website } = useWebsiteStatus();
  const updateBrand = useUpdateBrand();
  const publishWebsite = usePublishWebsite();
  const { showToast } = useAdminToast();
  const [businessHours, setBusinessHours] = useState<BusinessHoursEntry[]>(DEFAULT_BUSINESS_HOURS);

  useEffect(() => {
    if (!isLoading) setBusinessHours(normalizeBusinessHours(brand?.businessHours));
  }, [brand?.businessHours, isLoading]);

  if (isLoading) return <p className="text-secondary text-sm">Loading...</p>;

  const persistedHours = normalizeBusinessHours(brand?.businessHours);
  const isDirty = JSON.stringify(businessHours) !== JSON.stringify(persistedHours);

  const updateDay = (day: BusinessHoursEntry['day'], patch: Partial<BusinessHoursEntry>) => {
    setBusinessHours((currentHours) =>
      currentHours.map((entry) => (entry.day === day ? { ...entry, ...patch } : entry)),
    );
  };

  const handleSaveDraft = async () => {
    await updateBrand.mutateAsync({ businessHours });
    showToast('Opening hours saved.');
  };

  const handlePublish = async () => {
    if (isDirty) await updateBrand.mutateAsync({ businessHours });
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
      <h1 className="font-serif text-2xl font-bold text-on-surface mb-2">Opening Hours</h1>
      <p className="text-sm text-secondary mb-6">Set the weekly hours shown on your public website.</p>

      <div className="space-y-2 max-w-2xl">
        {businessHours.map((entry) => (
          <div key={entry.day} className="flex flex-wrap items-center gap-4 bg-surface rounded-xl border border-outline-variant/20 p-4">
            <span className="w-12 font-semibold text-on-surface text-sm">{DAY_LABEL[entry.day]}</span>
            <ToggleField label="Closed" checked={entry.isClosed} onChange={(isClosed) => updateDay(entry.day, { isClosed })} />
            {!entry.isClosed && (
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={entry.openTime ?? ''}
                  onChange={(event) => updateDay(entry.day, { openTime: event.target.value })}
                  className="px-3 py-1.5 text-sm rounded-lg border border-outline-variant/30 bg-surface-container-low"
                  aria-label={`${DAY_LABEL[entry.day]} opening time`}
                />
                <span className="text-secondary text-sm">to</span>
                <input
                  type="time"
                  value={entry.closeTime ?? ''}
                  onChange={(event) => updateDay(entry.day, { closeTime: event.target.value })}
                  className="px-3 py-1.5 text-sm rounded-lg border border-outline-variant/30 bg-surface-container-low"
                  aria-label={`${DAY_LABEL[entry.day]} closing time`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
