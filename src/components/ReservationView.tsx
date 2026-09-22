import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { ApiError } from "../services/http";
import { createReservationCheckout, getPublicAvailability } from "../services/reservations";
import { getPayment, retryPayment, submitCard, waitForPayment } from "../services/payments";
import { useRestaurant } from "../context/RestaurantContext";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FinixCardForm } from "./FinixCardForm";
import type { CheckoutSession, PublicAvailability } from "../types";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatReservationDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

interface CalendarCell {
  date: Date;
  inMonth: boolean;
}

/** Monday-first grid (matches the Mo/Tu/We/.../Su header), padded with adjacent-month days so every row is full. */
function getCalendarCells(displayMonth: Date): CalendarCell[] {
  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const firstWeekdayMonFirst = (firstOfMonth.getDay() + 6) % 7;

  const cells: CalendarCell[] = [];
  for (let i = firstWeekdayMonFirst; i > 0; i--) {
    cells.push({ date: new Date(year, month - 1, prevMonthDays - i + 1), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }
  return cells;
}

interface ReservationViewProps {
  onNavigateLanding: () => void;
  onNavigateMenu: () => void;
  onToast: (msg: string) => void;
  cartUniqueCount?: number;
  onOpenCart?: () => void;
}

export const ReservationView = ({
  onNavigateLanding,
  onNavigateMenu,
  onToast,
  cartUniqueCount = 0,
  onOpenCart,
}: ReservationViewProps) => {
  const { restaurantId } = useRestaurant();
  const [step, setStep] = useState(1);
  const [partySize, setPartySize] = useState(2);
  const today = useMemo(() => startOfDay(new Date()), []);
  const [displayMonth, setDisplayMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedSeating, setSelectedSeating] = useState<string | null>(
    "Indoor",
  );
  const [isMapVisible, setIsMapVisible] = useState(false);

  // Step 3 Guest Details States
  const [fullName, setFullName] = useState("Julianne Smith");
  const [phone, setPhone] = useState("+1 (555) 000-0000");
  const [email, setEmail] = useState("julianne.s@example.com");
  const [specialRequests, setSpecialRequests] = useState(
    "Gluten-free tasting menu preference for 1 guest.",
  );
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("LUM-82910");
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<PublicAvailability["slots"]>({ afternoon: [], evening: [] });
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const calendarCells = useMemo(() => getCalendarCells(displayMonth), [displayMonth]);
  const isPrevMonthDisabled =
    displayMonth.getFullYear() === today.getFullYear() && displayMonth.getMonth() === today.getMonth();
  const goToPrevMonth = () => {
    if (isPrevMonthDisabled) return;
    setDisplayMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const goToNextMonth = () => setDisplayMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const selectedDateIso = toIsoDate(selectedDate);
  const selectedTimeDisplay = useMemo(
    () => [...availability.afternoon, ...availability.evening].find((slot) => slot.time24 === selectedTimeSlot)?.time ?? "Select a time",
    [availability, selectedTimeSlot],
  );

  useEffect(() => {
    let active = true;
    setAvailabilityLoading(true);
    setAvailabilityError(null);
    setSelectedTimeSlot(null);
    getPublicAvailability(restaurantId, selectedDateIso, partySize)
      .then((result) => {
        if (!active) return;
        setAvailability(result.slots);
        if (!result.available) setAvailabilityError("No tables are available for this date and party size.");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setAvailability({ afternoon: [], evening: [] });
        setAvailabilityError(error instanceof Error ? error.message : "Unable to load available times. Please try again.");
      })
      .finally(() => {
        if (active) setAvailabilityLoading(false);
      });
    return () => { active = false; };
  }, [partySize, restaurantId, selectedDateIso]);

  useEffect(() => {
    if (!checkoutSession || !["pending", "provider_unknown"].includes(checkoutSession.status)) return;
    let active = true;
    const timer = window.setInterval(async () => {
      try {
        const result = await getPayment(checkoutSession);
        if (!active) return;
        setCheckoutSession(result);
        if (result.status === "succeeded" && result.fulfillmentStatus === "completed" && result.reservation) {
          window.clearInterval(timer);
          setConfirmationCode(result.reservation.confirmationCode);
          setStep(5);
          onToast(`Reservation confirmed! Code: ${result.reservation.confirmationCode}`);
        } else if (result.fulfillmentStatus === "action_required") {
          window.clearInterval(timer);
          setPaymentError("Your payment succeeded, but the selected table became unavailable. Please contact the restaurant with this payment reference so staff can assist you.");
        } else if (result.status === "failed") {
          window.clearInterval(timer);
          setPaymentError(result.failure?.message ?? "Your card was declined. You can retry with another card.");
        }
      } catch {
        // Keep polling transient status failures while this checkout remains open.
      }
    }, 3000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [checkoutSession, onToast]);

  const seatingOptions = [
    {
      id: "Indoor",
      title: "Indoor",
      badge: "POPULAR",
      desc: "The elegant main hall with curated art and soft acoustics.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD-UtwQJzT2m9uIFRyQs3WVXgUnEUfRAaUPE1joG1_4fIa3GmQ45nvKDnH6AEhYwiiPXimScn_LpMiiCQSoUmH-vXeRPYpfYGgSYByL4wEpYfSyFDPFlm01yQoHGrOpe4mNKh9JtIiD4dbfa-DYBeJknXksldv_P96lo8oJw309boOHcPQg3y5RYyQ1l8TGvC0H4Lbf7gdrKqz10zlv1gkWmbvCalPrm_I97_3ajnbKCrJLFB1PR6_1QPnTWKCOsbEmKfKI8xbp6LY",
    },
    {
      id: "Outdoor",
      title: "Outdoor",
      desc: "Breezy terrace dining with panoramic garden views.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCDelKvhuDf1eaIuh3VbrI0KaZd6jshkXloQKMXsmus1_gfLrRIc0OrFYVrYvrozrLer8ilYRogaCOWGgaiNm3ftqydqKlm5cA_ltLUC4rfmA9UUoj6xNaFgsbZW14nZT4ApEa0hlY8bAAVeb2LKGs9V8UfqJRhtTl7AyLSHeD1KJdyuZokmf7TLLyAW0VWCIXNDE5SB3Scnav9NLXZ8dr--sAFRHuvTFJ9HorS6LVOvvv3HsD5L4zPsunEFtceG-edIccFBDUAKaA",
    },
    {
      id: "The Bar",
      title: "The Bar",
      desc: "High-energy seating near our award-winning mixologists.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBHdjyD19lZysABSE7lqFFDnO89QTMq_5hBf4rmivW3z5CMYVLyO1toJwkUr4vBFrRkecWjBu7DUThm49PEU2LMLDUf2GNo5NFklrVZAxQ8FlozJCFGhVpN6xqsaUGbteiFSWEGj-v-VO7VkZgSbphYeH81npt-T89RDlNR2CX5lNTg2i5xq2q-Z4-Sc-nj1YFn9EK3inb3Tfb3Gfwo3px_GbdENWqGzk_30RhjXqAzqq7lXPadJZjMKdw5_QLTticy8dfguoFjmkg",
    },
    {
      id: "Private",
      title: "Private",
      badge: "VIP",
      desc: "Intimate booths or rooms for focused conversation.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA2pkAsFWKQ41_OMA1ddTgYpa-OaWPSfzKjAc3Riu9meylPu7PiRJpRKfIlxI9cPvho5o2PlQ3mK_s81adzM0XUIPUOrfVBR2RM5BmckG2qHqXQs-_sbaPumWslCXmUBNVwG7bLJfq0dQARIoZ23LIi5P-xbnR_61udb1tcdhXdxqlM499-QD35d4i3mf8mhB5QKaaYqfwiMs87ncXVAhgEfGuRWV4y33tUjUVFwJFY8zYnTSOZAIbn1gB9K9d7HxFK0-0eOHZRjS8",
    },
  ];

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAgreed) {
      onToast("Please agree to the Terms of Service to continue");
      return;
    }
    setCheckoutSession(null);
    setPaymentError(null);
    setStep(4);
  };

  const handleFinalConfirm = async () => {
    setIsProcessing(true);
    try {
      if (!selectedTimeSlot) {
        onToast("Please select an available time before confirming your reservation.");
        return;
      }
      const session = await createReservationCheckout(restaurantId, {
        date: selectedDateIso,
        timeSlot: selectedTimeSlot,
        partySize,
        seatingPreference: selectedSeating || "Indoor",
        guestName: fullName,
        guestEmail: email,
        guestPhone: phone,
        specialRequests,
        newsletterOptIn,
      });
      setCheckoutSession(session);
      setPaymentError(null);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 409) {
        onToast("That time slot is no longer available. Please choose another time.");
        setStep(1);
      } else if (error instanceof ApiError && error.status === 400) {
        onToast(error.message || "Please check your reservation details and try again.");
      } else if (error instanceof ApiError && error.status >= 500) {
        onToast("The reservation service is temporarily unavailable. Please try again shortly.");
      } else {
        onToast(error instanceof Error ? error.message : "Unable to confirm your reservation. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = useCallback((message: string) => {
    setPaymentError(message);
    setIsProcessing(false);
  }, []);

  const handleCardToken = useCallback(async (token: string) => {
    if (!checkoutSession) return;
    setIsProcessing(true);
    setPaymentError(null);
    try {
      let result = await submitCard(checkoutSession, token);
      result = await waitForPayment(result);
      setCheckoutSession(result);
      if (result.status === "succeeded" && result.fulfillmentStatus === "completed" && result.reservation) {
        setConfirmationCode(result.reservation.confirmationCode);
        setStep(5);
        onToast(`Reservation confirmed! Code: ${result.reservation.confirmationCode}`);
      } else if (result.fulfillmentStatus === "action_required") {
        setPaymentError("Your payment succeeded, but the selected table became unavailable. Please contact the restaurant with this payment reference so staff can assist you.");
      } else if (result.status === "failed") {
        setPaymentError(result.failure?.message ?? "Your card was declined. You can retry with another card.");
      } else {
        setPaymentError("Your deposit is still processing. Please keep this page open and check again shortly.");
      }
    } catch (error: unknown) {
      try {
        setCheckoutSession(await getPayment(checkoutSession));
      } catch {
        // Preserve the provider error below if status refresh is unavailable.
      }
      setPaymentError(error instanceof Error ? error.message : "Unable to process the reservation deposit.");
    } finally {
      setIsProcessing(false);
    }
  }, [checkoutSession, onToast]);

  const handlePaymentRetry = async () => {
    if (!checkoutSession) return;
    setIsProcessing(true);
    try {
      setCheckoutSession(await retryPayment(checkoutSession));
      setPaymentError(null);
    } catch (error: unknown) {
      setPaymentError(error instanceof Error ? error.message : "Unable to retry this payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      <Header
        currentPage="reservations"
        onNavigateLanding={onNavigateLanding}
        onNavigateMenu={onNavigateMenu}
        onNavigateReservations={() => {}}
        onToast={onToast}
        cartUniqueCount={cartUniqueCount}
        onOpenCart={onOpenCart}
      />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center pt-28 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        {step < 5 && (
          <div className="w-full max-w-2xl mb-10 fade-in">
            <div className="flex justify-between items-center mb-3">
              <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-[0.2em]">
                Step {step} of 4
              </span>
              <span className="font-label-sm text-xs text-on-surface/70 uppercase font-semibold">
                {step === 1 && "SELECT DETAILS"}
                {step === 2 && "SEATING PREFERENCE"}
                {step === 3 && "GUEST INFORMATION"}
                {step === 4 && "FINAL REVIEW"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700 ease-in-out"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* STEP 1: Select Details */}
        {step === 1 && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {/* Party Size */}
              <section className="bg-surface p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/20">
                <h3 className="font-serif text-2xl font-semibold mb-6 flex items-center gap-3 text-on-surface">
                  <span className="material-symbols-outlined text-primary text-2.5xl">
                    groups
                  </span>
                  <span>Party Size</span>
                </h3>
                <div className="flex flex-wrap gap-3 font-sans">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPartySize(num)}
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                        partySize === num
                          ? "border-2 border-primary bg-primary/10 text-primary shadow-sm font-bold scale-105"
                          : "border border-outline-variant/40 text-on-surface hover:border-primary hover:text-primary bg-surface-container-low"
                      }`}
                    >
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </button>
                  ))}
                  <button
                    onClick={() => setPartySize(9)}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                      partySize >= 9
                        ? "border-2 border-primary bg-primary/10 text-primary shadow-sm font-bold scale-105"
                        : "border border-outline-variant/40 text-on-surface hover:border-primary hover:text-primary bg-surface-container-low"
                    }`}
                  >
                    Large Group (8+)
                  </button>
                </div>
              </section>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Date Picker */}
                <section className="bg-surface p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-2xl font-semibold flex items-center gap-3 text-on-surface">
                      <span className="material-symbols-outlined text-primary text-2.5xl">
                        calendar_month
                      </span>
                      <span>Date</span>
                    </h3>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={goToPrevMonth}
                        disabled={isPrevMonthDisabled}
                        aria-label="Previous month"
                        className="p-2 hover:bg-surface-container rounded-full text-secondary disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-sm">
                          chevron_left
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={goToNextMonth}
                        aria-label="Next month"
                        className="p-2 hover:bg-surface-container rounded-full text-secondary"
                      >
                        <span className="material-symbols-outlined text-sm">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="text-center font-bold font-sans text-sm mb-4 text-on-surface">
                    {displayMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </div>
                  <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-bold text-secondary uppercase tracking-wider mb-3">
                    <div>Mo</div>
                    <div>Tu</div>
                    <div>We</div>
                    <div>Th</div>
                    <div>Fr</div>
                    <div>Sa</div>
                    <div>Su</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 font-sans">
                    {calendarCells.map((cell, idx) => {
                      const isPast = cell.date < today;
                      const isSelected = isSameDay(cell.date, selectedDate);
                      const disabled = isPast;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            if (!cell.inMonth) {
                              setDisplayMonth(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
                            }
                            setSelectedDate(cell.date);
                          }}
                          className={`aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                            disabled
                              ? "text-secondary cursor-not-allowed"
                              : isSelected
                                ? "bg-primary text-on-primary font-bold shadow-md scale-105"
                                : !cell.inMonth
                                  ? "text-secondary hover:bg-surface-container hover:text-on-surface"
                                  : "hover:bg-surface-container text-on-surface"
                          }`}
                        >
                          {cell.date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Time Slot Picker */}
                <section className="bg-surface p-6 md:p-8 rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
                  <h3 className="font-serif text-2xl font-semibold mb-6 flex items-center gap-3 text-on-surface">
                    <span className="material-symbols-outlined text-primary text-2.5xl">
                      schedule
                    </span>
                    <span>Available Time</span>
                  </h3>
                  <div className="space-y-6 max-h-[380px] overflow-y-auto pr-1 font-sans">
                    {availabilityLoading && (
                      <div className="flex items-center gap-2 text-sm text-secondary py-4">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading available times…
                      </div>
                    )}
                    {availabilityError && !availabilityLoading && (
                      <p className="text-sm text-secondary py-4">{availabilityError}</p>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
                        Afternoon
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {availability.afternoon.map((t) => (
                          <button
                            key={t.time24}
                            disabled={!t.available}
                            onClick={() => setSelectedTimeSlot(t.time24)}
                            className={`py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                              !t.available
                                ? "bg-surface-container text-secondary/40 cursor-not-allowed border border-transparent"
                                : selectedTimeSlot === t.time24
                                  ? "border-2 border-primary bg-primary text-on-primary font-bold shadow-md scale-105"
                                  : "border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white"
                            }`}
                          >
                            {t.time}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
                        Evening
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {availability.evening.map((t) => (
                          <button
                            key={t.time24}
                            disabled={!t.available}
                            onClick={() => setSelectedTimeSlot(t.time24)}
                            className={`py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                              !t.available
                                ? "bg-surface-container text-secondary/40 cursor-not-allowed border border-transparent"
                                : selectedTimeSlot === t.time24
                                  ? "border-2 border-primary bg-primary text-on-primary font-bold shadow-md scale-105"
                                  : "border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white"
                            }`}
                          >
                            {t.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-44 space-y-6">
                <section className="bg-surface rounded-2xl overflow-hidden shadow-lg border border-outline-variant/20">
                  <div className="h-48 relative">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBn-BCmPvdhaCtvMMugttVWdxIHPK-InLbetXVO24a9ybBlFtbKKa88kuMtsDyNShg-kVTh4ydJJxzjuHH4VJ6Bc08HCUkDKHq9akRSY7XYOEcf_aX2mu1_UOWQT0nopHkjLgHxHpDtNfnxXPKBbHfIZdrLq9jigV-IO7k9lvk8qlXg1dvRDnVNfqIJRXav_hMjCJC52DiBQYXpa_sdLR26lzwHnupS1lFtR2IrbyqFKAOHPQ0tEnS7Osy7Dq8PLpVnHWz-noH3Oyg"
                      alt="Lumière Fine Dining Plating"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                      <h2 className="text-white font-serif text-2xl font-bold">
                        Lumière Mayfair
                      </h2>
                    </div>
                  </div>

                  <div className="p-6 space-y-6 font-sans">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-secondary">Guests</span>
                        <span className="font-bold text-on-surface">
                          {partySize} {partySize === 1 ? "Person" : "People"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-secondary">Date</span>
                        <span className="font-bold text-on-surface">
                          {formatReservationDate(selectedDate)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-secondary">Time</span>
                        <span className="font-bold text-on-surface">
                          {selectedTimeDisplay}
                        </span>
                      </div>
                    </div>

                    <hr className="border-outline-variant/20" />

                    <div className="flex items-start gap-3 bg-tertiary-fixed/20 p-4 rounded-xl border border-tertiary/20">
                      <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5 filled">
                        stars
                      </span>
                      <div>
                        <p className="text-xs font-bold text-tertiary uppercase tracking-wider mb-0.5">
                          RARE FIND
                        </p>
                        <p className="text-xs text-on-tertiary-fixed-variant leading-relaxed">
                          This time slot is in high demand. We recommend booking
                          soon to secure your experience.
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={!selectedTimeSlot || availabilityLoading}
                      onClick={() => setStep(2)}
                      className="w-full py-4 bg-on-surface text-surface rounded-xl font-bold text-sm tracking-wide uppercase hover:bg-on-surface/90 transition-all duration-300 shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Continue to Seating</span>
                      <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Seating Preference Screen */}
        {step === 2 && (
          <div className="w-full max-w-6xl space-y-12 animate-fadeIn">
            <div className="text-center mb-10">
              <h2 className="font-serif text-4xl md:text-5xl font-semibold text-on-surface mb-3">
                Where would you like to sit?
              </h2>
              <p className="text-secondary font-sans text-base md:text-lg max-w-xl mx-auto">
                Select your preferred environment for an unforgettable culinary
                experience tailored to your mood.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
              {seatingOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setSelectedSeating(opt.id)}
                  className={`group relative bg-surface-container-lowest rounded-2xl p-4 border cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-[0.98] ${
                    selectedSeating === opt.id
                      ? "border-primary ring-2 ring-primary bg-primary/5 shadow-md"
                      : "border-outline-variant/40 hover:border-primary/50"
                  }`}
                >
                  <div className="relative h-60 w-full rounded-xl overflow-hidden mb-4 border border-outline-variant/20">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                    <img
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={opt.image}
                      alt={opt.title}
                    />
                    {opt.badge && (
                      <div className="absolute bottom-4 left-4 z-20">
                        <span className="text-xs font-bold text-white bg-primary py-1 px-3 rounded-full uppercase shadow">
                          {opt.badge}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-on-surface mb-1">
                    {opt.title}
                  </h3>
                  <p className="text-secondary text-sm font-sans leading-relaxed">
                    {opt.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="w-full max-w-4xl mx-auto font-sans">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    map
                  </span>
                  <h4 className="font-serif text-xl font-semibold text-on-surface">
                    Floor Map Visualization
                  </h4>
                </div>
                <button
                  onClick={() => setIsMapVisible(!isMapVisible)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant/40 hover:bg-surface-container-low transition-colors text-xs font-bold uppercase tracking-wider"
                >
                  <span>{isMapVisible ? "HIDE MAP" : "VIEW MAP"}</span>
                  <span
                    className={`material-symbols-outlined text-base transition-transform ${isMapVisible ? "rotate-180" : ""}`}
                  >
                    expand_more
                  </span>
                </button>
              </div>

              {isMapVisible && (
                <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 relative min-h-[360px] flex items-center justify-center animate-fadeIn">
                  <div className="relative z-10 w-full max-w-2xl aspect-video bg-white/80 backdrop-blur-md rounded-2xl border border-outline-variant/30 p-8 shadow-md flex flex-col justify-center items-center gap-6">
                    <div className="flex gap-8 w-full justify-center">
                      <div
                        className={`w-36 h-28 border-2 border-dashed rounded-xl flex items-center justify-center font-bold text-xs ${selectedSeating === "Outdoor" ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-secondary"}`}
                      >
                        OUTDOOR
                      </div>
                      <div
                        className={`w-48 h-28 rounded-xl border-2 flex flex-col items-center justify-center gap-2 font-bold text-xs ${selectedSeating === "Indoor" ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-secondary"}`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          restaurant
                        </span>
                        <span>INDOOR HALL</span>
                      </div>
                    </div>

                    <div className="flex gap-8 w-full justify-center">
                      <div
                        className={`w-48 h-16 rounded-full border-2 flex items-center justify-center font-bold text-xs ${selectedSeating === "The Bar" ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-secondary"}`}
                      >
                        THE BAR
                      </div>
                      <div
                        className={`w-36 h-16 rounded-xl border-2 flex items-center justify-center font-bold text-xs ${selectedSeating === "Private" ? "border-primary bg-primary/10 text-primary" : "border-outline-variant text-secondary"}`}
                      >
                        PRIVATE
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-outline-variant/20 py-5 px-margin-mobile md:px-margin-desktop z-40">
              <div className="max-w-container-max mx-auto flex justify-between items-center font-sans">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-secondary hover:text-on-surface transition-colors font-bold text-xs uppercase tracking-widest"
                >
                  <span className="material-symbols-outlined text-base">
                    arrow_back
                  </span>
                  <span>BACK</span>
                </button>

                <div className="flex items-center gap-8">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-secondary text-[11px] font-bold uppercase tracking-widest">
                      PREFERENCE
                    </span>
                    <span className="text-primary font-bold text-sm">
                      {selectedSeating || "Please select an option"}
                    </span>
                  </div>

                  <button
                    disabled={!selectedSeating}
                    onClick={() => setStep(3)}
                    className={`px-10 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-md ${
                      selectedSeating
                        ? "bg-on-surface text-on-primary hover:bg-on-surface/90 active:scale-95 cursor-pointer"
                        : "bg-secondary text-white/50 cursor-not-allowed"
                    }`}
                  >
                    Continue to Information
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Guest Details Screen */}
        {step === 3 && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn max-w-5xl">
            <div className="lg:col-span-8">
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 md:p-10 space-y-8 font-sans">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-on-surface mb-2">
                    Secure Your Table
                  </h2>
                  <p className="text-secondary text-sm">
                    Please provide your details to finalize the reservation.
                    We'll send a confirmation to your email.
                  </p>
                </div>

                <form onSubmit={handleGuestSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block font-label-sm text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                        FULL NAME
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Julianne Smith"
                        className="w-full bg-surface p-4 rounded-xl border border-outline-variant/50 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block font-label-sm text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                        PHONE NUMBER
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+44 20 7123 4567"
                        className="w-full bg-surface p-4 rounded-xl border border-outline-variant/50 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-label-sm text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="julianne.s@example.com"
                      className="w-full bg-surface p-4 rounded-xl border border-outline-variant/50 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-label-sm text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                      SPECIAL REQUESTS (ANNIVERSARY, ALLERGIES, ETC.)
                    </label>
                    <textarea
                      rows={4}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Is there anything we should know about your visit?"
                      className="w-full bg-surface p-4 rounded-xl border border-outline-variant/50 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={newsletterOptIn}
                        onChange={(e) => setNewsletterOptIn(e.target.checked)}
                        className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all cursor-pointer mt-0.5"
                      />
                      <span className="text-secondary text-sm group-hover:text-on-surface transition-colors">
                        Send me occasional updates, seasonal menu previews, and
                        exclusive offers (Newsletter).
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all cursor-pointer mt-0.5"
                        required
                      />
                      <span className="text-secondary text-sm group-hover:text-on-surface transition-colors">
                        I agree to the{" "}
                        <a
                          href="#"
                          className="text-primary font-bold underline"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          className="text-primary font-bold underline"
                        >
                          Cancellation Policy
                        </a>
                        .
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-3 rounded-xl border border-outline text-on-surface text-sm font-semibold hover:bg-surface-container-low transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-10 py-4 bg-on-surface text-on-primary rounded-xl font-bold text-sm tracking-wide uppercase hover:bg-on-surface-variant shadow-lg active:scale-[0.98] transition-all"
                    >
                      Review Reservation
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-6 font-sans">
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
                  <div className="h-36 w-full overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDV5mDLxr2c-NtUDInr3uY8C-1KSK6gkvKT0rDyLyaSxCPb0s1jpJ56QEvz_ZyItQFLHQinnwFHRuusak70kT9l9TvZijJirbJXt4Alm4vkjx_-uOAj27MnkbpSxELFwZXeSnd2Cczuc-sUz78m0yLQ_iHV9NacXPQs7sNLDolPn_aVQvwv012LeCqGAZW7-hL5zmNVB9fjDU8TgL7rwx1g67SxI31wmm7bT9EOeTyhSjNDTp_o9XtM9wcNv7aIcnQtbuYt9QOvjgY"
                      alt="Scallop Gourmet Dish"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-on-surface mb-4">
                      Reservation Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-xl">
                          calendar_today
                        </span>
                        <div>
                          <p className="font-label-sm text-[10px] text-secondary uppercase font-bold tracking-wider">
                            DATE & TIME
                          </p>
                          <p className="text-on-surface font-semibold text-sm">
                            {formatReservationDate(selectedDate)} • {selectedTimeDisplay}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-xl">
                          group
                        </span>
                        <div>
                          <p className="font-label-sm text-[10px] text-secondary uppercase font-bold tracking-wider">
                            GUESTS
                          </p>
                          <p className="text-on-surface font-semibold text-sm">
                            {partySize} People
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-xl">
                          grid_view
                        </span>
                        <div>
                          <p className="font-label-sm text-[10px] text-secondary uppercase font-bold tracking-wider">
                            TABLE TYPE
                          </p>
                          <p className="text-on-surface font-semibold text-sm">
                            {selectedSeating || "Main Dining Area"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-fixed/20 p-5 rounded-2xl border border-primary-fixed/40">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary filled text-xl">
                      verified
                    </span>
                    <h4 className="font-label-sm text-xs text-primary-fixed-dim font-bold uppercase tracking-wider">
                      Instant Confirmation
                    </h4>
                  </div>
                  <p className="text-xs text-on-primary-fixed-variant leading-relaxed">
                    Lumière guarantees your table immediately upon booking. No
                    waiting lists or secondary approvals required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Confirm Screen */}
        {step === 4 && (
          <div className="w-full max-w-4xl space-y-10 animate-fadeIn">
            <div className="text-center mb-8">
              <h2 className="font-serif text-4xl md:text-5xl font-semibold text-on-surface mb-2">
                Almost there.
              </h2>
              <p className="font-sans text-base md:text-lg text-secondary">
                Please review your reservation details before confirming.
              </p>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
                  <div className="relative h-48 w-full">
                    <img
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE69CdsxHdMIExbg_I9FWi7Nd48vW4C66in2TTpwKWt4hF_f4Ay18ishqdDIPFD_K_AjWjwaqOVZdkcVlHH_RdigKi-88AuK5JFHEJdIY6jT0c69hn4ysCCHCRkPwtdZhNoNX3oh5L5ZUDz0W7J__FX-Au-pMgzv0u3piZICkSbFYiZ_2osxUT1wW747c4djhVT1DIVVg9ROFQTGPEw2q0fzWS0wR2I-r2a7Srup3NSQ4pkek8Vrd-8-INdq7QfD-GXY-RHYMB7bk"
                      alt="Lumière Interior Dining Room"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-on-surface/75 via-on-surface/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                      <span className="font-label-sm text-xs font-bold tracking-widest text-primary-fixed bg-on-surface/40 backdrop-blur-md px-3 py-1 rounded-full mb-2 inline-block">
                        CONFIRMED RESTAURANT
                      </span>
                      <h3 className="font-serif text-3xl font-bold">Lumière</h3>
                    </div>
                  </div>

                  <div className="p-8 font-sans">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-2xl">
                            calendar_today
                          </span>
                        </div>
                        <div>
                          <p className="font-label-sm text-xs text-secondary uppercase font-bold tracking-wider mb-1">
                            Date & Time
                          </p>
                          <p className="font-serif text-xl font-bold text-on-surface">
                            {formatReservationDate(selectedDate)}
                          </p>
                          <p className="text-sm text-on-surface/70">
                            at {selectedTimeDisplay}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined text-2xl">
                            group
                          </span>
                        </div>
                        <div>
                          <p className="font-label-sm text-xs text-secondary uppercase font-bold tracking-wider mb-1">
                            Party Size
                          </p>
                          <p className="font-serif text-xl font-bold text-on-surface">
                            {partySize} People
                          </p>
                          <p className="text-sm text-on-surface/70">
                            {selectedSeating || "Main Dining Area"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-outline-variant/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary filled text-xl">
                          verified
                        </span>
                        <span className="text-sm font-semibold text-on-surface">
                          Seating Guaranteed
                        </span>
                      </div>
                      <button
                        onClick={() => setStep(1)}
                        className="text-primary hover:underline font-label-sm text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Edit Details
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low/60 border border-outline-variant/20 rounded-2xl p-8 space-y-4 font-sans">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-2xl">
                      info
                    </span>
                    <h4 className="font-serif text-xl font-semibold text-on-surface">
                      Cancellation Policy
                    </h4>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed">
                    Reservation deposits are charged when the booking is confirmed.
                    Automatic refunds are not available in this release; please contact
                    the restaurant before cancelling if you need assistance.
                  </p>
                  <div className="flex items-center gap-3 text-on-tertiary-fixed-variant bg-tertiary-fixed/20 p-4 rounded-xl border border-tertiary/20">
                    <span className="material-symbols-outlined text-xl">
                      notifications_active
                    </span>
                    <p className="font-label-sm text-xs">
                      We'll send you a reminder 48 hours before your booking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6 font-sans">
                <div className="sticky top-28 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-xl">
                  <h4 className="font-serif text-2xl font-bold text-on-surface mb-6">
                    Reservation Summary
                  </h4>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">Booking Fee</span>
                      <span className="text-on-surface font-semibold">
                        $0.00
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">Reservation Deposit</span>
                      <span className="text-on-surface font-semibold">
                        {checkoutSession ? `$${(checkoutSession.amountCents / 100).toFixed(2)}` : "Calculated at checkout"}
                      </span>
                    </div>
                    <div className="h-px bg-outline-variant/20 my-2"></div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary font-serif text-xl font-bold">
                        {checkoutSession ? `$${(checkoutSession.amountCents / 100).toFixed(2)}` : "—"}
                      </span>
                    </div>
                  </div>

                  {!checkoutSession && <button
                    disabled={isProcessing}
                    onClick={handleFinalConfirm}
                    className="w-full bg-[#1A1A1A] hover:bg-on-surface-variant text-white py-5 rounded-2xl font-sans font-bold text-base transition-all active:scale-95 shadow-lg mb-4 flex items-center justify-center gap-2 group cursor-pointer tracking-wider uppercase"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue to Card Payment</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>}

                  {checkoutSession && checkoutSession.fulfillmentStatus !== "action_required" && (
                    <div className="mb-5 space-y-3">
                      {checkoutSession.status === "failed" ? (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={handlePaymentRetry}
                          className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold"
                        >
                          Retry with another card
                        </button>
                      ) : checkoutSession.status === "created" ? (
                        <FinixCardForm
                          key={checkoutSession.id}
                          amountCents={checkoutSession.amountCents}
                          disabled={isProcessing}
                          onToken={handleCardToken}
                          onError={handlePaymentError}
                        />
                      ) : (
                        <p className="text-sm text-secondary">Deposit processing. This page will update when Finix confirms the result.</p>
                      )}
                    </div>
                  )}
                  {paymentError && <p className="mb-5 text-sm text-error" role="alert">{paymentError}</p>}

                  <button
                    onClick={() => { setCheckoutSession(null); setPaymentError(null); setStep(3); }}
                    className="w-full bg-transparent hover:bg-surface-container border border-outline-variant/50 text-on-surface py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95 mb-6"
                  >
                    Edit Details
                  </button>

                  <p className="text-center font-label-sm text-xs text-secondary/70">
                    By clicking confirm, you agree to our{" "}
                    <a className="underline hover:text-primary" href="#">
                      Terms of Service
                    </a>
                    .
                  </p>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 flex items-center gap-4">
                  <div className="p-3 bg-tertiary-fixed/30 rounded-full text-tertiary shrink-0">
                    <span className="material-symbols-outlined filled text-2xl">
                      stars
                    </span>
                  </div>
                  <div>
                    <p className="font-label-sm text-xs font-bold text-on-surface mb-0.5">
                      VIP ACCESSIBILITY
                    </p>
                    <p className="text-xs text-secondary">
                      Member rewards apply at check-in.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Success Confirmation Screen */}
        {step === 5 && (
          <div className="relative w-full max-w-3xl text-center flex flex-col items-center animate-fadeIn">
            {/* Ambient background glow & image */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
              <div
                className="w-full h-full bg-cover bg-center blur-3xl opacity-20"
                style={{
                  backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAWpuEh0jxR4sRh2rCDg2H11WiznFzA9IKShr1YUxW3qUCwnBAsQ-Ac-wQGiM5A2EUSVoYJ9yvxUf4bA8cIUBrnYC6pILTHKGV0M1mCDckMTIOh_pHmB3d1gYPXAq0Cn3qpKrdVedhsOcnCqPGsEuK_f9jI93VGUcTBARa4J14lXUx1VkSBk2i6hSZm61CWDElhGNm6st8nDL3LCzQXrxzGWNFTrS6LLdT_PeV01_iC34nvpCVE5w-Iu7kuhFgv3c_tItttapDYy-U")`,
                }}
              ></div>
            </div>

            {/* Icon Cluster */}
            <div className="mb-8 relative group z-10">
              <div className="absolute inset-0 bg-tertiary-fixed-dim rounded-full blur-2xl opacity-25 scale-150 transition-transform group-hover:scale-110"></div>
              <div className="relative w-24 h-24 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-lg border border-outline-variant/30">
                <span className="material-symbols-outlined text-6xl text-primary filled">
                  check_circle
                </span>
              </div>
            </div>

            {/* Header Content */}
            <div className="z-10 space-y-3 mb-10">
              <h2 className="font-serif text-4xl md:text-5xl font-semibold text-on-surface">
                Your table is reserved!
              </h2>
              <div className="inline-block bg-surface-container-low px-4 py-1.5 rounded-full border border-outline-variant/20 shadow-sm font-sans">
                <span className="font-label-sm text-xs uppercase text-secondary tracking-widest font-medium">
                  Confirmation ID:{" "}
                  <span className="text-on-surface font-bold">
                    #{confirmationCode}
                  </span>
                </span>
              </div>
              <p className="font-sans text-base md:text-lg text-secondary max-w-lg mx-auto leading-relaxed pt-2">
                A confirmation has been sent to{" "}
                <span className="text-on-surface font-semibold">{email}</span>{" "}
                and{" "}
                <span className="text-on-surface font-semibold">{phone}</span>.
              </p>
            </div>

            {/* Action Grid (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12 z-10 font-sans">
              {/* Primary Action Card: Add to Calendar */}
              <div className="col-span-1 md:col-span-2 bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30 shadow-md flex flex-col md:flex-row items-center justify-between text-left group hover:-translate-y-1 transition-all duration-300">
                <div className="mb-6 md:mb-0">
                  <h3 className="font-serif text-xl font-bold text-on-surface mb-1">
                    Add to Calendar
                  </h3>
                  <p className="font-sans text-sm text-secondary">
                    Ensure you don't miss the moment.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center md:justify-end font-sans">
                  <button
                    onClick={() => onToast("Added to Apple Calendar")}
                    className="px-5 py-2.5 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-high transition-colors flex items-center gap-2 text-sm font-semibold text-on-surface"
                  >
                    <span className="material-symbols-outlined text-lg">
                      event
                    </span>{" "}
                    Apple
                  </button>
                  <button
                    onClick={() => onToast("Added to Google Calendar")}
                    className="px-5 py-2.5 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-high transition-colors flex items-center gap-2 text-sm font-semibold text-on-surface"
                  >
                    <span className="material-symbols-outlined text-lg">
                      event_available
                    </span>{" "}
                    Google
                  </button>
                  <button
                    onClick={() => onToast("Added to Outlook Calendar")}
                    className="px-5 py-2.5 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-high transition-colors flex items-center gap-2 text-sm font-semibold text-on-surface"
                  >
                    <span className="material-symbols-outlined text-lg">
                      calendar_today
                    </span>{" "}
                    Outlook
                  </button>
                </div>
              </div>

              {/* Secondary Action: Modify Reservation */}
              <button
                onClick={() => setStep(1)}
                className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container transition-all flex items-center justify-between group active:scale-[0.98] text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors shrink-0">
                    <span className="material-symbols-outlined text-2xl">
                      edit_calendar
                    </span>
                  </div>
                  <div>
                    <span className="block font-sans text-base font-bold text-on-surface">
                      Modify Reservation
                    </span>
                    <span className="block font-label-sm text-xs text-secondary">
                      Change time or party size
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                  arrow_forward_ios
                </span>
              </button>

              {/* Secondary Action: Cancel Reservation */}
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you wish to cancel this reservation?",
                    )
                  ) {
                    onToast("Reservation cancelled");
                    onNavigateLanding();
                  }
                }}
                className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/20 hover:border-error/40 hover:bg-error-container/10 transition-all flex items-center justify-between group active:scale-[0.98] text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-error group-hover:bg-error group-hover:text-on-error transition-colors shrink-0">
                    <span className="material-symbols-outlined text-2xl">
                      event_busy
                    </span>
                  </div>
                  <div>
                    <span className="block font-sans text-base font-bold text-on-surface">
                      Cancel Reservation
                    </span>
                    <span className="block font-label-sm text-xs text-secondary">
                      No longer able to attend?
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                  arrow_forward_ios
                </span>
              </button>
            </div>

            {/* Footer Back Button */}
            <button
              onClick={onNavigateLanding}
              className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-on-primary rounded-full font-sans font-semibold text-sm tracking-wide uppercase shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all z-10 cursor-pointer"
            >
              <span>Back to Website</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        )}
      </main>

      <Footer
        onNavigateLanding={onNavigateLanding}
        onNavigateMenu={onNavigateMenu}
        onNavigateReservations={() => {}}
        onToast={onToast}
      />
    </div>
  );
};
