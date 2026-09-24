import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getPublicAvailability, createPublicReservation } from '../../services/reservations';
import { useRestaurant } from '../../context/RestaurantContext';
import { Header } from '../Header';
import { Footer } from '../Footer';
import type { PublicAvailability, PublicReservationConfirmation } from '../../types';
import type { BookingViewProps } from './VariantA';

const SERVICE_OPTIONS = ['Personal Styling', 'Fitting Consultation', 'Product Demo', 'General Inquiry'];

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Variant C - "Appointment Booking" (Multi-Vertical Platform Plan §8.3); suits Retail - a service picker + duration slot picker instead of Variant A's table-reservation flow. Books directly (no deposit). */
export const BookingVariantC = ({ onNavigateLanding, onNavigateMenu, onToast, cartUniqueCount = 0, onOpenCart }: BookingViewProps) => {
  const { restaurantId } = useRestaurant();
  const [service, setService] = useState(SERVICE_OPTIONS[0]);
  const [dateInput, setDateInput] = useState(() => toIsoDate(new Date()));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availability, setAvailability] = useState<PublicAvailability['slots']>({ afternoon: [], evening: [] });
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<PublicReservationConfirmation | null>(null);

  const allSlots = [...availability.afternoon, ...availability.evening];

  useEffect(() => {
    if (!dateInput) return;
    let active = true;
    setIsLoadingSlots(true);
    setSelectedTimeSlot(null);
    getPublicAvailability(restaurantId, dateInput, 1)
      .then((result) => {
        if (active) setAvailability(result.slots);
      })
      .catch(() => {
        if (active) setAvailability({ afternoon: [], evening: [] });
      })
      .finally(() => {
        if (active) setIsLoadingSlots(false);
      });
    return () => {
      active = false;
    };
  }, [restaurantId, dateInput]);

  const handleSubmit = async () => {
    if (!selectedTimeSlot || !fullName.trim() || !email.trim()) return;
    setIsSubmitting(true);
    try {
      const result = await createPublicReservation(restaurantId, {
        date: dateInput,
        timeSlot: selectedTimeSlot,
        partySize: 1,
        seatingPreference: service,
        guestName: fullName,
        guestEmail: email,
        guestPhone: phone,
        specialRequests: notes,
        newsletterOptIn: false,
      });
      setConfirmation(result);
      onToast(`Appointment booked! Code: ${result.confirmationCode}`);
    } catch (error: unknown) {
      onToast(error instanceof Error ? error.message : 'Unable to book this appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
        <Header currentPage="reservations" onNavigateLanding={onNavigateLanding} onNavigateMenu={onNavigateMenu} onNavigateReservations={() => {}} onToast={onToast} cartUniqueCount={cartUniqueCount} onOpenCart={onOpenCart} />
        <main className="flex-grow flex flex-col items-center justify-center pt-28 pb-24 px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-primary filled">check_circle</span>
          </div>
          <h2 className="font-serif text-3xl font-semibold mb-2">Appointment confirmed</h2>
          <p className="text-secondary max-w-md mb-1">
            {confirmation.seatingPreference} · {confirmation.timeDisplay} on {new Date(confirmation.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <p className="text-secondary text-sm mb-8">Confirmation code: <span className="font-bold text-on-surface">{confirmation.confirmationCode}</span></p>
          <button onClick={onNavigateLanding} className="px-8 py-3.5 bg-primary text-on-primary rounded-full font-semibold text-sm uppercase tracking-wide">
            Back to website
          </button>
        </main>
        <Footer onNavigateLanding={onNavigateLanding} onNavigateMenu={onNavigateMenu} onNavigateReservations={() => {}} onToast={onToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      <Header currentPage="reservations" onNavigateLanding={onNavigateLanding} onNavigateMenu={onNavigateMenu} onNavigateReservations={() => {}} onToast={onToast} cartUniqueCount={cartUniqueCount} onOpenCart={onOpenCart} />

      <main className="flex-grow pt-28 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full max-w-3xl">
        <div className="mb-8">
          <span className="text-primary uppercase tracking-[0.2em] font-bold text-xs">Book an Appointment</span>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold mt-1">Choose a service</h1>
        </div>

        <section className="bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm mb-6">
          <h3 className="font-semibold mb-4">Service</h3>
          <div className="grid grid-cols-2 gap-3">
            {SERVICE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setService(opt)}
                className={`p-4 rounded-xl text-left text-sm font-semibold border transition-all ${
                  service === opt ? 'border-2 border-primary bg-primary/10 text-primary' : 'border-outline-variant/30 hover:border-primary/50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm mb-6">
          <h3 className="font-semibold mb-4">Date & time</h3>
          <input
            type="date"
            value={dateInput}
            min={toIsoDate(new Date())}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary mb-4"
          />

          {isLoadingSlots ? (
            <div className="flex items-center gap-2 text-sm text-secondary py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading available times…
            </div>
          ) : allSlots.length === 0 ? (
            <p className="text-sm text-secondary py-4">No availability on this date.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {allSlots.map((slot) => (
                <button
                  key={slot.time24}
                  disabled={!slot.available}
                  onClick={() => setSelectedTimeSlot(slot.time24)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                    !slot.available
                      ? 'bg-surface-container text-secondary/40 cursor-not-allowed'
                      : selectedTimeSlot === slot.time24
                        ? 'bg-primary text-on-primary font-bold'
                        : 'border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm space-y-3">
          <h3 className="font-semibold mb-1">Your details</h3>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
          <div className="grid grid-cols-2 gap-3">
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Phone" className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know?" rows={3} className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary resize-none" />
          <button
            disabled={!selectedTimeSlot || !fullName.trim() || !email.trim() || isSubmitting}
            onClick={handleSubmit}
            className="w-full py-3.5 bg-on-surface text-on-primary rounded-xl font-bold text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Confirm appointment
          </button>
        </section>
      </main>

      <Footer onNavigateLanding={onNavigateLanding} onNavigateMenu={onNavigateMenu} onNavigateReservations={() => {}} onToast={onToast} />
    </div>
  );
};
