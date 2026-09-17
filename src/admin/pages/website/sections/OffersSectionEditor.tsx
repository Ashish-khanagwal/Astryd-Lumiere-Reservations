import { Tag } from 'lucide-react';
import { useOffers } from '../../../hooks/api/useOffers';
import { TextField, TextareaField } from '../../../components/forms/Field';
import { SectionCard } from '../../../components/SectionCard';
import { StatusPill } from '../../../components/StatusPill';
import type { OffersSectionContent } from '../../../../types';

interface EditorProps {
  content: OffersSectionContent;
  onChange: (patch: Partial<OffersSectionContent>) => void;
}

export function OffersSectionEditor({ content, onChange }: EditorProps) {
  const { data: offers } = useOffers();
  const sectionContent: Partial<OffersSectionContent> = content ?? {};
  const safeContent = {
    eyebrow: '',
    heading: '',
    description: '',
    selectedOfferIds: [] as string[],
    ...sectionContent,
  };

  const toggle = (id: string) => {
    const next = safeContent.selectedOfferIds.includes(id)
      ? safeContent.selectedOfferIds.filter((i) => i !== id)
      : [...safeContent.selectedOfferIds, id];
    onChange({ selectedOfferIds: next });
  };

  return (
    <div className="space-y-5">
      <SectionCard title="Content">
        <div className="space-y-4">
          <TextField label="Eyebrow" value={safeContent.eyebrow} onChange={(e) => onChange({ eyebrow: e.target.value })} />
          <TextField label="Heading" value={safeContent.heading} onChange={(e) => onChange({ heading: e.target.value })} />
          <TextareaField label="Description" rows={2} value={safeContent.description} onChange={(e) => onChange({ description: e.target.value })} />
        </div>
      </SectionCard>

      <SectionCard
        title="Offers Shown"
        description={safeContent.selectedOfferIds.length === 0 ? 'None selected — shows all active offers.' : `${safeContent.selectedOfferIds.length} offer${safeContent.selectedOfferIds.length === 1 ? '' : 's'} selected.`}
        icon={Tag}
      >
        <div className="space-y-0.5 border border-outline-variant/30 rounded-xl p-2 bg-surface-container-low/40">
          {(offers ?? []).map((offer) => (
            <label key={offer.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-high cursor-pointer transition-colors">
              <input type="checkbox" checked={safeContent.selectedOfferIds.includes(offer.id)} onChange={() => toggle(offer.id)} className="accent-primary h-4 w-4" />
              <span className="text-sm text-on-surface flex-1">{offer.name}</span>
              {!offer.isActive && <StatusPill label="Inactive" tone="neutral" />}
            </label>
          ))}
          {(offers ?? []).length === 0 && <p className="text-sm text-secondary p-2">No offers created yet.</p>}
        </div>
      </SectionCard>
    </div>
  );
}
