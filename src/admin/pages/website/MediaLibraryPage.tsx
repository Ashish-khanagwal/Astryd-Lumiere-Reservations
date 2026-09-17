import { useRef, useState } from 'react';
import { Images, Upload, Search, Trash2 } from 'lucide-react';
import { useDeleteMedia, useMedia, useUploadMedia } from '../../hooks/api/useMedia';
import { useAdminToast } from '../../context/AdminToastContext';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';

export function MediaLibraryPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useMedia({ search: search || undefined });
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const { showToast } = useAdminToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    await uploadMedia.mutateAsync({ file, opts: { folder: 'images' } });
    showToast('Media uploaded.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Images}
        title="Media Library"
        description="Upload and reuse images across your website."
        actions={
          <>
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
              {uploadMedia.isPending ? 'Uploading...' : 'Upload Media'}
            </Button>
          </>
        }
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search media by name..."
          className="w-full rounded-xl border border-outline-variant/40 bg-surface pl-9 pr-3 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <EmptyState icon={Images} title="No media uploaded yet" description="Upload photos of your dishes, interior, and team to use across your website." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.items.map((asset) => (
            <div key={asset.id} className="group relative aspect-square rounded-xl overflow-hidden border border-outline-variant/30 bg-surface-container-low shadow-sm transition-shadow hover:shadow-md">
              <img src={asset.fileUrl} alt={asset.altText ?? asset.fileName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button onClick={() => setPendingDeleteId(asset.id)} className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors" aria-label="Delete media">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">{asset.fileName}</div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteId)}
        title="Delete media?"
        description="This file will be removed from your media library. Any sections still referencing it will show a broken image."
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={async () => {
          if (pendingDeleteId) {
            await deleteMedia.mutateAsync(pendingDeleteId);
            showToast('Media deleted.');
          }
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
}
