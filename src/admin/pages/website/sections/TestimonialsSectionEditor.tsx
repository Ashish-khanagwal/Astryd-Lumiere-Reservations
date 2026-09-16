import { tempId } from '../../../utils/tempId';
import { ReorderableList } from '../../../components/ReorderableList';
import type { TestimonialEntry, TestimonialsSectionContent } from '../../../../types';

interface EditorProps {
  content?: Partial<TestimonialsSectionContent> | null;
  onChange: (patch: Partial<TestimonialsSectionContent>) => void;
}

export function TestimonialsSectionEditor({ content, onChange }: EditorProps) {
  const testimonialEntries = content?.testimonials;
  const testimonials = Array.isArray(testimonialEntries) ? [...testimonialEntries].sort((a, b) => a.order - b.order) : [];

  const update = (id: string, patch: Partial<TestimonialEntry>) => {
    onChange({ testimonials: testimonials.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  };

  const remove = (id: string) => {
    onChange({ testimonials: testimonials.filter((t) => t.id !== id) });
  };

  const add = () => {
    onChange({
      testimonials: [
        ...testimonials,
        { id: tempId('testimonial'), customerName: '', quote: '', rating: 5, order: testimonials.length },
      ],
    });
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

      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-on-surface">Testimonials</label>
        <button onClick={add} className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-primary-container">
          + Add Testimonial
        </button>
      </div>

      <ReorderableList
        items={testimonials}
        onReorder={(next) => onChange({ testimonials: next.map((t, idx) => ({ ...t, order: idx })) })}
        renderItem={(t, dragHandle) => (
          <div className="flex items-start gap-3 bg-surface rounded-xl border border-outline-variant/20 p-3">
            {dragHandle}
            <div className="flex-1 space-y-2">
              <input
                value={t.customerName ?? ''}
                onChange={(e) => update(t.id, { customerName: e.target.value })}
                placeholder="Customer name"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-outline-variant/30 bg-surface-container-low"
              />
              <textarea
                value={t.quote ?? ''}
                onChange={(e) => update(t.id, { quote: e.target.value })}
                placeholder="Quote"
                rows={2}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-outline-variant/30 bg-surface-container-low"
              />
            </div>
            <button onClick={() => remove(t.id)} className="text-error hover:opacity-70 mt-1">
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        )}
      />
    </div>
  );
}
