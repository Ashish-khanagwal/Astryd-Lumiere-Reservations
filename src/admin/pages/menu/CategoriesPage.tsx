import { useState } from 'react';
import { LayoutGrid, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  useCreateCategory,
  useDeleteCategory,
  useMenu,
  useReorderCategories,
  useUpdateCategory,
} from '../../hooks/api/useMenu';
import { useAdminToast } from '../../context/AdminToastContext';
import { ReorderableList } from '../../components/ReorderableList';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { ListSkeleton } from '../../components/Skeleton';
import type { MenuCategory } from '../../../types';

export function CategoriesPage() {
  const { data: menu, isLoading } = useMenu();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();
  const { showToast } = useAdminToast();

  const [newName, setNewName] = useState('');
  const [pendingDelete, setPendingDelete] = useState<MenuCategory | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const header = (
    <PageHeader
      icon={LayoutGrid}
      title="Menu Categories"
      description="Organize your menu into categories, and drag to reorder how they appear on the site."
    />
  );

  if (isLoading || !menu) {
    return (
      <div className="space-y-6">
        {header}
        <ListSkeleton />
      </div>
    );
  }

  const categories = [...menu.categories].sort((a, b) => a.displayOrder - b.displayOrder);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await createCategory.mutateAsync({ name: newName.trim() });
    setNewName('');
    showToast('Category created.');
  };

  const handleReorder = (next: MenuCategory[]) => {
    reorderCategories.mutate(next.map((c, idx) => ({ id: c.id, displayOrder: idx })));
  };

  return (
    <div className="space-y-6">
      {header}

      <div className="flex gap-2 max-w-md">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="New category name"
          className="flex-1 rounded-xl border border-outline-variant/40 bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-secondary/70 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        <Button variant="primary" icon={Plus} onClick={handleAdd}>
          Add
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={LayoutGrid} title="No categories yet" description="Create your first category above to start organizing your menu." />
      ) : (
        <ReorderableList
          items={categories}
          onReorder={handleReorder}
          renderItem={(category, dragHandle) => (
            <div className="group flex items-center gap-3 bg-surface rounded-xl border border-outline-variant/20 p-4 shadow-sm transition-shadow hover:shadow-md">
              {dragHandle}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LayoutGrid className="h-4 w-4" />
              </div>

              {editingId === category.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => {
                    updateCategory.mutate({ categoryId: category.id, payload: { name: editingName } });
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                  className="flex-1 px-2.5 py-1.5 text-sm rounded-lg border border-primary bg-surface-container-low outline-none"
                />
              ) : (
                <button className="flex-1 text-left font-semibold text-on-surface truncate" onClick={() => { setEditingId(category.id); setEditingName(category.name); }}>
                  {category.name}
                </button>
              )}

              <button
                onClick={() => { setEditingId(category.id); setEditingName(category.name); }}
                className="text-secondary opacity-0 group-hover:opacity-100 hover:text-on-surface transition-opacity p-1.5 rounded-lg hover:bg-surface-container-high"
                aria-label="Rename category"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                onClick={() => updateCategory.mutate({ categoryId: category.id, payload: { isVisible: !category.isVisible } })}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  category.isVisible ? 'text-secondary hover:bg-surface-container-high' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {category.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {category.isVisible ? 'Visible' : 'Hidden'}
              </button>

              <button onClick={() => setPendingDelete(category)} className="text-secondary hover:text-error transition-colors p-1.5 rounded-lg hover:bg-error-container/40">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete category?"
        description={`"${pendingDelete?.name}" will be removed. Items in this category will need reassigning.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) {
            await deleteCategory.mutateAsync(pendingDelete.id);
            showToast('Category deleted.');
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
