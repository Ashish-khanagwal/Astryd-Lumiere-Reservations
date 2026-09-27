import { AlertCircle, RotateCw } from 'lucide-react';
import { Button } from '../../../../components/Button';

/** Shown instead of an endless skeleton when a panel's data can't be loaded. */
export function PanelLoadError({ onRetry, isRetrying }: { onRetry: () => void; isRetrying?: boolean }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-center">
      <AlertCircle className="h-6 w-6 text-rose-600 mx-auto" />
      <p className="mt-2 text-sm font-semibold text-on-surface">This couldn't be loaded</p>
      <p className="mt-1 text-xs text-secondary">Check your connection, then try again. Nothing you've saved is lost.</p>
      <Button variant="outline" size="sm" icon={RotateCw} loading={isRetrying} onClick={onRetry} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
