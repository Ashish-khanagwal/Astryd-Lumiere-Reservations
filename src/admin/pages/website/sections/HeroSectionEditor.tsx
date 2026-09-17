import { ImagePickerField } from '../../../components/forms/ImagePickerField';
import { TextField, TextareaField, SelectField } from '../../../components/forms/Field';
import { SectionCard } from '../../../components/SectionCard';
import { useMedia } from '../../../hooks/api/useMedia';
import type { HeroSectionContent } from '../../../../types';

interface EditorProps {
  content: HeroSectionContent;
  onChange: (patch: Partial<HeroSectionContent>) => void;
}

export function HeroSectionEditor({ content, onChange }: EditorProps) {
  const { data: media } = useMedia();
  const currentImage = media?.items.find((m) => m.id === content.backgroundMediaId)?.fileUrl;

  return (
    <div className="space-y-5">
      <SectionCard title="Content">
        <div className="space-y-4">
          <TextField label="Eyebrow" maxLength={60} value={content.eyebrow ?? ''} onChange={(e) => onChange({ eyebrow: e.target.value })} />
          <TextField label="Heading" maxLength={80} value={content.heading} onChange={(e) => onChange({ heading: e.target.value })} />
          <TextareaField label="Description" maxLength={240} rows={3} value={content.description} onChange={(e) => onChange({ description: e.target.value })} />
        </div>
      </SectionCard>

      <SectionCard title="Buttons">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Button Text" value={content.buttonText} onChange={(e) => onChange({ buttonText: e.target.value })} />
            <SelectField label="Button Link" value={content.buttonLink} onChange={(e) => onChange({ buttonLink: e.target.value })}>
              <option value="/reservations">Reservations</option>
              <option value="/menu">Menu</option>
            </SelectField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Secondary Button Text" value={content.secondaryButtonText ?? ''} onChange={(e) => onChange({ secondaryButtonText: e.target.value })} />
            <SelectField label="Secondary Button Link" value={content.secondaryButtonLink ?? '/menu'} onChange={(e) => onChange({ secondaryButtonLink: e.target.value })}>
              <option value="/menu">Menu</option>
              <option value="/reservations">Reservations</option>
            </SelectField>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Background">
        <div className="space-y-5">
          <ImagePickerField
            label="Background Image"
            currentImageUrl={currentImage}
            onSelect={(asset) => onChange({ backgroundMediaId: asset.id })}
            onRemove={() => onChange({ backgroundMediaId: null })}
          />
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">Overlay Darkness ({content.overlayOpacity}%)</label>
            <input
              type="range"
              min={0}
              max={90}
              value={content.overlayOpacity}
              onChange={(e) => onChange({ overlayOpacity: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
