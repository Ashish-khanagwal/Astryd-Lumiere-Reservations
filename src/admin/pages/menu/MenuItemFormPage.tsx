import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Info, Tag as TagIcon, Layers, PlusCircle } from 'lucide-react';
import { useCreateMenuItem, useMenu, useUpdateMenuItem } from '../../hooks/api/useMenu';
import { useAddons } from '../../hooks/api/useAddons';
import { useOffers } from '../../hooks/api/useOffers';
import { useAdminToast } from '../../context/AdminToastContext';
import { ImagePickerField } from '../../components/forms/ImagePickerField';
import { ToggleField } from '../../components/forms/ToggleField';
import { TagInput } from '../../components/forms/TagInput';
import { AddonAssignmentField } from '../../components/AddonAssignmentField';
import { SectionCard } from '../../components/SectionCard';
import { Button } from '../../components/Button';
import { TextField, TextareaField, SelectField } from '../../components/forms/Field';
import type { FoodType, MenuItem, MenuItemVariant } from '../../../types';
import { tempId } from '../../utils/tempId';

const EMPTY_ITEM: Partial<MenuItem> = {
  name: '', description: '', price: 0, categoryId: '', foodType: 'na', tags: [],
  prepTimeMinutes: undefined, isAvailable: true, isFeatured: false, variants: [], addonIds: [], activeOfferId: null,
};

export function MenuItemFormPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const isNew = !itemId || itemId === 'new';
  const navigate = useNavigate();
  const { data: menu } = useMenu();
  const { data: addons } = useAddons();
  const { data: offers } = useOffers();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const { showToast } = useAdminToast();

  const [form, setForm] = useState<Partial<MenuItem>>(EMPTY_ITEM);

  useEffect(() => {
    if (!isNew && menu) {
      const existing = menu.items.find((i) => i.id === itemId);
      if (existing) setForm(existing);
    }
  }, [isNew, itemId, menu]);

  const set = <K extends keyof MenuItem>(key: K, value: MenuItem[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.name?.trim() || !form.categoryId) {
      showToast('Name and category are required.', 'error');
      return;
    }
    if (isNew) {
      await createItem.mutateAsync(form);
      showToast('Menu item created.');
    } else if (itemId) {
      await updateItem.mutateAsync({ itemId, payload: form });
      showToast('Menu item updated.');
    }
    navigate('/admin/menu/items');
  };

  const variants = form.variants ?? [];
  const updateVariant = (id: string, patch: Partial<MenuItemVariant>) =>
    set('variants', variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  const addVariant = () => set('variants', [...variants, { id: tempId('variant'), name: '', price: form.price ?? 0, isDefault: variants.length === 0 }]);
  const removeVariant = (id: string) => set('variants', variants.filter((v) => v.id !== id));

  const isSaving = createItem.isPending || updateItem.isPending;

  return (
    <div className="max-w-4xl space-y-6 pb-24">
      <div>
        <button onClick={() => navigate('/admin/menu/items')} className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-on-surface transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Menu Items
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">{isNew ? 'Add Menu Item' : 'Edit Menu Item'}</h1>
        <p className="text-secondary text-sm mt-1">{isNew ? 'Create a new dish or drink for your menu.' : 'Update details, pricing, and availability for this item.'}</p>
      </div>

      <SectionCard title="Basic Information" description="What guests will see on the menu." icon={Info}>
        <div className="space-y-4">
          <TextField label="Item Name" required maxLength={100} value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Truffle Risotto" />
          <TextareaField label="Description" rows={3} maxLength={400} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} placeholder="A short, appetizing description..." />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Price ($)" required type="number" min={0} step={0.01} value={form.price ?? 0} onChange={(e) => set('price', Math.max(0, Number(e.target.value)))} />
            <SelectField label="Category" required value={form.categoryId ?? ''} onChange={(e) => set('categoryId', e.target.value)}>
              <option value="">Select category</option>
              {menu?.categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </SelectField>
          </div>
          <ImagePickerField
            label="Image"
            currentImageUrl={form.imageUrl}
            onSelect={(asset) => setForm((prev) => ({ ...prev, imageMediaId: asset.id, imageUrl: asset.fileUrl }))}
            onRemove={() => setForm((prev) => ({ ...prev, imageMediaId: null, imageUrl: undefined }))}
          />
        </div>
      </SectionCard>

      <SectionCard title="Attributes" description="Dietary type, prep time, and search tags." icon={TagIcon}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Food Type" value={form.foodType ?? 'na'} onChange={(e) => set('foodType', e.target.value as FoodType)}>
              <option value="veg">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="non_veg">Non-Vegetarian</option>
              <option value="na">Not Applicable</option>
            </SelectField>
            <TextField label="Preparation Time (min)" type="number" min={0} value={form.prepTimeMinutes ?? ''} onChange={(e) => set('prepTimeMinutes', Number(e.target.value))} />
          </div>
          <TagInput label="Tags" tags={form.tags ?? []} onChange={(tags) => set('tags', tags)} />
          <div className="flex flex-wrap gap-8 pt-1 border-t border-outline-variant/10">
            <ToggleField label="Available" checked={form.isAvailable ?? true} onChange={(v) => set('isAvailable', v)} />
            <ToggleField label="Featured" checked={form.isFeatured ?? false} onChange={(v) => set('isFeatured', v)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Variants"
        description="Optional sizes or options, e.g. Small / Medium / Large."
        icon={Layers}
        actions={
          <Button variant="outline" size="sm" icon={Plus} onClick={addVariant}>
            Add Variant
          </Button>
        }
      >
        {variants.length === 0 ? (
          <p className="text-sm text-secondary">No variants — this item will use its base price.</p>
        ) : (
          <div className="space-y-2">
            {variants.map((v) => (
              <div key={v.id} className="flex items-center gap-2">
                <input
                  value={v.name}
                  onChange={(e) => updateVariant(v.id, { name: e.target.value })}
                  placeholder="Name"
                  className="flex-1 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  type="number"
                  value={v.price}
                  onChange={(e) => updateVariant(v.id, { price: Number(e.target.value) })}
                  className="w-24 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button onClick={() => removeVariant(v.id)} className="p-2 rounded-lg text-secondary hover:bg-error-container/40 hover:text-error transition-colors" aria-label="Remove variant">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Add-ons & Offer" description="Extras and active promotion for this item." icon={PlusCircle}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-2">Add-ons</label>
            <AddonAssignmentField allAddons={addons ?? []} selectedIds={form.addonIds ?? []} onChange={(ids) => set('addonIds', ids)} />
          </div>
          <SelectField label="Offer" value={form.activeOfferId ?? ''} onChange={(e) => set('activeOfferId', e.target.value || null)}>
            <option value="">No offer</option>
            {offers?.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </SelectField>
        </div>
      </SectionCard>

      <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-surface/95 backdrop-blur-md border-t border-outline-variant/20 flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/admin/menu/items')}>Cancel</Button>
        <Button variant="primary" loading={isSaving} onClick={handleSave}>
          {isNew ? 'Create Item' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
