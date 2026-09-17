import { useState } from 'react';
import { PlusCircle, SquarePen, Trash2 } from 'lucide-react';
import { useAddons, useCreateAddon, useDeleteAddon, useUpdateAddon } from '../../hooks/api/useAddons';
import { useAdminToast } from '../../context/AdminToastContext';
import { DataTable } from '../../components/DataTable';
import { ToggleField } from '../../components/forms/ToggleField';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { TextField, TextareaField } from '../../components/forms/Field';
import type { Addon } from '../../../types';

const EMPTY: Partial<Addon> = { name: '', price: 0, description: '', isAvailable: true, group: 'Add-on Items' };

export function AddonsPage() {
  const { data: addons, isLoading } = useAddons();
  const createAddon = useCreateAddon();
  const updateAddon = useUpdateAddon();
  const deleteAddon = useDeleteAddon();
  const { showToast } = useAdminToast();

  const [form, setForm] = useState<Partial<Addon> | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Addon | null>(null);

  const handleSave = async () => {
    if (!form?.name?.trim()) return;
    if (form.id) {
      await updateAddon.mutateAsync({ addonId: form.id, payload: form });
      showToast('Add-on updated.');
    } else {
      await createAddon.mutateAsync(form);
      showToast('Add-on created.');
    }
    setForm(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PlusCircle}
        title="Add-ons"
        description="Extras guests can add to a dish (extra cheese, sauces, drinks...)."
        actions={
          <Button variant="primary" icon={PlusCircle} onClick={() => setForm(EMPTY)}>
            Add Add-on
          </Button>
        }
      />

      <DataTable
        rows={addons ?? []}
        rowKey={(a) => a.id}
        loading={isLoading}
        emptyMessage="No add-ons created yet."
        columns={[
          { header: 'Name', render: (a) => <span className="font-semibold text-on-surface">{a.name}</span> },
          { header: 'Group', render: (a) => <span className="text-secondary">{a.group ?? '—'}</span> },
          { header: 'Price', render: (a) => <span className="font-medium">${a.price.toFixed(2)}</span> },
          {
            header: 'Available',
            render: (a) => <ToggleField label="" checked={a.isAvailable} onChange={(isAvailable) => updateAddon.mutate({ addonId: a.id, payload: { isAvailable } })} />,
          },
          {
            header: '',
            className: 'text-right',
            render: (a) => (
              <div className="flex gap-1.5 justify-end">
                <button onClick={() => setForm(a)} className="p-2 rounded-lg text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors" aria-label="Edit">
                  <SquarePen className="h-4 w-4" />
                </button>
                <button onClick={() => setPendingDelete(a)} className="p-2 rounded-lg text-secondary hover:bg-error-container/40 hover:text-error transition-colors" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        isOpen={Boolean(form)}
        onClose={() => setForm(null)}
        title={form?.id ? 'Edit Add-on' : 'New Add-on'}
        footer={
          <>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField label="Name" required value={form?.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Price ($)" type="number" step={0.01} value={form?.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            <TextField label="Group" placeholder="e.g. Beverages" value={form?.group ?? ''} onChange={(e) => setForm({ ...form, group: e.target.value })} />
          </div>
          <TextareaField label="Description" rows={2} value={form?.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete add-on?"
        description={`"${pendingDelete?.name}" will be removed and unassigned from any menu items.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) {
            await deleteAddon.mutateAsync(pendingDelete.id);
            showToast('Add-on deleted.');
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
