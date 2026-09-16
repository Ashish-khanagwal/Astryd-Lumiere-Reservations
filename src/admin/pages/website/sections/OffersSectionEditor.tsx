import { useOffers } from '../../../hooks/api/useOffers';
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
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Eyebrow</label>
        <input
          value={safeContent.eyebrow}
          onChange={(e) => onChange({ eyebrow: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant/40 bg-surface focus:border-primary outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Heading</label>
        <input
          value={safeContent.heading}
          onChange={(e) => onChange({ heading: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant/40 bg-surface focus:border-primary outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Description</label>
        <textarea
          value={safeContent.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant/40 bg-surface focus:border-primary outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-on-surface mb-2">
          Offers Shown {safeContent.selectedOfferIds.length === 0 && <span className="font-normal text-secondary">(none selected - shows all active offers)</span>}
        </label>
        <div className="space-y-1.5 border border-outline-variant/30 rounded-xl p-2">
          {(offers ?? []).map((offer) => (
            <label key={offer.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-high cursor-pointer">
              <input type="checkbox" checked={safeContent.selectedOfferIds.includes(offer.id)} onChange={() => toggle(offer.id)} className="accent-primary" />
              <span className="text-sm text-on-surface flex-1">{offer.name}</span>
              {!offer.isActive && <span className="text-[10px] font-bold text-secondary uppercase">Inactive</span>}
            </label>
          ))}
          {(offers ?? []).length === 0 && <p className="text-sm text-secondary p-2">No offers created yet.</p>}
        </div>
      </div>
    </div>
  );
}
