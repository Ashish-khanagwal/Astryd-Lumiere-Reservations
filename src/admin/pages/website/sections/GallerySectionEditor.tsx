import { Trash2, ImagePlus } from 'lucide-react';
import { ImagePickerField } from '../../../components/forms/ImagePickerField';
import { ReorderableList } from '../../../components/ReorderableList';
import { TextField } from '../../../components/forms/Field';
import { SectionCard } from '../../../components/SectionCard';
import { EmptyState } from '../../../components/EmptyState';
import { useMedia } from '../../../hooks/api/useMedia';
import type { GalleryImageEntry, GallerySectionContent } from '../../../../types';

interface EditorProps {
  content?: Partial<GallerySectionContent> | null;
  onChange: (patch: Partial<GallerySectionContent>) => void;
}

export function GallerySectionEditor({ content, onChange }: EditorProps) {
  const { data: media } = useMedia();
  const mediaItems = media?.items ?? [];
  const galleryImages = content?.images;
  const images = Array.isArray(galleryImages) ? [...galleryImages].sort((a, b) => a.order - b.order) : [];

  const updateImage = (mediaId: string, patch: Partial<GalleryImageEntry>) => {
    onChange({ images: images.map((img) => (img.mediaId === mediaId ? { ...img, ...patch } : img)) });
  };

  const removeImage = (mediaId: string) => {
    onChange({ images: images.filter((img) => img.mediaId !== mediaId) });
  };

  const addImage = (assetId: string) => {
    if (images.some((img) => img.mediaId === assetId)) return;
    onChange({ images: [...images, { mediaId: assetId, caption: '', order: images.length }] });
  };

  return (
    <div className="space-y-5">
      <SectionCard title="Content">
        <div className="space-y-4">
          <TextField label="Eyebrow" value={content?.eyebrow ?? ''} onChange={(e) => onChange({ eyebrow: e.target.value })} />
          <TextField label="Heading" value={content?.heading ?? ''} onChange={(e) => onChange({ heading: e.target.value })} />
        </div>
      </SectionCard>

      <SectionCard title="Images" icon={ImagePlus}>
        <div className="mb-4">
          <ImagePickerField label="Add an image" onSelect={(asset) => addImage(asset.id)} />
        </div>

        {images.length === 0 ? (
          <EmptyState icon={ImagePlus} title="No images yet" description="Add photos from your media library to build the gallery." />
        ) : (
          <ReorderableList
            items={images.map((img) => ({ ...img, id: img.mediaId }))}
            onReorder={(next) => onChange({ images: next.map((img, idx) => ({ ...img, order: idx })) })}
            renderItem={(img, dragHandle) => (
              <div className="flex items-center gap-3 bg-surface rounded-xl border border-outline-variant/20 p-3 shadow-sm">
                {dragHandle}
                <img src={mediaItems.find((m) => m.id === img.mediaId)?.fileUrl} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                <input
                  value={img.caption ?? ''}
                  onChange={(e) => updateImage(img.mediaId, { caption: e.target.value })}
                  placeholder="Caption"
                  className="flex-1 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button onClick={() => removeImage(img.mediaId)} className="p-2 rounded-lg text-secondary hover:bg-error-container/40 hover:text-error transition-colors" aria-label="Remove image">
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
