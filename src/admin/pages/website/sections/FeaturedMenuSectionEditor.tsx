import { Star } from 'lucide-react';
import { useMenu } from '../../../hooks/api/useMenu';
import { TextField, TextareaField } from '../../../components/forms/Field';
import { SectionCard } from '../../../components/SectionCard';
import { StatusPill } from '../../../components/StatusPill';
import type { FeaturedMenuSectionContent } from '../../../../types';

interface EditorProps {
  content?: Partial<FeaturedMenuSectionContent> | null;
  onChange: (patch: Partial<FeaturedMenuSectionContent>) => void;
}

export function FeaturedMenuSectionEditor({ content, onChange }: EditorProps) {
  const { data: menu } = useMenu();
  const items = menu?.items ?? [];
  const selectedItemIds = Array.isArray(content?.selectedItemIds) ? content.selectedItemIds : [];

  const toggle = (id: string) => {
    const next = selectedItemIds.includes(id)
      ? selectedItemIds.filter((itemId) => itemId !== id)
      : [...selectedItemIds, id];
    onChange({ selectedItemIds: next });
  };

  return (
    <div className="space-y-5">
      <SectionCard title="Content">
        <div className="space-y-4">
          <TextField label="Eyebrow" value={content?.eyebrow ?? ''} onChange={(e) => onChange({ eyebrow: e.target.value })} />
          <TextField label="Heading" value={content?.heading ?? ''} onChange={(e) => onChange({ heading: e.target.value })} />
          <TextareaField label="Description" rows={2} value={content?.description ?? ''} onChange={(e) => onChange({ description: e.target.value })} />
        </div>
      </SectionCard>

      <SectionCard
        title="Featured Items"
        description={selectedItemIds.length === 0 ? 'None selected yet.' : `${selectedItemIds.length} item${selectedItemIds.length === 1 ? '' : 's'} selected.`}
        icon={Star}
      >
        <div className="max-h-72 overflow-y-auto space-y-0.5 border border-outline-variant/30 rounded-xl p-2 bg-surface-container-low/40">
          {items.map((item) => (
            <label key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-high cursor-pointer transition-colors">
              <input type="checkbox" checked={selectedItemIds.includes(item.id)} onChange={() => toggle(item.id)} className="accent-primary h-4 w-4" />
              <span className="text-sm text-on-surface flex-1">{item.name}</span>
              {item.isFeatured && <StatusPill label="Featured" tone="positive" />}
            </label>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
