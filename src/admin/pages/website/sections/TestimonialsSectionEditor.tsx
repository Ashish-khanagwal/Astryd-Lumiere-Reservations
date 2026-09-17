import { Quote, Plus, Trash2 } from 'lucide-react';
import { tempId } from '../../../utils/tempId';
import { ReorderableList } from '../../../components/ReorderableList';
import { TextField } from '../../../components/forms/Field';
import { SectionCard } from '../../../components/SectionCard';
import { EmptyState } from '../../../components/EmptyState';
import { Button } from '../../../components/Button';
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
      <SectionCard title="Content">
        <div className="space-y-4">
          <TextField label="Eyebrow" value={content?.eyebrow ?? ''} onChange={(e) => onChange({ eyebrow: e.target.value })} />
          <TextField label="Heading" value={content?.heading ?? ''} onChange={(e) => onChange({ heading: e.target.value })} />
        </div>
      </SectionCard>

      <SectionCard
        title="Testimonials"
        icon={Quote}
        actions={
          <Button variant="outline" size="sm" icon={Plus} onClick={add}>
            Add Testimonial
          </Button>
        }
      >
        {testimonials.length === 0 ? (
          <EmptyState icon={Quote} title="No testimonials yet" description="Add a guest quote to build social proof on your homepage." />
        ) : (
          <ReorderableList
            items={testimonials}
            onReorder={(next) => onChange({ testimonials: next.map((t, idx) => ({ ...t, order: idx })) })}
            renderItem={(t, dragHandle) => (
              <div className="flex items-start gap-3 bg-surface rounded-xl border border-outline-variant/20 p-3 shadow-sm">
                {dragHandle}
                <div className="flex-1 space-y-2 pt-1">
                  <input
                    value={t.customerName ?? ''}
                    onChange={(e) => update(t.id, { customerName: e.target.value })}
                    placeholder="Customer name"
                    className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-1.5 text-sm outline-none focus:border-primary"
                  />
                  <textarea
                    value={t.quote ?? ''}
                    onChange={(e) => update(t.id, { quote: e.target.value })}
                    placeholder="Quote"
                    rows={2}
                    className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-1.5 text-sm outline-none focus:border-primary resize-none"
                  />
                </div>
                <button onClick={() => remove(t.id)} className="p-2 mt-1 rounded-lg text-secondary hover:bg-error-container/40 hover:text-error transition-colors" aria-label="Remove testimonial">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          />
        )}
      </SectionCard>
    </div>
  );
}
