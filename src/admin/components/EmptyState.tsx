import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 admin-card border-dashed">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container-high text-secondary mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-on-surface tracking-tight">{title}</h3>
      {description && <p className="text-secondary text-sm mt-1.5 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
