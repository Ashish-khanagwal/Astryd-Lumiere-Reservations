import { ImagePickerField } from '../../../components/forms/ImagePickerField';
import { ReorderableList } from '../../../components/ReorderableList';
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
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-on-surface">Images</label>
          <ImagePickerField label="" onSelect={(asset) => addImage(asset.id)} />
        </div>
        <ReorderableList
          items={images.map((img) => ({ ...img, id: img.mediaId }))}
          onReorder={(next) => onChange({ images: next.map((img, idx) => ({ ...img, order: idx })) })}
          renderItem={(img, dragHandle) => (
            <div className="flex items-center gap-3 bg-surface rounded-xl border border-outline-variant/20 p-3">
              {dragHandle}
              <img src={mediaItems.find((m) => m.id === img.mediaId)?.fileUrl} alt="" className="w-14 h-14 rounded-lg object-cover" />
              <input
                value={img.caption ?? ''}
                onChange={(e) => updateImage(img.mediaId, { caption: e.target.value })}
                placeholder="Caption"
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-outline-variant/30 bg-surface-container-low"
              />
              <button onClick={() => removeImage(img.mediaId)} className="text-error hover:opacity-70">
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
