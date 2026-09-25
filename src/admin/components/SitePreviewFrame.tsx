import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { Loader2 } from 'lucide-react';

export type PreviewDevice = 'desktop' | 'mobile';
const DEVICE_WIDTH: Record<PreviewDevice, number> = { desktop: 1280, mobile: 390 };

interface SitePreviewFrameProps {
  src: string;
  device: PreviewDevice;
  iframeRef?: RefObject<HTMLIFrameElement | null>;
  title?: string;
}

/** Renders the real public site at a real device width, scaled down to fit whatever space it's given. */
export function SitePreviewFrame({ src, device, iframeRef, title = 'Site preview' }: SitePreviewFrameProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setBox({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => setLoaded(false), [src]);

  const frameWidth = DEVICE_WIDTH[device];
  const padding = device === 'mobile' ? 24 : 0;
  const scale = box.width ? Math.min(1, (box.width - padding * 2) / frameWidth) : 0;
  const frameHeight = scale ? (box.height - padding * 2) / scale : 0;

  return (
    <div ref={boxRef} className="relative h-full w-full overflow-hidden bg-surface-container-low">
      {scale > 0 && (
        <div
          className={`absolute left-1/2 overflow-hidden bg-white ${device === 'mobile' ? 'rounded-[28px] border-[6px] border-slate-800 shadow-xl' : ''}`}
          style={{
            top: padding,
            width: frameWidth,
            height: frameHeight,
            transform: `translateX(-50%) scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          <iframe ref={iframeRef} key={src} title={title} src={src} onLoad={() => setLoaded(true)} className="w-full h-full" style={{ border: 'none' }} />
        </div>
      )}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-secondary bg-surface-container-low/80">
          <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading preview…
        </div>
      )}
    </div>
  );
}
