import { useEffect, useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import {
  type CartState,
  getCartLineItems,
  getCartSubtotal,
} from '../data/menuItems';
import { useRestaurant } from '../context/RestaurantContext';
import { createOrder } from '../services/orders';
import type { OrderLineItem } from '../types';

const TAX_RATE = 0.085;
const DELIVERY_FEE = 15;

type ServiceType = 'delivery' | 'pickup';
type PaymentMethod = 'apple' | 'google' | 'card' | 'cash';
type SubmitState = 'idle' | 'verifying' | 'success';

interface OrderSummaryViewProps {
  cart: CartState;
  onClearCart: () => void;
  onUpdateLineQty: (lineId: string, delta: number) => void;
  onRemoveLine: (lineId: string) => void;
  onRemoveAddon: (lineId: string, addonId: string) => void;
  onUpdateLineNote: (lineId: string, note: string) => void;
  onNavigateLanding: () => void;
  onNavigateMenu: () => void;
  onNavigateReservations: () => void;
  onToast: (msg: string) => void;
  cartUniqueCount?: number;
  onOpenCart?: () => void;
}

/** Official Apple Pay mark treatment: Apple logo + Pay wordmark */
const ApplePayMark = () => (
  <span className="inline-flex items-center gap-0.5 text-on-surface" aria-hidden="true">
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
    <span
      className="text-[17px] font-semibold leading-none tracking-tight"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif' }}
    >
      Pay
    </span>
  </span>
);

/** Official Google Pay mark treatment: multicolor G + Pay wordmark */
const GooglePayMark = () => (
  <span className="inline-flex items-center gap-1.5" aria-hidden="true">
    <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
    <span
      className="text-[16px] font-medium leading-none tracking-tight text-[#3c4043]"
      style={{ fontFamily: 'Roboto, "Product Sans", Arial, sans-serif' }}
    >
      Pay
    </span>
  </span>
);

type PaymentOption = {
  value: PaymentMethod;
  label: string;
  icon?: string;
  mark?: 'apple' | 'google';
};

const PAYMENT_OPTIONS: PaymentOption[] = [
  { value: 'apple', label: 'Apple Pay', mark: 'apple' },
  { value: 'google', label: 'Google Pay', mark: 'google' },
  { value: 'card', label: 'Credit Card', icon: 'credit_card' },
  { value: 'cash', label: 'Cash', icon: 'account_balance_wallet' },
];

export const OrderSummaryView = ({
  cart,
  onClearCart,
  onUpdateLineQty,
  onRemoveLine,
  onRemoveAddon,
  onUpdateLineNote,
  onNavigateLanding,
  onNavigateMenu,
  onNavigateReservations,
  onToast,
  cartUniqueCount = 0,
  onOpenCart,
}: OrderSummaryViewProps) => {
  const [service, setService] = useState<ServiceType>('delivery');
  const [payment, setPayment] = useState<PaymentMethod>('apple');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const { restaurantId } = useRestaurant();

  const lineItems = getCartLineItems(cart);
  const subtotal = getCartSubtotal(cart);
  const taxes = subtotal * TAX_RATE;
  const deliveryFee = service === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + taxes + deliveryFee;

  useEffect(() => {
    if (lineItems.length === 0 && submitState === 'idle') {
      onNavigateMenu();
    }
  }, [lineItems.length, onNavigateMenu, submitState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitState !== 'idle') return;

    if (service === 'delivery' && !address.trim()) {
      onToast('Please enter a delivery address.');
      return;
    }

    setSubmitState('verifying');

    const orderItems: OrderLineItem[] = lineItems.map((item) => ({
      itemId: item.itemId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      addons: item.addons,
      note: item.note || undefined,
    }));

    try {
      await createOrder(restaurantId, {
        service,
        paymentMethod: payment,
        customerName: fullName,
        customerPhone: phone,
        customerEmail: email,
        address: service === 'delivery' ? address : undefined,
        instructions: instructions || undefined,
        items: orderItems,
        subtotal,
        taxes,
        deliveryFee,
        total,
      });

      setSubmitState('success');
      window.setTimeout(() => {
        onToast(
          `Order confirmed! Total $${total.toFixed(2)}. ${
            service === 'delivery' ? 'Preparing for delivery.' : 'Ready for pickup shortly.'
          }`
        );
        onClearCart();
        setSubmitState('idle');
        onNavigateMenu();
      }, 1200);
    } catch {
      setSubmitState('idle');
      onToast('Something went wrong placing your order. Please try again.');
    }
  };

  if (lineItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased flex flex-col font-sans">
      <Header
        currentPage="menu"
        onNavigateLanding={onNavigateLanding}
        onNavigateMenu={onNavigateMenu}
        onNavigateReservations={onNavigateReservations}
        onToast={onToast}
        cartUniqueCount={cartUniqueCount}
        onOpenCart={onOpenCart}
      />

      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop pt-28 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Order Summary */}
          <section className="lg:col-span-5 space-y-6 lg:space-y-8">
            <div>
              <button
                type="button"
                onClick={onNavigateMenu}
                className="mb-4 text-secondary hover:text-primary font-body-md text-sm flex items-center gap-1.5 transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Menu
              </button>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-on-surface mb-2 tracking-tight">
                Order Summary
              </h1>
              <p className="font-body-md text-body-md text-secondary">
                Review your selection of Lumière&apos;s finest offerings.
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="p-5 md:p-6 space-y-5 md:space-y-6">
                {lineItems.map((item, index) => (
                  <div key={item.lineId}>
                    {index > 0 && <hr className="border-surface-container-high mb-5 md:mb-6" />}
                    <div className="flex gap-3 md:gap-4 group">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-high">
                        {item.image ? (
                          <img
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            src={item.image}
                            alt={item.name}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-secondary">restaurant</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0 space-y-3">
                        <div className="flex justify-between items-start gap-3">
                          <h3 className="font-serif text-base md:text-lg text-on-surface font-semibold leading-snug">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="font-body-md text-on-surface whitespace-nowrap">
                              ${item.lineTotal.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => onRemoveLine(item.lineId)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:text-error hover:bg-error/10 transition-colors"
                              aria-label={`Remove ${item.name}`}
                              title="Remove item"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-secondary font-sans">
                            ${item.unitPrice.toFixed(2)} each
                          </span>
                          <div className="flex items-center bg-surface-container-high rounded-lg overflow-hidden border border-outline-variant/30">
                            <button
                              type="button"
                              onClick={() => onUpdateLineQty(item.lineId, -1)}
                              className="p-1.5 hover:bg-outline-variant/20 transition-colors"
                              aria-label={`Decrease ${item.name}`}
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
                              aria-label={`Increase ${item.name}`}
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                          </div>
                        </div>

                        {item.addons.length > 0 && (
                          <ul className="space-y-1.5">
                            {item.addons.map((addon) => (
                              <li
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
                                    aria-label={`Remove ${addon.name}`}
                                    title="Remove add-on"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="space-y-1.5">
                          <label
                            htmlFor={`item-note-${item.lineId}`}
                            className="font-label-sm text-[10px] uppercase tracking-widest text-secondary block"
                          >
                            Item note
                          </label>
                          <textarea
                            id={`item-note-${item.lineId}`}
                            className="w-full bg-surface border border-outline-variant/40 rounded-lg px-3 py-2 font-body-md text-sm text-on-surface form-input-focus resize-none"
                            placeholder="e.g. no onions, extra spicy..."
                            rows={2}
                            value={item.note}
                            onChange={(e) => onUpdateLineNote(item.lineId, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-surface-container-low p-5 md:p-6 space-y-3">
                <div className="flex justify-between text-secondary font-body-md text-sm md:text-base">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-secondary font-body-md text-sm md:text-base">
                  <span>Taxes (8.5%)</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                {service === 'delivery' && (
                  <div className="flex justify-between text-secondary font-body-md text-sm md:text-base">
                    <span>Delivery Fee</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-outline-variant/30 flex justify-between items-center">
                  <span className="font-serif text-lg md:text-xl text-on-surface font-semibold">Total</span>
                  <span className="font-serif text-lg md:text-xl text-primary font-bold">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <button
                type="button"
                onClick={onNavigateMenu}
                className="text-primary hover:text-tertiary-container font-body-md flex items-center gap-2 transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add More Items
              </button>
              <span className="hidden sm:inline text-outline-variant">·</span>
              <button
                type="button"
                onClick={onNavigateMenu}
                className="text-secondary hover:text-primary font-body-md flex items-center gap-2 transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-sm">restaurant_menu</span>
                Back to Menu
              </button>
            </div>
          </section>

          {/* Right: Checkout Form */}
          <section className="lg:col-span-7">
            <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 md:p-8 border border-outline-variant/30 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
              <h2 className="font-serif text-xl md:text-2xl text-on-surface mb-6 md:mb-8 font-semibold">
                Personal Details
              </h2>

              <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-2">
                    <label className="font-label-sm text-secondary uppercase tracking-widest block">
                      Full Name
                    </label>
                    <input
                      className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface form-input-focus"
                      placeholder="Julian Vane"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-sm text-secondary uppercase tracking-widest block">
                      Phone Number
                    </label>
                    <input
                      className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface form-input-focus"
                      placeholder="+44 20 7123 4567"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-label-sm text-secondary uppercase tracking-widest block">
                      Email Address
                    </label>
                    <input
                      className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface form-input-focus"
                      placeholder="julian.v@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Service Preference */}
                <div className="space-y-4">
                  <label className="font-label-sm text-secondary uppercase tracking-widest block">
                    Service Preference
                  </label>
                  <div className="flex p-1 bg-surface-container-high rounded-2xl w-full max-w-sm">
                    <button
                      type="button"
                      onClick={() => setService('delivery')}
                      className={`flex-1 py-3 px-4 sm:px-6 rounded-xl font-body-md text-sm transition-all duration-300 ${
                        service === 'delivery'
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-secondary hover:text-on-surface'
                      }`}
                    >
                      Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setService('pickup')}
                      className={`flex-1 py-3 px-4 sm:px-6 rounded-xl font-body-md text-sm transition-all duration-300 ${
                        service === 'pickup'
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-secondary hover:text-on-surface'
                      }`}
                    >
                      Pickup
                    </button>
                  </div>
                </div>

                {service === 'delivery' && (
                  <div className="space-y-2 animate-fadeIn">
                    <label className="font-label-sm text-secondary uppercase tracking-widest block">
                      Delivery Address
                    </label>
                    <input
                      className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface form-input-focus"
                      placeholder="14 Mayfair Square, London, W1J 8AJ"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="font-label-sm text-secondary uppercase tracking-widest block">
                    Special Instructions
                  </label>
                  <textarea
                    className="w-full bg-surface border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-on-surface form-input-focus resize-none"
                    placeholder="Dietary restrictions or delivery notes..."
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <label className="font-label-sm text-secondary uppercase tracking-widest block">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {PAYMENT_OPTIONS.map((option) => (
                      <label key={option.value} className="relative cursor-pointer group">
                        <input
                          className="peer sr-only"
                          name="payment"
                          type="radio"
                          value={option.value}
                          checked={payment === option.value}
                          onChange={() => setPayment(option.value)}
                        />
                        <div className="payment-card flex flex-col items-center justify-center gap-2 p-3 md:p-4 min-h-[88px] rounded-xl border border-outline-variant/30 bg-surface peer-checked:border-primary peer-checked:bg-primary-fixed/10 transition-all duration-200">
                          {option.mark === 'apple' && <ApplePayMark />}
                          {option.mark === 'google' && <GooglePayMark />}
                          {option.icon && (
                            <span className="material-symbols-outlined text-on-surface text-[28px]">
                              {option.icon}
                            </span>
                          )}
                          {option.mark ? (
                            <span className="sr-only">{option.label}</span>
                          ) : (
                            <span className="font-label-sm text-on-surface text-[10px] text-center">
                              {option.label}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-2 md:pt-4">
                  <button
                    className={`w-full py-4 md:py-5 rounded-2xl font-serif text-lg md:text-xl tracking-wide transition-all duration-300 transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${
                      submitState === 'success'
                        ? 'bg-green-600 text-white'
                        : 'bg-[#1A1A1A] text-white hover:bg-on-surface-variant'
                    }`}
                    type="submit"
                    disabled={submitState !== 'idle'}
                  >
                    {submitState === 'verifying' && (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Verifying...
                      </>
                    )}
                    {submitState === 'success' && (
                      <>
                        Success
                        <span className="material-symbols-outlined">check_circle</span>
                      </>
                    )}
                    {submitState === 'idle' && 'Proceed to Checkout'}
                  </button>
                  <p className="text-center text-secondary text-sm mt-5 md:mt-6 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Your transaction is secure and encrypted.
                  </p>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      <Footer
        onNavigateLanding={onNavigateLanding}
        onNavigateMenu={onNavigateMenu}
        onNavigateReservations={onNavigateReservations}
        onToast={onToast}
      />
    </div>
  );
};
