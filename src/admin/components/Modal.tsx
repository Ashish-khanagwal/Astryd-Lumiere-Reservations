import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, description, children, footer, maxWidth = 'max-w-lg' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`bg-surface w-full ${maxWidth} rounded-2xl shadow-2xl border border-outline-variant/20 max-h-[90vh] flex flex-col`}>
        <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-outline-variant/10 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-on-surface tracking-tight">{title}</h3>
            {description && <p className="text-xs text-secondary mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 p-6 pt-4 border-t border-outline-variant/10 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
