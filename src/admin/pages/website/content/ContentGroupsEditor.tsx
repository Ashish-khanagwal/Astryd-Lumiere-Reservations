import { useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { SectionCard } from '../../../components/SectionCard';
import { ToggleField } from '../../../components/forms/ToggleField';
import { ContentFieldInput } from './ContentFieldInput';
import type { ContentFields, ContentGroupDef, ContentPageDefinition, ContentValue, TemplateVariant } from '../../../../types';

interface ContentGroupsEditorProps {
  definition: ContentPageDefinition;
  /** Code defaults for this Site's Vertical. */
  defaults: ContentFields;
  /** The owner's stored overrides (what gets saved). */
  overrides: ContentFields;
  activeVariant?: TemplateVariant;
  onChange: (next: ContentFields) => void;
}

function GroupFields({ group, defaults, overrides, onChange }: { group: ContentGroupDef } & Pick<ContentGroupsEditorProps, 'defaults' | 'overrides' | 'onChange'>) {
  const setField = (key: string, value: ContentValue) => {
    const next = { ...overrides };
    // Typing a value back to exactly the default drops the override, so the field keeps tracking future default changes.
    if (JSON.stringify(value) === JSON.stringify(defaults[key])) delete next[key];
    else next[key] = value;
    onChange(next);
  };
  const resetField = (key: string) => {
    const next = { ...overrides };
    delete next[key];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {group.fields.map((field) => (
        <ContentFieldInput
          key={field.key}
          field={field}
          value={overrides[field.key] ?? defaults[field.key] ?? (field.type === 'list' ? [] : '')}
          isOverridden={field.key in overrides}
          onChange={(value) => setField(field.key, value)}
          onReset={() => resetField(field.key)}
        />
      ))}
    </div>
  );
}

export function ContentGroupsEditor({ definition, defaults, overrides, activeVariant, onChange }: ContentGroupsEditorProps) {
  const [showAllLayouts, setShowAllLayouts] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const visible = definition.groups.filter(
    (g) => showAllLayouts || !g.variants || !activeVariant || g.variants.includes(activeVariant),
  );
  const main = visible.filter((g) => !g.advanced);
  const advanced = visible.filter((g) => g.advanced);
  const hasVariantGroups = definition.groups.some((g) => g.variants);

  return (
    <div className="space-y-6">
      {hasVariantGroups && (
        <div className="admin-card px-5 py-2">
          <ToggleField
            label="Show fields for all layouts"
            description={`Only fields used by this page's current layout (${activeVariant?.toUpperCase() ?? 'A'}) are shown by default.`}
            checked={showAllLayouts}
            onChange={setShowAllLayouts}
          />
        </div>
      )}

      {main.map((group) => (
        <SectionCard key={group.id} title={group.title} description={group.description}>
          <GroupFields group={group} defaults={defaults} overrides={overrides} onChange={onChange} />
        </SectionCard>
      ))}

      {advanced.length > 0 && (
        <div className="admin-card">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="w-full flex items-center justify-between gap-3 p-5 text-left"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-base font-bold text-on-surface">Labels & messages</span>
                <span className="block text-xs text-secondary">Buttons, form labels, placeholders, notifications and error messages.</span>
              </span>
            </span>
            <ChevronDown className={`h-5 w-5 text-secondary transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
          {showAdvanced && (
            <div className="px-5 pb-5 space-y-6">
              {advanced.map((group) => (
                <div key={group.id} className="pt-5 border-t border-outline-variant/15">
                  <h4 className="text-sm font-bold text-on-surface mb-4">{group.title}</h4>
                  <GroupFields group={group} defaults={defaults} overrides={overrides} onChange={onChange} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {visible.length === 0 && <p className="text-sm text-secondary">No editable content for this page yet.</p>}
    </div>
  );
}
