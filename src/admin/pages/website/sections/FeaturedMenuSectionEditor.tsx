import { useMenu } from '../../../hooks/api/useMenu';
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
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Eyebrow</label>
        <input
          value={content?.eyebrow ?? ''}
          onChange={(e) => onChange({ eyebrow: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant/40 bg-surface focus:border-primary outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Heading</label>
        <input
          value={content?.heading ?? ''}
          onChange={(e) => onChange({ heading: e.target.value })}
          className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant/40 bg-surface focus:border-primary outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-1.5">Description</label>
        <textarea
          value={content?.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 text-sm rounded-lg border border-outline-variant/40 bg-surface focus:border-primary outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-on-surface mb-2">
          Featured Items {selectedItemIds.length === 0 && <span className="font-normal text-secondary">(none selected)</span>}
        </label>
        <div className="max-h-72 overflow-y-auto space-y-1.5 border border-outline-variant/30 rounded-xl p-2">
          {items.map((item) => (
            <label key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-high cursor-pointer">
              <input type="checkbox" checked={selectedItemIds.includes(item.id)} onChange={() => toggle(item.id)} className="accent-primary" />
              <span className="text-sm text-on-surface flex-1">{item.name}</span>
              {item.isFeatured && <span className="text-[10px] font-bold text-primary uppercase">Featured</span>}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
