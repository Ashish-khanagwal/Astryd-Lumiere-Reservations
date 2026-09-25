import { useEffect, useState } from 'react';
import {
  ADDON_CATEGORIES,
  ALL_ADDON_OPTIONS,
  type MenuItem,
} from '../data/menuItems';
import { usePageContent } from '../context/usePageContent';

interface ItemCustomizeModalProps {
  item: MenuItem;
  onClose: () => void;
  onConfirm: (payload: { quantity: number; addonIds: string[] }) => void;
}

export const ItemCustomizeModal = ({ item, onClose, onConfirm }: ItemCustomizeModalProps) => {
  const c = usePageContent('global');
  const [quantity, setQuantity] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const toggleOption = (categoryId: string, optionId: string, selection: 'single' | 'multiple') => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const category = ADDON_CATEGORIES.find((c) => c.id === categoryId);
      if (!category) return prev;

      if (selection === 'single') {
        category.options.forEach((opt) => next.delete(opt.id));
        if (!prev.has(optionId)) next.add(optionId);
        return next;
      }

      if (next.has(optionId)) next.delete(optionId);
      else next.add(optionId);
      return next;
    });
  };

  const selectedAddons = ALL_ADDON_OPTIONS.filter((opt) => selectedIds.has(opt.id));
  const addonsTotal = selectedAddons.reduce((sum, opt) => sum + opt.price, 0);
  const grandTotal = (item.price + addonsTotal) * quantity;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label={c.text('optionsBackdropAriaLabel')}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-2xl shadow-2xl border border-outline-variant/20 flex flex-col max-h-[92vh] animate-slideUp">
        <div className="relative h-44 sm:h-52 shrink-0 overflow-hidden rounded-t-3xl sm:rounded-t-2xl bg-surface-container-high">
          <img
            src={item.image}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/55 transition-colors"
            aria-label={c.text('optionsCloseAriaLabel')}
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
          <div className="absolute bottom-4 left-4 right-14 text-white">
            <h2 className="font-serif text-2xl font-semibold leading-tight">{item.name}</h2>
            <p className="font-sans text-sm text-white/80 mt-1">${item.price.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          <p className="font-sans text-sm text-secondary leading-relaxed">{item.description}</p>

          {ADDON_CATEGORIES.map((category) => (
            <section key={category.id} className="space-y-3">
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-serif text-lg font-semibold text-on-surface">{category.name}</h3>
                  <span className="font-label-sm text-[10px] uppercase tracking-widest text-secondary">
                    {category.selection === 'single' ? c.text('optionsChooseOne') : c.text('optionsOptional')}
                  </span>
                </div>
                {category.subtitle && (
                  <p className="font-sans text-xs text-secondary mt-0.5">{category.subtitle}</p>
                )}
              </div>

              <div className="space-y-2">
                {category.options.map((option) => {
                  const checked = selectedIds.has(option.id);
                  return (
                    <label
                      key={option.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        checked
                          ? 'border-primary bg-primary-fixed/15'
                          : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40'
                      }`}
                    >
                      <input
                        type={category.selection === 'single' ? 'radio' : 'checkbox'}
                        name={category.id}
                        className="mt-1 accent-[#785600]"
                        checked={checked}
                        onChange={() => toggleOption(category.id, option.id, category.selection)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-3">
                          <span className="font-sans text-sm font-semibold text-on-surface">{option.name}</span>
                          <span className="font-sans text-sm font-semibold text-primary whitespace-nowrap">
                            +${option.price.toFixed(2)}
                          </span>
                        </div>
                        {option.description && (
                          <p className="font-sans text-xs text-secondary mt-0.5 leading-relaxed">
                            {option.description}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="border-t border-outline-variant/20 bg-surface-container-low p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center bg-surface rounded-xl overflow-hidden border border-outline-variant/30">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2.5 hover:bg-outline-variant/20 transition-colors"
                aria-label={c.text('optionsDecreaseAriaLabel')}
              >
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>
              <span className="px-4 font-bold text-sm min-w-[36px] text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2.5 hover:bg-outline-variant/20 transition-colors"
                aria-label={c.text('optionsIncreaseAriaLabel')}
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            <div className="text-right">
              <div className="font-label-sm text-[10px] uppercase tracking-widest text-secondary">{c.text('optionsTotalLabel')}</div>
              <div className="font-serif text-xl font-bold text-primary">${grandTotal.toFixed(2)}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onConfirm({ quantity, addonIds: Array.from(selectedIds) })}
            className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-sans text-sm font-bold tracking-wide hover:bg-primary-container transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
          >
            <span>{c.text('optionsAddButton')}</span>
            <span className="opacity-80">·</span>
            <span>${grandTotal.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
