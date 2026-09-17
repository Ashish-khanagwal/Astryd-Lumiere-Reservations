import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { ListSkeleton } from './Skeleton';

export interface DataTableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  loading?: boolean;
}

export function DataTable<T>({ columns, rows, rowKey, emptyMessage = 'Nothing here yet.', loading = false }: DataTableProps<T>) {
  if (loading) {
    return <ListSkeleton />;
  }

  if (rows.length === 0) {
    return <EmptyState icon={Inbox} title={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto admin-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline-variant/20 bg-surface-container-low">
            {columns.map((col) => (
              <th key={col.header} className={`text-left px-4 py-3.5 font-semibold text-secondary uppercase text-xs tracking-wide ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-outline-variant/10 last:border-0 transition-colors hover:bg-surface-container-low/60">
              {columns.map((col) => (
                <td key={col.header} className={`px-4 py-3.5 align-middle ${col.className ?? ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
