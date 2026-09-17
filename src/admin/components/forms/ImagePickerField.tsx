import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { MediaPickerModal } from '../MediaPickerModal';
import type { MediaAsset } from '../../../types';

interface ImagePickerFieldProps {
  label: string;
  currentImageUrl?: string;
  onSelect: (asset: MediaAsset) => void;
  onRemove?: () => void;
}

/** Preview / Replace / Remove pattern per plan §39. */
export function ImagePickerField({ label, currentImageUrl, onSelect, onRemove }: ImagePickerFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <div>
      <label className="block text-sm font-semibold text-on-surface mb-1.5">{label}</label>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low shrink-0 flex items-center justify-center">
          {currentImageUrl ? (
            <img src={currentImageUrl} alt={label} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-secondary" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="px-4 py-2 rounded-lg border border-outline-variant/40 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          >
            {currentImageUrl ? 'Replace Image' : 'Upload Image'}
          </button>
          {currentImageUrl && onRemove && (
            <button type="button" onClick={onRemove} className="text-xs text-error font-medium hover:underline text-left">
              Remove
            </button>
          )}
        </div>
      </div>
      <MediaPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} onSelect={onSelect} />
    </div>
  );
}
