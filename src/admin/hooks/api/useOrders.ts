import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRestaurant } from '../../../context/RestaurantContext';
import * as orderService from '../../../services/orders';
import type { OrderStatus } from '../../../types';

export function useOrders() {
  const { restaurantId } = useRestaurant();
  return useQuery({
    queryKey: ['admin-orders', restaurantId],
    queryFn: () => orderService.getOrders(restaurantId),
    refetchInterval: 15000,
  });
}

function useInvalidateOrders() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['admin-orders', restaurantId] });
}

export function useUpdateOrderStatus() {
  const { restaurantId } = useRestaurant();
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      orderService.updateOrderStatus(restaurantId, orderId, status),
    onSuccess: invalidate,
  });
}
