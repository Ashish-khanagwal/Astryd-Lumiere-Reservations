import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { TextField, TextareaField } from '../../../components/forms/Field';
import { ImagePickerField } from '../../../components/forms/ImagePickerField';
import type { ContentFieldDef, ContentListItem, ContentValue } from '../../../../types';

interface ContentFieldInputProps {
  field: ContentFieldDef;
  value: ContentValue;
  isOverridden: boolean;
  onChange: (value: ContentValue) => void;
  onReset: () => void;
}

function ResetLink({ onReset }: { onReset: () => void }) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary hover:text-primary transition-colors"
    >
      <RotateCcw className="h-3 w-3" /> Reset to default
    </button>
  );
}

function ScalarInput({
  type,
  label,
  hint,
  value,
  onChange,
}: {
  type: 'text' | 'textarea' | 'image';
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  if (type === 'image') {
    return (
      <ImagePickerField label={label} currentImageUrl={value || undefined} onSelect={(asset) => onChange(asset.fileUrl)} onRemove={() => onChange('')} />
    );
  }
  if (type === 'textarea') {
    return <TextareaField label={label} hint={hint} rows={3} value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  return <TextField label={label} hint={hint} value={value} onChange={(e) => onChange(e.target.value)} />;
}

function ListInput({ field, items, onChange }: { field: ContentFieldDef; items: ContentListItem[]; onChange: (items: ContentListItem[]) => void }) {
  const itemFields = field.itemFields ?? [];
  const update = (index: number, key: string, value: string) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  const addItem = () => {
    const blank: ContentListItem = { id: `item_${Date.now().toString(36)}` };
    for (const f of itemFields) blank[f.key] = '';
    onChange([...items, blank]);
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-on-surface">{field.label}</div>
      {field.hint && <p className="text-xs text-secondary -mt-2">{field.hint}</p>}
      {items.map((item, index) => (
        <div key={item.id} className="rounded-xl border border-outline-variant/25 p-4 space-y-3 bg-surface-container-low/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-secondary">
              {field.label} #{index + 1}
            </span>
            {!field.fixedItems && (
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                aria-label="Remove item"
                className="p-1.5 rounded-lg text-secondary hover:bg-error-container/40 hover:text-error transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {itemFields.map((f) => (
              <div key={f.key} className={f.type === 'textarea' || f.type === 'image' ? 'sm:col-span-2' : ''}>
                <ScalarInput type={f.type} label={f.label} value={item[f.key] ?? ''} onChange={(v) => update(index, f.key, v)} />
              </div>
            ))}
          </div>
        </div>
      ))}
      {!field.fixedItems && (
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-outline-variant/50 text-sm font-medium text-secondary hover:text-primary hover:border-primary/50 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add {field.label.toLowerCase()}
        </button>
      )}
    </div>
  );
}

export function ContentFieldInput({ field, value, isOverridden, onChange, onReset }: ContentFieldInputProps) {
  return (
    <div className="space-y-1.5">
      {field.type === 'list' ? (
        <ListInput field={field} items={Array.isArray(value) ? value : []} onChange={onChange} />
      ) : (
        <ScalarInput type={field.type} label={field.label} hint={field.hint} value={typeof value === 'string' ? value : ''} onChange={onChange} />
      )}
      {isOverridden && <ResetLink onReset={onReset} />}
    </div>
  );
}
