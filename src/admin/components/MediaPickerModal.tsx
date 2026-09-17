import { useRef, useState } from 'react';
import { X, Upload, CheckCircle2, Images, Search } from 'lucide-react';
import { useMedia, useUploadMedia } from '../hooks/api/useMedia';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';
import { Button } from './Button';
import type { MediaAsset } from '../../types';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
}

export function MediaPickerModal({ isOpen, onClose, onSelect }: MediaPickerModalProps) {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useMedia({ search: search || undefined });
  const uploadMedia = useUploadMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleUpload = async (file: File) => {
    const asset = await uploadMedia.mutateAsync({ file, opts: { folder: 'images' } });
    onSelect(asset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-2xl border border-outline-variant/20 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant/20">
          <h3 className="text-xl font-bold text-on-surface tracking-tight">Media Library</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 border-b border-outline-variant/20 flex gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search media..."
              className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-low pl-9 pr-3 py-2.5 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
          <Button variant="primary" icon={Upload} loading={uploadMedia.isPending} onClick={() => fileInputRef.current?.click()}>
            {uploadMedia.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : !data?.items.length ? (
            <EmptyState icon={Images} title="No media yet" description="Upload an image to get started." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.items.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => {
                    onSelect(asset);
                    onClose();
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-outline-variant/30 hover:border-primary transition-colors"
                >
                  <img src={asset.fileUrl} alt={asset.altText ?? asset.fileName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
