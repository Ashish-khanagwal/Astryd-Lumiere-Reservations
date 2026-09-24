import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getPublicAvailability, createPublicReservation } from '../../services/reservations';
import { useRestaurant } from '../../context/RestaurantContext';
import { Header } from '../Header';
import { Footer } from '../Footer';
import type { PublicAvailability, PublicReservationConfirmation } from '../../types';
import type { BookingViewProps } from './VariantA';

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function nextSevenDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

/** Variant B - "Class/Session Booking" (Multi-Vertical Platform Plan §8.3); suits a Gym - a weekly timetable strip instead of Variant A's full calendar + multi-step wizard. Books directly (no deposit), same as a typical class booking flow. */
export const BookingVariantB = ({ onNavigateLanding, onNavigateMenu, onToast, cartUniqueCount = 0, onOpenCart }: BookingViewProps) => {
  const { restaurantId } = useRestaurant();
  const days = useMemo(() => nextSevenDays(), []);
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [spots, setSpots] = useState(1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availability, setAvailability] = useState<PublicAvailability['slots']>({ afternoon: [], evening: [] });
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<PublicReservationConfirmation | null>(null);

  const selectedDateIso = toIsoDate(selectedDay);
  const allSlots = [...availability.afternoon, ...availability.evening];

  useEffect(() => {
    let active = true;
    setIsLoadingSlots(true);
    setSelectedTimeSlot(null);
    getPublicAvailability(restaurantId, selectedDateIso, spots)
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
  }, [restaurantId, selectedDateIso, spots]);

  const handleSubmit = async () => {
    if (!selectedTimeSlot || !fullName.trim() || !email.trim()) return;
    setIsSubmitting(true);
    try {
      const result = await createPublicReservation(restaurantId, {
        date: selectedDateIso,
        timeSlot: selectedTimeSlot,
        partySize: spots,
        seatingPreference: 'Class',
        guestName: fullName,
        guestEmail: email,
        guestPhone: phone,
        specialRequests: '',
        newsletterOptIn: false,
      });
      setConfirmation(result);
      onToast(`Session booked! Code: ${result.confirmationCode}`);
    } catch (error: unknown) {
      onToast(error instanceof Error ? error.message : 'Unable to book this session. Please try again.');
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
          <h2 className="font-serif text-3xl font-semibold mb-2">You're booked in!</h2>
          <p className="text-secondary max-w-md mb-1">
            {confirmation.timeDisplay} on {new Date(confirmation.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
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

      <main className="flex-grow pt-28 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <div className="mb-8">
          <span className="text-primary uppercase tracking-[0.2em] font-bold text-xs">Book a Session</span>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold mt-1">Weekly Timetable</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
              <h3 className="font-semibold mb-4">Choose a day</h3>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const isSelected = toIsoDate(day) === selectedDateIso;
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDay(day)}
                      className={`flex flex-col items-center py-3 rounded-xl text-sm font-semibold transition-all ${
                        isSelected ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <span className="text-[10px] uppercase opacity-70">{day.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                      <span className="text-lg">{day.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Available sessions</h3>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-secondary font-semibold uppercase">Spots</label>
                  <select value={spots} onChange={(e) => setSpots(Number(e.target.value))} className="border border-outline-variant/40 rounded-lg px-2 py-1 text-sm">
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {isLoadingSlots ? (
                <div className="flex items-center gap-2 text-sm text-secondary py-6">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading sessions…
                </div>
              ) : allSlots.length === 0 ? (
                <p className="text-sm text-secondary py-6">No sessions scheduled for this day.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allSlots.map((slot) => (
                    <button
                      key={slot.time24}
                      disabled={!slot.available}
                      onClick={() => setSelectedTimeSlot(slot.time24)}
                      className={`p-3 rounded-xl text-left transition-all border ${
                        !slot.available
                          ? 'bg-surface-container text-secondary/40 cursor-not-allowed border-transparent'
                          : selectedTimeSlot === slot.time24
                            ? 'border-2 border-primary bg-primary/10 text-primary font-bold'
                            : 'border-outline-variant/30 hover:border-primary/50'
                      }`}
                    >
                      <div className="text-sm font-semibold">{slot.time}</div>
                      <div className="text-[11px] uppercase tracking-wide opacity-70">{slot.available ? 'Spots available' : 'Full'}</div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-surface p-6 rounded-2xl border border-outline-variant/20 shadow-sm space-y-4">
              <h3 className="font-semibold">Your details</h3>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="Phone" className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm outline-none focus:border-primary" />
              <button
                disabled={!selectedTimeSlot || !fullName.trim() || !email.trim() || isSubmitting}
                onClick={handleSubmit}
                className="w-full py-3.5 bg-on-surface text-on-primary rounded-xl font-bold text-sm uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Confirm booking
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer onNavigateLanding={onNavigateLanding} onNavigateMenu={onNavigateMenu} onNavigateReservations={() => {}} onToast={onToast} />
    </div>
  );
};
