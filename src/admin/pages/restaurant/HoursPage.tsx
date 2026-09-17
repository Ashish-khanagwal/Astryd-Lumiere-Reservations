import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useBrandDraft, usePublishWebsite, useUpdateBrand, useWebsiteStatus } from '../../hooks/api/useWebsite';
import { useAdminToast } from '../../context/AdminToastContext';
import { PublishBar } from '../../components/PublishBar';
import { PageHeader } from '../../components/PageHeader';
import { ToggleField } from '../../components/forms/ToggleField';
import { ListSkeleton } from '../../components/Skeleton';
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
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
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

  const header = <PageHeader icon={Clock} title="Opening Hours" description="Set the weekly hours shown on your public website." />;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        {header}
        <ListSkeleton rows={7} />
      </div>
    );
  }

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
        onPublish={handlePublish}
        lastPublishedAt={website?.publishedAt}
      />

      <div className="space-y-6 max-w-4xl">
        {header}

        <div className="rounded-2xl border border-outline-variant/20 bg-surface shadow-sm divide-y divide-outline-variant/10 overflow-hidden">
          {businessHours.map((entry) => (
            <div key={entry.day} className={`flex flex-wrap items-center gap-4 p-4 transition-colors ${entry.isClosed ? 'bg-surface-container-low/40' : ''}`}>
              <span className={`w-24 shrink-0 text-sm font-semibold ${entry.isClosed ? 'text-secondary' : 'text-on-surface'}`}>{DAY_LABEL[entry.day]}</span>

              {!entry.isClosed ? (
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="time"
                    value={entry.openTime ?? ''}
                    onChange={(event) => updateDay(entry.day, { openTime: event.target.value })}
                    className="rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-1.5 text-sm outline-none focus:border-primary"
                    aria-label={`${DAY_LABEL[entry.day]} opening time`}
                  />
                  <span className="text-secondary text-sm">to</span>
                  <input
                    type="time"
                    value={entry.closeTime ?? ''}
                    onChange={(event) => updateDay(entry.day, { closeTime: event.target.value })}
                    className="rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-1.5 text-sm outline-none focus:border-primary"
                    aria-label={`${DAY_LABEL[entry.day]} closing time`}
                  />
                </div>
              ) : (
                <span className="flex-1 text-sm text-secondary italic">Closed all day</span>
              )}

              <ToggleField label="Closed" checked={entry.isClosed} onChange={(isClosed) => updateDay(entry.day, { isClosed })} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
