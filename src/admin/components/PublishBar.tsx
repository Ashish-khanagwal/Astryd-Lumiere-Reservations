import { useState } from 'react';
import { PreviewModal } from './PreviewModal';

interface PublishBarProps {
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  lastPublishedAt?: string | null;
  previewUrl?: string;
}

export function PublishBar({ isDirty, isSaving, isPublishing, onSaveDraft, onPublish, lastPublishedAt, previewUrl }: PublishBarProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 bg-surface/95 backdrop-blur-md border-b border-outline-variant/20 px-4 sm:px-6 lg:px-8 py-3 -mx-4 sm:-mx-6 lg:-mx-8 mb-6">
        <div className="text-xs text-secondary">
          {lastPublishedAt ? `Last published ${new Date(lastPublishedAt).toLocaleString()}` : 'Not published yet'}
          {isDirty && <span className="ml-2 text-amber-700 font-semibold">• Unsaved changes</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSaveDraft}
            disabled={!isDirty || isSaving}
            className="px-4 py-2 rounded-xl border border-outline-variant/40 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-40"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2 rounded-xl border border-outline-variant/40 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Preview
          </button>
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className="px-5 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            {isPublishing ? 'Publishing...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} url={previewUrl} />
    </>
  );
}
