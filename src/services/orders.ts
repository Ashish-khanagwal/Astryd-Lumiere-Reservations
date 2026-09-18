import { http } from './http';
import type { Order, OrderStatus } from '../types';

export const getOrders = (restaurantId: string) => http.get<Order[]>(`/restaurants/${restaurantId}/orders`);

export const createOrder = (restaurantId: string, payload: Partial<Order>) =>
  http.post<Order>(`/restaurants/${restaurantId}/orders`, payload);

export const updateOrderStatus = (restaurantId: string, orderId: string, status: OrderStatus) =>
  http.patch<Order>(`/restaurants/${restaurantId}/orders/${orderId}/status`, { status });
