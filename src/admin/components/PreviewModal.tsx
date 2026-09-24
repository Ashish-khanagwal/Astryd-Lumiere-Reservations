import { useState } from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink, X } from 'lucide-react';

type Device = 'desktop' | 'tablet' | 'mobile';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
}

const DEVICE_OPTIONS: { key: Device; label: string; icon: typeof Monitor }[] = [
  { key: 'desktop', label: 'Desktop', icon: Monitor },
  { key: 'tablet', label: 'Tablet', icon: Tablet },
  { key: 'mobile', label: 'Mobile', icon: Smartphone },
];

const FRAME_WIDTH: Record<Device, number | string> = {
  desktop: '100%',
  tablet: 768,
  mobile: 375,
};

export function PreviewModal({ isOpen, onClose, url = '/?preview=true' }: PreviewModalProps) {
  const [device, setDevice] = useState<Device>('desktop');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-6xl rounded-2xl shadow-2xl border border-outline-variant/20 p-4 flex flex-col gap-4 max-h-[90vh]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-0.5 rounded-lg border border-outline-variant/40 p-0.5">
            {DEVICE_OPTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setDevice(key)}
                title={`${label} preview`}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  device === key ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open in new tab
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex justify-center bg-surface-container-low rounded-xl p-4">
          <div
            className="mx-auto overflow-hidden rounded-lg border border-outline-variant/40 bg-white transition-all"
            style={{ width: FRAME_WIDTH[device], height: '100%', minHeight: 480 }}
          >
            <iframe key={url} title="Site preview" src={url} className="w-full h-full" style={{ border: 'none', minHeight: 480 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
