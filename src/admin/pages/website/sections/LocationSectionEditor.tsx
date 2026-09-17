import { ToggleField } from '../../../components/forms/ToggleField';
import { TextField } from '../../../components/forms/Field';
import { SectionCard } from '../../../components/SectionCard';
import type { LocationSectionContent } from '../../../../types';

interface EditorProps {
  content: LocationSectionContent;
  onChange: (patch: Partial<LocationSectionContent>) => void;
}

export function LocationSectionEditor({ content, onChange }: EditorProps) {
  return (
    <SectionCard title="Location">
      <div className="space-y-4">
        <TextField label="Heading" value={content.heading} onChange={(e) => onChange({ heading: e.target.value })} />
        <TextField
          label="Address Override"
          hint="Leave blank to use the address from Restaurant Information."
          value={content.addressOverride ?? ''}
          onChange={(e) => onChange({ addressOverride: e.target.value })}
        />
        <TextField
          label="Google Maps Embed URL"
          placeholder="https://www.google.com/maps/embed?..."
          value={content.mapEmbedUrlOverride ?? ''}
          onChange={(e) => onChange({ mapEmbedUrlOverride: e.target.value })}
        />
        <div className="pt-1 border-t border-outline-variant/10">
          <ToggleField label="Show Opening Hours Table" checked={content.showHoursTable} onChange={(showHoursTable) => onChange({ showHoursTable })} />
        </div>
      </div>
    </SectionCard>
  );
}
