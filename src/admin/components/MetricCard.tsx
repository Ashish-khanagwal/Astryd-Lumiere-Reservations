import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: 'primary' | 'tertiary' | 'secondary' | 'error';
  onClick?: () => void;
}

const TONE_CLASSES: Record<Required<MetricCardProps>['tone'], string> = {
  primary: 'bg-indigo-50 text-primary',
  tertiary: 'bg-violet-50 text-violet-600',
  secondary: 'bg-sky-50 text-sky-600',
  error: 'bg-rose-50 text-rose-500',
};

export function MetricCard({ label, value, icon: Icon, hint, tone = 'primary', onClick }: MetricCardProps) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`group text-left admin-card p-5 w-full transition-all ${
        onClick ? 'hover:-translate-y-0.5 hover:shadow-lg cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${TONE_CLASSES[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {onClick && (
          <ArrowUpRight className="h-4 w-4 text-secondary opacity-0 -translate-x-1 translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" />
        )}
      </div>
      <div className="text-[11px] text-secondary font-medium mt-4">{label}</div>
      <div className="text-2xl font-bold text-on-surface mt-1 tracking-tight">{value}</div>
      {hint && <div className="text-[11px] text-secondary/80 mt-1.5">{hint}</div>}
    </Tag>
  );
}
