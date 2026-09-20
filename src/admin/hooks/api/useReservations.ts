import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRestaurant } from '../../../context/RestaurantContext';
import * as reservationService from '../../../services/reservations';
import type { ReservationDayAvailability, ReservationStatus } from '../../../types';

export function useReservations() {
  const { restaurantId } = useRestaurant();
  return useQuery({
    queryKey: ['admin-reservations', restaurantId],
    queryFn: () => reservationService.getReservations(),
    refetchInterval: 15000,
  });
}

function useInvalidateReservations() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['admin-reservations', restaurantId] });
}

export function useUpdateReservationStatus() {
  const invalidate = useInvalidateReservations();
  return useMutation({
    mutationFn: ({ reservationId, status }: { reservationId: string; status: ReservationStatus }) =>
      reservationService.updateReservationStatus(reservationId, status),
    onSuccess: invalidate,
  });
}

export function useReservationAvailability() {
  const { restaurantId } = useRestaurant();
  return useQuery({
    queryKey: ['admin-reservation-availability', restaurantId],
    queryFn: () => reservationService.getReservationAvailability(restaurantId),
  });
}

export function useUpdateReservationAvailability() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (days: ReservationDayAvailability[]) =>
      reservationService.updateReservationAvailability(restaurantId, { days }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-reservation-availability', restaurantId] }),
  });
}
