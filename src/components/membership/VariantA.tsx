import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createMember } from '../../services/membership';
import { useRestaurant } from '../../context/RestaurantContext';
import { usePublicData } from '../../context/PublicDataContext';
import { usePageContent } from '../../context/usePageContent';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { formatCents } from './shared';
import type { MembershipPlan } from '../../types';

export interface MembershipViewProps {
  onNavigateLanding: () => void;
  onNavigateMenu: () => void;
  onNavigateReservations: () => void;
  onToast: (msg: string) => void;
  cartUniqueCount?: number;
  onOpenCart?: () => void;
}

/** Variant A - "Loyalty/Rewards" (Multi-Vertical Platform Plan §8.4); light-touch, suits a Restaurant but any Site can pick it. */
export const MembershipVariantA = ({ onNavigateLanding, onNavigateMenu, onNavigateReservations, onToast, cartUniqueCount = 0, onOpenCart }: MembershipViewProps) => {
  const { restaurantId } = useRestaurant();
  const { membershipPlans } = usePublicData();
  const c = usePageContent('membership');
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    if (!selectedPlan || !fullName.trim() || !email.trim()) return;
    setIsSubmitting(true);
    try {
      await createMember(restaurantId, {
        planId: selectedPlan.id,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        startDate: new Date().toISOString().slice(0, 10),
      });
      setJoined(true);
      onToast(c.text('a_joinSuccessToast'));
    } catch (error: unknown) {
      onToast(error instanceof Error ? error.message : c.text('a_joinErrorToast'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      <Header currentPage="membership" onNavigateLanding={onNavigateLanding} onNavigateMenu={onNavigateMenu} onNavigateReservations={onNavigateReservations} onToast={onToast} cartUniqueCount={cartUniqueCount} onOpenCart={onOpenCart} />

      <main className="flex-grow pt-28 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full max-w-4xl">
        <div className="text-center mb-12">
          <span className="text-primary uppercase tracking-[0.2em] font-bold text-xs">{c.text('a_eyebrow')}</span>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold mt-2">{c.text('a_heading')}</h1>
          <p className="text-secondary mt-3 max-w-xl mx-auto">{c.text('a_subheading')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-14">
          {c.list('a_steps').map((s) => (
            <div key={s.id} className="bg-surface p-6 rounded-2xl border border-outline-variant/20">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-3">{s.number}</div>
              <h3 className="font-semibold mb-1">{s.title}</h3>
              <p className="text-sm text-secondary">{s.description}</p>
            </div>
          ))}
        </div>

        {joined ? (
          <div className="bg-surface rounded-2xl border border-outline-variant/20 p-10 text-center">
            <h2 className="font-serif text-2xl font-semibold mb-2">{c.text('a_successHeading')}</h2>
            <p className="text-secondary">{c.text('a_successMessage', { email })}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {membershipPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`text-left p-6 rounded-2xl border transition-all ${
                  selectedPlan?.id === plan.id ? 'border-2 border-primary bg-primary/5' : 'border-outline-variant/20 bg-surface hover:border-primary/40'
                }`}
              >
                <h3 className="font-serif text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-primary font-bold text-lg mb-2">
                  {formatCents(plan.priceCents)}
                  {plan.billingInterval !== 'one_time' && <span className="text-xs text-secondary font-normal"> / {plan.billingInterval.replace('ly', '')}</span>}
                </p>
                <p className="text-sm text-secondary mb-3">{plan.description}</p>
                <ul className="text-sm space-y-1">
                  {plan.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="text-primary">✓</span> {b}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        )}

        {selectedPlan && !joined && (
          <div className="mt-8 bg-surface p-6 rounded-2xl border border-outline-variant/20 max-w-md mx-auto space-y-3">
            <h3 className="font-semibold">{c.text('joinFormHeading', { plan: selectedPlan.name })}</h3>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={c.text('namePlaceholder')} className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={c.text('emailPlaceholder')} className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder={c.text('phonePlaceholder')} className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
            <button
              disabled={!fullName.trim() || !email.trim() || isSubmitting}
              onClick={handleJoin}
              className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold text-sm uppercase tracking-wide disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {c.text('a_joinButton')}
            </button>
          </div>
        )}
      </main>

      <Footer onNavigateLanding={onNavigateLanding} onNavigateMenu={onNavigateMenu} onNavigateReservations={onNavigateReservations} onToast={onToast} />
    </div>
  );
};
