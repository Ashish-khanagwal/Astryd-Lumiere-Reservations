import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { createMember, findMemberByEmail, getMemberCheckIns } from '../../services/membership';
import { useRestaurant } from '../../context/RestaurantContext';
import { usePublicData } from '../../context/PublicDataContext';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { formatCents } from './shared';
import type { Member, MemberCheckIn, MembershipPlan } from '../../types';
import type { MembershipViewProps } from './VariantA';

/** Variant B - "Plan Tiers + Check-in" (Multi-Vertical Platform Plan §8.4); suits a Gym - a pricing-table comparison plus a member's own check-in history. */
export const MembershipVariantB = ({ onNavigateLanding, onNavigateMenu, onNavigateReservations, onToast, cartUniqueCount = 0, onOpenCart }: MembershipViewProps) => {
  const { restaurantId } = useRestaurant();
  const { membershipPlans } = usePublicData();
  const [joiningPlan, setJoiningPlan] = useState<MembershipPlan | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);

  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupResult, setLookupResult] = useState<Member | null | 'not_found'>(null);
  const [lookupCheckIns, setLookupCheckIns] = useState<MemberCheckIn[]>([]);
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
      onToast('Membership activated!');
    } catch (error: unknown) {
      onToast(error instanceof Error ? error.message : 'Unable to activate membership right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookup = async () => {
    if (!lookupEmail.trim()) return;
    setIsLookingUp(true);
    try {
      const member = await findMemberByEmail(restaurantId, lookupEmail);
      if (!member) {
        setLookupResult('not_found');
        setLookupCheckIns([]);
        return;
      }
      setLookupResult(member);
      setLookupCheckIns(await getMemberCheckIns(restaurantId, member.id));
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      <Header currentPage="membership" onNavigateLanding={onNavigateLanding} onNavigateMenu={onNavigateMenu} onNavigateReservations={onNavigateReservations} onToast={onToast} cartUniqueCount={cartUniqueCount} onOpenCart={onOpenCart} />

      <main className="flex-grow pt-28 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-primary uppercase tracking-[0.2em] font-bold text-xs">Membership</span>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold mt-2">Choose your plan</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {membershipPlans.map((plan, idx) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 flex flex-col ${idx === 1 ? 'border-2 border-primary bg-primary/5 shadow-lg md:-translate-y-2' : 'border-outline-variant/20 bg-surface'}`}
            >
              {idx === 1 && <span className="self-start mb-3 px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase">Most Popular</span>}
              <h3 className="font-serif text-2xl font-bold">{plan.name}</h3>
              <p className="mt-1 mb-4">
                <span className="text-3xl font-bold text-primary">{formatCents(plan.priceCents)}</span>
                {plan.billingInterval !== 'one_time' && <span className="text-sm text-secondary"> /{plan.billingInterval.replace('ly', '')}</span>}
              </p>
              <p className="text-sm text-secondary mb-4">{plan.description}</p>
              <ul className="space-y-2 text-sm mb-6 flex-1">
                {plan.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setJoiningPlan(plan); setJoined(false); }}
                className={`w-full py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-colors ${
                  idx === 1 ? 'bg-primary text-on-primary hover:bg-primary-container' : 'bg-on-surface text-on-primary hover:bg-primary'
                }`}
              >
                Join
              </button>
            </div>
          ))}
        </div>

        {joiningPlan && (
          <div className="max-w-md mx-auto mb-16 bg-surface p-6 rounded-2xl border border-outline-variant/20">
            {joined ? (
              <div className="text-center">
                <h3 className="font-serif text-xl font-semibold mb-1">Welcome aboard!</h3>
                <p className="text-sm text-secondary">A confirmation has been sent to {email}.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-semibold">Join {joiningPlan.name}</h3>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Phone" className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
                <button
                  disabled={!fullName.trim() || !email.trim() || isSubmitting}
                  onClick={handleJoin}
                  className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold text-sm uppercase tracking-wide disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Confirm
                </button>
              </div>
            )}
          </div>
        )}

        <div className="max-w-md mx-auto bg-surface-container-low p-6 rounded-2xl border border-outline-variant/20">
          <h3 className="font-semibold mb-3">Already a member? Check your visits</h3>
          <div className="flex gap-2">
            <input value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} type="email" placeholder="Your email" className="flex-1 px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
            <button onClick={handleLookup} disabled={isLookingUp || !lookupEmail.trim()} className="px-4 py-2.5 rounded-xl bg-on-surface text-on-primary text-sm font-bold disabled:opacity-50">
              {isLookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Look up'}
            </button>
          </div>
          {lookupResult === 'not_found' && <p className="text-sm text-secondary mt-3">No membership found for that email.</p>}
          {lookupResult && lookupResult !== 'not_found' && (
            <div className="mt-4 pt-4 border-t border-outline-variant/20">
              <p className="text-sm font-semibold">{lookupResult.customerName} · {lookupResult.status}</p>
              <p className="text-xs text-secondary mb-2">{lookupCheckIns.length} check-in{lookupCheckIns.length === 1 ? '' : 's'}</p>
              <div className="space-y-1 max-h-32 overflow-y-auto text-xs text-secondary">
                {lookupCheckIns.map((c) => (
                  <div key={c.id}>{new Date(c.checkedInAt).toLocaleString()}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer onNavigateLanding={onNavigateLanding} onNavigateMenu={onNavigateMenu} onNavigateReservations={onNavigateReservations} onToast={onToast} />
    </div>
  );
};
