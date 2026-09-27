import { useCallback, useEffect, useRef, useState } from 'react';
import { FinixCardForm } from './FinixCardForm';
import { getPayment, retryPayment, submitCard, waitForPayment } from '../services/payments';
import type { CheckoutSession } from '../types';

/** Shared one-time checkout. Only server-verified payment AND fulfillment confirm a purchase. */
export function PaidCheckout({ initialSession, onSuccess }: { initialSession: CheckoutSession; onSuccess: (session: CheckoutSession) => void }) {
  const [session, setSession] = useState(initialSession);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const success = useRef(onSuccess);
  success.current = onSuccess;
  const notified = useRef(false);
  const observe = useCallback((next: CheckoutSession) => {
    setSession(next);
    if (next.status === 'succeeded' && next.fulfillmentStatus === 'completed' && !notified.current) {
      notified.current = true;
      success.current(next);
    } else if (next.fulfillmentStatus === 'action_required') {
      setError('Payment received, but confirmation needs staff assistance. Do not pay again.');
    } else if (next.status === 'failed') {
      setError(next.failure?.message ?? 'Your card was declined. You can retry with another card.');
    }
  }, []);
  useEffect(() => {
    if (!['pending', 'submitting', 'provider_unknown'].includes(session.status) && !(session.status === 'succeeded' && ['pending', 'processing'].includes(session.fulfillmentStatus))) return;
    let active = true;
    const timer = window.setInterval(() => {
      getPayment(session).then((next) => { if (active) observe(next); }).catch(() => {});
    }, 2000);
    return () => { active = false; window.clearInterval(timer); };
  }, [session, observe]);
  const onToken = useCallback(async (token: string) => {
    setBusy(true); setError(null);
    try {
      observe(await waitForPayment(await submitCard(session, token)));
    } catch (failure) {
      try { observe(await getPayment(session)); } catch { /* Preserve checkout; never invent success. */ }
      setError(failure instanceof Error ? failure.message : 'Payment failed.');
    } finally { setBusy(false); }
  }, [session, observe]);
  const retry = async () => {
    setBusy(true); setError(null);
    try { setSession(await retryPayment(session)); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to retry.'); }
    finally { setBusy(false); }
  };
  const onCardError = useCallback((message: string) => { setError(message); setBusy(false); }, []);
  return (
    <section className="rounded-2xl border border-outline-variant/30 bg-surface p-6 space-y-4" aria-label="Payment checkout">
      <h2 className="text-xl font-semibold">Complete your payment</h2>
      <p>Total due now: <strong>${(session.amountCents / 100).toFixed(2)} {session.currency}</strong></p>
      <p className="text-sm text-secondary">Your booking or membership is confirmed only after payment succeeds. This is a one-time payment, not automatic recurring billing.</p>
      {session.status === 'created' && <FinixCardForm key={session.id} amountCents={session.amountCents} disabled={busy} onToken={onToken} onError={onCardError} />}
      {session.status === 'failed' && <button type="button" disabled={busy} onClick={retry} className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold disabled:opacity-50">Retry with another card</button>}
      {['pending', 'submitting', 'provider_unknown'].includes(session.status) && <p role="status">Payment is processing. Please do not submit another payment.</p>}
      {error && <p role="alert" className="text-error">{error}</p>}
    </section>
  );
}
