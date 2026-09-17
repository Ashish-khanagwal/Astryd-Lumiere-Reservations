import { useState } from 'react';
import { Tag, SquarePen, Trash2 } from 'lucide-react';
import { useCreateOffer, useDeleteOffer, useOffers, useUpdateOffer } from '../../hooks/api/useOffers';
import { useMenu } from '../../hooks/api/useMenu';
import { useAdminToast } from '../../context/AdminToastContext';
import { DataTable } from '../../components/DataTable';
import { ToggleField } from '../../components/forms/ToggleField';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { TextField, SelectField } from '../../components/forms/Field';
import type { Offer, OfferType } from '../../../types';

const EMPTY: Partial<Offer> = {
  name: '', type: 'percentage', discountValue: 10, isActive: true,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
  appliesToItemIds: [], appliesToCategoryIds: [],
};

const OFFER_TYPE_LABEL: Record<OfferType, string> = {
  percentage: 'Percentage Discount', fixed: 'Fixed Discount', special_price: 'Special Price', bogo: 'Buy One Get One',
};

export function OffersPage() {
  const { data: offers, isLoading } = useOffers();
  const { data: menu } = useMenu();
  const createOffer = useCreateOffer();
  const updateOffer = useUpdateOffer();
  const deleteOffer = useDeleteOffer();
  const { showToast } = useAdminToast();

  const [form, setForm] = useState<Partial<Offer> | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Offer | null>(null);

  const handleSave = async () => {
    if (!form?.name?.trim()) return;
    if (form.id) {
      await updateOffer.mutateAsync({ offerId: form.id, payload: form });
      showToast('Offer updated.');
    } else {
      await createOffer.mutateAsync(form);
      showToast('Offer created.');
    }
    setForm(null);
  };

  const toggleItem = (itemId: string) => {
    if (!form) return;
    const ids = form.appliesToItemIds ?? [];
    setForm({ ...form, appliesToItemIds: ids.includes(itemId) ? ids.filter((i) => i !== itemId) : [...ids, itemId] });
  };

  const selectedCount = (form?.appliesToItemIds ?? []).length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Tag}
        title="Offers & Promotions"
        description="Discounts and promotions linked to menu items."
        actions={
          <Button variant="primary" icon={Tag} onClick={() => setForm(EMPTY)}>
            Add Offer
          </Button>
        }
      />

      <DataTable
        rows={offers ?? []}
        rowKey={(o) => o.id}
        loading={isLoading}
        emptyMessage="No offers created yet."
        columns={[
          { header: 'Name', render: (o) => <span className="font-semibold text-on-surface">{o.name}</span> },
          { header: 'Type', render: (o) => <span className="text-secondary">{OFFER_TYPE_LABEL[o.type]}</span> },
          { header: 'Valid Through', render: (o) => <span className="text-secondary">{new Date(o.endDate).toLocaleDateString()}</span> },
          {
            header: 'Active',
            render: (o) => <ToggleField label="" checked={o.isActive} onChange={(isActive) => updateOffer.mutate({ offerId: o.id, payload: { isActive } })} />,
          },
          {
            header: '',
            className: 'text-right',
            render: (o) => (
              <div className="flex gap-1.5 justify-end">
                <button onClick={() => setForm(o)} className="p-2 rounded-lg text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors" aria-label="Edit">
                  <SquarePen className="h-4 w-4" />
                </button>
                <button onClick={() => setPendingDelete(o)} className="p-2 rounded-lg text-secondary hover:bg-error-container/40 hover:text-error transition-colors" aria-label="Delete">
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
        title={form?.id ? 'Edit Offer' : 'New Offer'}
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField label="Offer Name" required value={form?.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Offer Type"
              value={form?.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as OfferType })}
            >
              {Object.entries(OFFER_TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </SelectField>
            {form?.type === 'special_price' ? (
              <TextField label="Special Price ($)" type="number" value={form?.specialPrice ?? 0} onChange={(e) => setForm({ ...form, specialPrice: Number(e.target.value) })} />
            ) : form?.type !== 'bogo' ? (
              <TextField
                label={`Discount Value ${form?.type === 'percentage' ? '(%)' : '($)'}`}
                type="number"
                value={form?.discountValue ?? 0}
                onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
              />
            ) : (
              <div />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField label="Start Date" type="date" value={form?.startDate?.slice(0, 10)} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <TextField label="End Date" type="date" value={form?.endDate?.slice(0, 10)} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>

          <TextField label="CTA Text" placeholder="Order Now" value={form?.cta ?? ''} onChange={(e) => setForm({ ...form, cta: e.target.value })} />

          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1.5">
              Applies to Items {selectedCount > 0 && <span className="text-secondary font-normal">({selectedCount} selected)</span>}
            </label>
            <div className="max-h-40 overflow-y-auto space-y-0.5 border border-outline-variant/30 rounded-xl p-2 bg-surface-container-low/40">
              {menu?.items.map((item) => (
                <label key={item.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-container-high cursor-pointer text-sm transition-colors">
                  <input type="checkbox" checked={(form?.appliesToItemIds ?? []).includes(item.id)} onChange={() => toggleItem(item.id)} className="accent-primary h-4 w-4" />
                  {item.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete offer?"
        description={`"${pendingDelete?.name}" will be removed and unlinked from any menu items.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) {
            await deleteOffer.mutateAsync(pendingDelete.id);
            showToast('Offer deleted.');
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
