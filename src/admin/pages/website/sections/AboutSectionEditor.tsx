import { ChefHat } from 'lucide-react';
import { ImagePickerField } from '../../../components/forms/ImagePickerField';
import { TextField, TextareaField } from '../../../components/forms/Field';
import { SectionCard } from '../../../components/SectionCard';
import { useMedia } from '../../../hooks/api/useMedia';
import type { AboutSectionContent } from '../../../../types';

interface EditorProps {
  content: AboutSectionContent;
  onChange: (patch: Partial<AboutSectionContent>) => void;
}

export function AboutSectionEditor({ content, onChange }: EditorProps) {
  const { data: media } = useMedia();
  const imageUrl = (id?: string | null) => media?.items.find((m) => m.id === id)?.fileUrl;

  return (
    <div className="space-y-5">
      <SectionCard title="Content">
        <div className="space-y-4">
          <TextField label="Eyebrow" value={content.eyebrow ?? ''} onChange={(e) => onChange({ eyebrow: e.target.value })} />
          <TextField label="Heading" value={content.heading} onChange={(e) => onChange({ heading: e.target.value })} />
          <TextareaField label="Description" maxLength={500} rows={4} value={content.description} onChange={(e) => onChange({ description: e.target.value })} />
          <TextField label="Pull Quote" value={content.quote ?? ''} onChange={(e) => onChange({ quote: e.target.value })} />
          <ImagePickerField
            label="Section Image"
            currentImageUrl={imageUrl(content.imageMediaId)}
            onSelect={(asset) => onChange({ imageMediaId: asset.id })}
            onRemove={() => onChange({ imageMediaId: null })}
          />
        </div>
      </SectionCard>

      <SectionCard title="Chef Story" description="Optional — leave blank to hide this from the section." icon={ChefHat}>
        <div className="space-y-4">
          <TextField label="Chef Name" value={content.chefName ?? ''} onChange={(e) => onChange({ chefName: e.target.value })} />
          <TextareaField label="Chef Quote" rows={2} value={content.chefQuote ?? ''} onChange={(e) => onChange({ chefQuote: e.target.value })} />
          <TextareaField label="Chef Bio" rows={4} value={content.chefBio ?? ''} onChange={(e) => onChange({ chefBio: e.target.value })} />
          <ImagePickerField
            label="Chef Photo"
            currentImageUrl={imageUrl(content.chefImageMediaId)}
            onSelect={(asset) => onChange({ chefImageMediaId: asset.id })}
            onRemove={() => onChange({ chefImageMediaId: null })}
          />
        </div>
      </SectionCard>
    </div>
  );
}
