import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { createMember, findMemberByEmail } from '../../services/membership';
import { useRestaurant } from '../../context/RestaurantContext';
import { usePublicData } from '../../context/PublicDataContext';
import { usePageContent } from '../../context/usePageContent';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { formatCents } from './shared';
import type { Member, MembershipPlan } from '../../types';
import type { MembershipViewProps } from './VariantA';

/** Variant C - "VIP/Store Credit Club" (Multi-Vertical Platform Plan §8.4); suits Retail - subscription-box style tiers instead of a plain pricing table. */
export const MembershipVariantC = ({ onNavigateLanding, onNavigateMenu, onNavigateReservations, onToast, cartUniqueCount = 0, onOpenCart }: MembershipViewProps) => {
  const { restaurantId } = useRestaurant();
  const { membershipPlans } = usePublicData();
  const c = usePageContent('membership');
  const [joiningPlan, setJoiningPlan] = useState<MembershipPlan | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);

  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupResult, setLookupResult] = useState<Member | null | 'not_found'>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const handleJoin = async () => {
    if (!joiningPlan || !fullName.trim() || !email.trim()) return;
    setIsSubmitting(true);
    try {
      await createMember(restaurantId, {
        planId: joiningPlan.id,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        startDate: new Date().toISOString().slice(0, 10),
      });
      setJoined(true);
      onToast(c.text('c_joinSuccessToast'));
    } catch (error: unknown) {
      onToast(error instanceof Error ? error.message : c.text('c_joinErrorToast'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async () => {
    if (!lookupEmail.trim()) return;
    setIsLookingUp(true);
    try {
      const member = await findMemberByEmail(restaurantId, lookupEmail);
      setLookupResult(member ?? 'not_found');
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      <Header currentPage="membership" onNavigateLanding={onNavigateLanding} onNavigateMenu={onNavigateMenu} onNavigateReservations={onNavigateReservations} onToast={onToast} cartUniqueCount={cartUniqueCount} onOpenCart={onOpenCart} />

      <main className="flex-grow pt-28 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 text-primary uppercase tracking-[0.2em] font-bold text-xs">
            <Sparkles className="h-3.5 w-3.5" /> {c.text('c_eyebrow')}
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold mt-2">{c.text('c_heading')}</h1>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 mb-16 snap-x">
          {membershipPlans.map((plan) => (
            <div
              key={plan.id}
              className="snap-start shrink-0 w-72 rounded-3xl border border-outline-variant/20 bg-surface overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="h-24 bg-gradient-to-br from-primary to-primary-container flex items-center justify-center relative">
                <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/90 text-primary text-[10px] font-bold uppercase">{c.text('c_badge')}</span>
                <h3 className="font-serif text-2xl font-bold text-on-primary">{plan.name}</h3>
              </div>
              <div className="p-6">
                <p className="text-2xl font-bold mb-1">
                  {formatCents(plan.priceCents)}
                  {plan.billingInterval !== 'one_time' && <span className="text-xs text-secondary font-normal"> /{plan.billingInterval.replace('ly', '')}</span>}
                </p>
                <p className="text-sm text-secondary mb-4">{plan.description}</p>
                <div className="text-[11px] font-bold uppercase tracking-wide text-secondary mb-2">{c.text('c_perksHeading')}</div>
                <ul className="space-y-1.5 text-sm mb-5">
                  {plan.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="text-primary">◆</span> {b}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { setJoiningPlan(plan); setJoined(false); }}
                  className="w-full py-2.5 rounded-xl bg-on-surface text-on-primary font-bold text-sm uppercase tracking-wide hover:bg-primary transition-colors"
                >
                  {c.text('c_planButton')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {joiningPlan && (
          <div className="max-w-md mx-auto mb-16 bg-surface p-6 rounded-2xl border border-outline-variant/20">
            {joined ? (
              <div className="text-center">
                <h3 className="font-serif text-xl font-semibold mb-1">{c.text('c_successHeading')}</h3>
                <p className="text-sm text-secondary">{c.text('c_successMessage', { email })}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-semibold">{c.text('joinFormHeading', { plan: joiningPlan.name })}</h3>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={c.text('namePlaceholder')} className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={c.text('emailPlaceholder')} className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder={c.text('phonePlaceholder')} className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
                <button
                  disabled={!fullName.trim() || !email.trim() || isSubmitting}
                  onClick={handleJoin}
                  className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold text-sm uppercase tracking-wide disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {c.text('c_confirmButton')}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="max-w-md mx-auto bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20 text-center">
          <h3 className="font-semibold mb-3">{c.text('c_lookupHeading')}</h3>
          <div className="flex gap-2">
            <input value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} type="email" placeholder={c.text('lookupEmailPlaceholder')} className="flex-1 px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
            <button onClick={handleLookup} disabled={isLookingUp || !lookupEmail.trim()} className="px-4 py-2.5 rounded-xl bg-on-surface text-on-primary text-sm font-bold disabled:opacity-50">
              {isLookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : c.text('c_lookupButton')}
            </button>
          </div>
          {lookupResult === 'not_found' && <p className="text-sm text-secondary mt-3">{c.text('lookupNotFound')}</p>}
          {lookupResult && lookupResult !== 'not_found' && (
            <div className="mt-4 pt-4 border-t border-outline-variant/20">
              <p className="text-sm font-semibold capitalize">{c.text('c_statusLine', { status: lookupResult.status })}</p>
              <p className="text-xs text-secondary">{c.text('c_memberSince', { date: new Date(lookupResult.startDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) })}</p>
            </div>
          )}
        </div>
      </main>

      <Footer onNavigateLanding={onNavigateLanding} onNavigateMenu={onNavigateMenu} onNavigateReservations={onNavigateReservations} onToast={onToast} />
    </div>
  );
};
