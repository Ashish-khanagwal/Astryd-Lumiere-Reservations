import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Users, Mail, Phone, StickyNote, Settings2 } from 'lucide-react';
import { useReservations, useUpdateReservationStatus, useReservationAvailability, useUpdateReservationAvailability } from '../../hooks/api/useReservations';
import { useAdminToast } from '../../context/AdminToastContext';
import { PageHeader } from '../../components/PageHeader';
import { ListSkeleton } from '../../components/Skeleton';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { DataTable } from '../../components/DataTable';
import { ReservationStatusBadge } from '../../components/ReservationStatusBadge';
import { WEEK_DAY_LABEL, WEEK_DAY_ORDER, formatTimeSlot } from './reservationMeta';
import type { Reservation, ReservationDayAvailability, ReservationStatus } from '../../../types';

type Tab = 'bookings' | 'availability';
type HistoryMode = 'all' | 'day' | 'month' | 'range';

function toDateInputValue(d: Date) {
  return d.toISOString().slice(0, 10);
}
function toMonthInputValue(d: Date) {
  return d.toISOString().slice(0, 7);
}

const STATUS_OPTIONS: ReservationStatus[] = ['confirmed', 'seated', 'completed', 'cancelled', 'no_show'];

export function ReservationsPage() {
  const { data: reservations, isLoading } = useReservations();
  const updateStatus = useUpdateReservationStatus();
  const { data: availability, isLoading: isAvailabilityLoading } = useReservationAvailability();
  const updateAvailability = useUpdateReservationAvailability();
  const { showToast } = useAdminToast();

  const [tab, setTab] = useState<Tab>('bookings');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [historyMode, setHistoryMode] = useState<HistoryMode>('all');
  const [historyDate, setHistoryDate] = useState(() => toDateInputValue(new Date()));
  const [historyMonth, setHistoryMonth] = useState(() => toMonthInputValue(new Date()));
  const [historyFrom, setHistoryFrom] = useState(() => toDateInputValue(new Date()));
  const [historyTo, setHistoryTo] = useState(() => toDateInputValue(new Date()));

  const [days, setDays] = useState<ReservationDayAvailability[]>([]);

  useEffect(() => {
    if (availability) setDays(availability.days);
  }, [availability]);

  const selectedReservation = reservations?.find((r) => r.id === selectedId) ?? null;

  const filteredReservations = useMemo(() => {
    const all = [...(reservations ?? [])].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
    if (historyMode === 'all') return all;
    if (historyMode === 'day') return all.filter((r) => r.date === historyDate);
    if (historyMode === 'month') return all.filter((r) => r.date.slice(0, 7) === historyMonth);
    return all.filter((r) => (!historyFrom || r.date >= historyFrom) && (!historyTo || r.date <= historyTo));
  }, [reservations, historyMode, historyDate, historyMonth, historyFrom, historyTo]);

  const isDirty = JSON.stringify(days) !== JSON.stringify(availability?.days ?? []);

  const toggleSlot = (day: ReservationDayAvailability['day'], time: string) => {
    setDays((current) =>
      current.map((entry) =>
        entry.day === day
          ? { ...entry, slots: entry.slots.map((s) => (s.time === time ? { ...s, isOpen: !s.isOpen } : s)) }
          : entry,
      ),
    );
  };

  const handleSaveAvailability = async () => {
    await updateAvailability.mutateAsync(days);
    showToast('Availability updated.');
  };

  const header = (
    <PageHeader
      icon={CalendarDays}
      title="Reservations"
      description="Manage incoming bookings and control which time slots guests can book, day by day."
    />
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {header}
        <ListSkeleton rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}

      <div className="flex gap-2">
        <button
          onClick={() => setTab('bookings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            tab === 'bookings' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/40 text-secondary hover:border-primary/40'
          }`}
        >
          Bookings
        </button>
        <button
          onClick={() => setTab('availability')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            tab === 'availability' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/40 text-secondary hover:border-primary/40'
          }`}
        >
          <Settings2 className="h-3.5 w-3.5" />
          Availability
        </button>
      </div>

      {tab === 'bookings' ? (
        <div className="space-y-4">
          <div className="admin-card p-4 flex flex-wrap items-end gap-4">
            <div className="flex gap-2">
              {(['all', 'day', 'month', 'range'] as HistoryMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setHistoryMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-colors ${
                    historyMode === mode ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/40 text-secondary hover:border-primary/40'
                  }`}
                >
                  {mode === 'all' ? 'All Time' : mode}
                </button>
              ))}
            </div>

            {historyMode === 'day' && (
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Date</label>
                <input
                  type="date"
                  value={historyDate}
                  onChange={(e) => setHistoryDate(e.target.value)}
                  className="rounded-lg border border-outline-variant/40 bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
                />
              </div>
            )}

            {historyMode === 'month' && (
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1">Month</label>
                <input
                  type="month"
                  value={historyMonth}
                  onChange={(e) => setHistoryMonth(e.target.value)}
                  className="rounded-lg border border-outline-variant/40 bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
                />
              </div>
            )}

            {historyMode === 'range' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">From</label>
                  <input
                    type="date"
                    value={historyFrom}
                    max={historyTo}
                    onChange={(e) => setHistoryFrom(e.target.value)}
                    className="rounded-lg border border-outline-variant/40 bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">To</label>
                  <input
                    type="date"
                    value={historyTo}
                    min={historyFrom}
                    onChange={(e) => setHistoryTo(e.target.value)}
                    className="rounded-lg border border-outline-variant/40 bg-surface px-3 py-1.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </>
            )}

            <span className="text-xs text-secondary ml-auto">
              {filteredReservations.length} booking{filteredReservations.length === 1 ? '' : 's'}
            </span>
          </div>

          <DataTable
            rows={filteredReservations}
            rowKey={(r) => r.id}
            emptyMessage="No reservations in this period."
            columns={[
              {
                header: 'Code',
                render: (r) => (
                  <button onClick={() => setSelectedId(r.id)} className="font-semibold text-on-surface hover:text-primary transition-colors">
                    {r.confirmationCode}
                  </button>
                ),
              },
              { header: 'Guest', render: (r) => r.guestName },
              {
                header: 'Date & Time',
                render: (r) => (
                  <span className="text-secondary">
                    {new Date(r.date).toLocaleDateString(undefined, { dateStyle: 'medium' })} · {formatTimeSlot(r.timeSlot)}
                  </span>
                ),
              },
              { header: 'Party', render: (r) => <span className="text-secondary">{r.partySize}</span> },
              { header: 'Status', render: (r) => <ReservationStatusBadge status={r.status} /> },
            ]}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="admin-card p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-secondary">
              Toggle which time slots are open for booking on each day of the week. Guests won't be able to select a closed slot.
            </p>
            <Button variant="primary" size="sm" disabled={!isDirty} loading={updateAvailability.isPending} onClick={handleSaveAvailability}>
              Save Changes
            </Button>
          </div>

          {isAvailabilityLoading ? (
            <ListSkeleton rows={7} />
          ) : (
            <div className="space-y-3">
              {WEEK_DAY_ORDER.map((day) => {
                const entry = days.find((d) => d.day === day);
                if (!entry) return null;
                return (
                  <div key={day} className="admin-card p-4">
                    <div className="text-sm font-semibold text-on-surface mb-3">{WEEK_DAY_LABEL[day]}</div>
                    <div className="flex flex-wrap gap-2">
                      {entry.slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => toggleSlot(day, slot.time)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                            slot.isOpen
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'border-outline-variant/30 text-secondary/60 line-through hover:text-secondary'
                          }`}
                        >
                          {formatTimeSlot(slot.time)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedReservation)}
        onClose={() => setSelectedId(null)}
        title={selectedReservation ? selectedReservation.confirmationCode : ''}
        description={selectedReservation ? `Placed ${new Date(selectedReservation.placedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}` : undefined}
        maxWidth="max-w-lg"
        footer={
          selectedReservation && (
            <div className="flex flex-wrap gap-2 justify-end">
              {STATUS_OPTIONS.filter((s) => s !== selectedReservation.status).map((s) => (
                <Button
                  key={s}
                  variant={s === 'cancelled' ? 'danger' : 'outline'}
                  size="sm"
                  loading={updateStatus.isPending && updateStatus.variables?.reservationId === selectedReservation.id && updateStatus.variables?.status === s}
                  onClick={() => updateStatus.mutate({ reservationId: selectedReservation.id, status: s })}
                >
                  Mark {s === 'no_show' ? 'No Show' : s.charAt(0).toUpperCase() + s.slice(1)}
                </Button>
              ))}
            </div>
          )
        }
      >
        {selectedReservation && (
          <ReservationDetail reservation={selectedReservation} />
        )}
      </Modal>
    </div>
  );
}

function ReservationDetail({ reservation }: { reservation: Reservation }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-on-surface">
          {new Date(reservation.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · {formatTimeSlot(reservation.timeSlot)}
        </span>
        <ReservationStatusBadge status={reservation.status} />
      </div>

      <div className="space-y-1.5 text-sm text-secondary">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 shrink-0" />
          {reservation.partySize} guest{reservation.partySize === 1 ? '' : 's'} · {reservation.seatingPreference}
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          {reservation.guestEmail}
        </div>
        {reservation.guestPhone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {reservation.guestPhone}
          </div>
        )}
        {reservation.specialRequests && (
          <div className="flex items-start gap-2">
            <StickyNote className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            {reservation.specialRequests}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between font-semibold text-on-surface border-t border-outline-variant/10 pt-4">
        <span className="text-sm text-secondary font-normal">Guest</span>
        <span>{reservation.guestName}</span>
      </div>
    </div>
  );
}
