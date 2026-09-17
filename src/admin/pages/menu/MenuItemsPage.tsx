import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Plus, SquarePen, Trash2 } from 'lucide-react';
import {
  useDeleteMenuItem,
  useMenu,
  useReorderMenuItems,
  useSetItemAvailability,
} from '../../hooks/api/useMenu';
import { useAdminToast } from '../../context/AdminToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import { ReorderableList } from '../../components/ReorderableList';
import { ToggleField } from '../../components/forms/ToggleField';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StatusPill } from '../../components/StatusPill';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { ListSkeleton } from '../../components/Skeleton';
import type { MenuItem } from '../../../types';

export function MenuItemsPage() {
  const { data: menu, isLoading } = useMenu();
  const setAvailability = useSetItemAvailability();
  const deleteItem = useDeleteMenuItem();
  const reorderItems = useReorderMenuItems();
  const { showToast } = useAdminToast();
  const { canDeleteMenuItems } = usePermissions();
  const navigate = useNavigate();
  const [pendingDelete, setPendingDelete] = useState<MenuItem | null>(null);

  const header = (
    <PageHeader
      icon={UtensilsCrossed}
      title="Menu Items"
      description="Drag to reorder. Toggle availability instantly without deleting."
      actions={
        <Button variant="primary" icon={Plus} onClick={() => navigate('/admin/menu/items/new')}>
          Add Menu Item
        </Button>
      }
    />
  );

  if (isLoading || !menu) {
    return (
      <div className="space-y-6">
        {header}
        <ListSkeleton rows={6} />
      </div>
    );
  }

  const categoryName = new Map(menu.categories.map((c) => [c.id, c.name]));
  const items = [...menu.items].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleReorder = (next: MenuItem[]) => {
    reorderItems.mutate(next.map((i, idx) => ({ id: i.id, displayOrder: idx })));
  };

  return (
    <div className="space-y-6">
      {header}

      {items.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No menu items yet"
          description="Add your first dish or drink to start building your menu."
          action={
            <Button variant="primary" icon={Plus} onClick={() => navigate('/admin/menu/items/new')}>
              Add Menu Item
            </Button>
          }
        />
      ) : (
        <ReorderableList
          items={items}
          onReorder={handleReorder}
          renderItem={(item, dragHandle) => (
            <div className="flex items-center gap-4 bg-surface rounded-xl border border-outline-variant/20 p-4 shadow-sm transition-shadow hover:shadow-md">
              {dragHandle}
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 shrink-0 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                  <UtensilsCrossed className="h-5 w-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-on-surface truncate">{item.name}</div>
                <div className="text-xs text-secondary mt-0.5">{categoryName.get(item.categoryId) ?? 'Uncategorized'} · ${item.price.toFixed(2)}</div>
              </div>
              {item.isFeatured && <StatusPill label="Featured" tone="positive" />}
              <ToggleField
                label="Available"
                checked={item.isAvailable}
                onChange={(isAvailable) => setAvailability.mutate({ itemId: item.id, isAvailable })}
              />
              <button
                onClick={() => navigate(`/admin/menu/items/${item.id}`)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-outline-variant/40 text-sm font-medium hover:bg-surface-container-high transition-colors"
              >
                <SquarePen className="h-4 w-4" />
                Edit
              </button>
              {canDeleteMenuItems && (
                <button onClick={() => setPendingDelete(item)} className="text-secondary hover:text-error transition-colors p-1.5 rounded-lg hover:bg-error-container/40">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete menu item?"
        description={`"${pendingDelete?.name}" will be removed from your menu. This is a soft delete and can be recovered by support if needed.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) {
            await deleteItem.mutateAsync(pendingDelete.id);
            showToast('Menu item deleted.');
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
