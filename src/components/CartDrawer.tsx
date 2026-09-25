import { useEffect } from 'react';
import {
  type CartState,
  getCartLineItems,
  getCartSubtotal,
  getCartUniqueCount,
} from '../data/menuItems';
import { usePageContent } from '../context/usePageContent';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartState;
  onClose: () => void;
  onUpdateLineQty: (lineId: string, delta: number) => void;
  onRemoveLine: (lineId: string) => void;
  onRemoveAddon: (lineId: string, addonId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer = ({
  isOpen,
  cart,
  onClose,
  onUpdateLineQty,
  onRemoveLine,
  onRemoveAddon,
  onCheckout,
}: CartDrawerProps) => {
  const c = usePageContent('global');
  const lineItems = getCartLineItems(cart);
  const uniqueCount = getCartUniqueCount(cart);
  const subtotal = getCartSubtotal(cart);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label={c.text('cartBackdropAriaLabel')}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside className="cart-drawer-panel relative z-10 h-full w-full max-w-md bg-surface shadow-[-8px_0_40px_rgba(0,0,0,0.12)] border-l border-outline-variant/30 flex flex-col">
        <div className="flex items-center justify-between px-5 py-5 border-b border-outline-variant/20">
          <div>
            <span className="font-label-sm text-primary uppercase tracking-[0.2em] font-bold">{c.text('cartEyebrow')}</span>
            <h2 className="font-serif text-2xl text-on-surface font-semibold">
              {uniqueCount === 0
                ? c.text('cartEmptyTitle')
                : c.text(uniqueCount === 1 ? 'cartCountSingular' : 'cartCountPlural', { count: uniqueCount })}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
            aria-label={c.text('cartCloseAriaLabel')}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {lineItems.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center px-6">
              <span className="material-symbols-outlined text-4xl text-secondary mb-3">shopping_cart</span>
              <p className="font-serif text-xl text-on-surface font-semibold mb-1">{c.text('cartEmptyHeading')}</p>
              <p className="font-sans text-sm text-secondary">
                {c.text('cartEmptyBody')}
              </p>
            </div>
          ) : (
            lineItems.map((item) => (
              <div
                key={item.lineId}
                className="p-3 rounded-xl border border-outline-variant/25 bg-surface-container-lowest space-y-3"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-secondary">restaurant</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between gap-2 items-start">
                      <h3 className="font-serif text-sm font-semibold text-on-surface leading-snug line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="font-sans text-sm font-semibold text-primary whitespace-nowrap">
                          ${item.lineTotal.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveLine(item.lineId)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-secondary hover:text-error hover:bg-error/10 transition-colors"
                          aria-label={c.text('cartRemoveAriaLabel', { name: item.name })}
                          title={c.text('cartRemoveItemTitle')}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-secondary font-sans">
                        {c.text('cartUnitPrice', { price: `$${item.unitPrice.toFixed(2)}` })}
                      </span>
                      <div className="flex items-center bg-surface-container-high rounded-lg overflow-hidden border border-outline-variant/30">
                        <button
                          type="button"
                          onClick={() => onUpdateLineQty(item.lineId, -1)}
                          className="p-1.5 hover:bg-outline-variant/20 transition-colors"
                          aria-label={c.text('cartDecreaseAriaLabel', { name: item.name })}
                        >
                          <span className="material-symbols-outlined text-sm">remove</span>
                        </button>
                        <span className="px-2.5 font-bold text-sm min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateLineQty(item.lineId, 1)}
                          className="p-1.5 hover:bg-outline-variant/20 transition-colors"
                          aria-label={c.text('cartIncreaseAriaLabel', { name: item.name })}
                        >
                          <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {item.addons.length > 0 && (
                  <div className="pl-[76px] space-y-1.5">
                    <p className="font-label-sm text-[10px] uppercase tracking-widest text-secondary">
                      {c.text('cartAddonsHeading')}
                    </p>
                    {item.addons.map((addon) => (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between gap-2 text-xs text-secondary font-sans"
                      >
                        <span className="truncate min-w-0">+ {addon.name}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="whitespace-nowrap">${addon.price.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => onRemoveAddon(item.lineId, addon.id)}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:text-error hover:bg-error/10 transition-colors"
                            aria-label={c.text('cartRemoveAriaLabel', { name: addon.name })}
                            title={c.text('cartRemoveAddonTitle')}
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="border-t border-outline-variant/20 bg-surface-container-low p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-sans text-sm text-secondary">{c.text('cartSubtotalLabel')}</span>
            <span className="font-serif text-xl font-bold text-on-surface">${subtotal.toFixed(2)}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onCheckout();
            }}
            disabled={lineItems.length === 0}
            className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-sans text-sm font-bold tracking-wide hover:bg-primary-container transition-all active:scale-[0.98] shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>{c.text('cartCheckoutButton')}</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
