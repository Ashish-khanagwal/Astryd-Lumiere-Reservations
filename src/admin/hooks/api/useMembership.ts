import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRestaurant } from '../../../context/RestaurantContext';
import * as membershipService from '../../../services/membership';
import type { Member, MembershipPlan } from '../../../types';

export function useMembershipPlans() {
  const { restaurantId } = useRestaurant();
  return useQuery({
    queryKey: ['admin-membership-plans', restaurantId],
    queryFn: () => membershipService.getMembershipPlans(restaurantId),
  });
}

function useInvalidatePlans() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['admin-membership-plans', restaurantId] });
}

export function useCreateMembershipPlan() {
  const { restaurantId } = useRestaurant();
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: (payload: Partial<MembershipPlan>) => membershipService.createMembershipPlan(restaurantId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateMembershipPlan() {
  const { restaurantId } = useRestaurant();
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: ({ planId, payload }: { planId: string; payload: Partial<MembershipPlan> }) =>
      membershipService.updateMembershipPlan(restaurantId, planId, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteMembershipPlan() {
  const { restaurantId } = useRestaurant();
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: (planId: string) => membershipService.deleteMembershipPlan(restaurantId, planId),
    onSuccess: invalidate,
  });
}

export function useMembers() {
  const { restaurantId } = useRestaurant();
  return useQuery({
    queryKey: ['admin-members', restaurantId],
    queryFn: () => membershipService.getMembers(restaurantId),
  });
}

function useInvalidateMembers() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['admin-members', restaurantId] });
}

export function useCreateMember() {
  const { restaurantId } = useRestaurant();
  const invalidate = useInvalidateMembers();
  return useMutation({
    mutationFn: (payload: Partial<Member>) => membershipService.createMember(restaurantId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateMember() {
  const { restaurantId } = useRestaurant();
  const invalidate = useInvalidateMembers();
  return useMutation({
    mutationFn: ({ memberId, payload }: { memberId: string; payload: Partial<Member> }) =>
      membershipService.updateMember(restaurantId, memberId, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteMember() {
  const { restaurantId } = useRestaurant();
  const invalidate = useInvalidateMembers();
  return useMutation({
    mutationFn: (memberId: string) => membershipService.deleteMember(restaurantId, memberId),
    onSuccess: invalidate,
  });
}

export function useMemberCheckIns(memberId: string | undefined) {
  const { restaurantId } = useRestaurant();
  return useQuery({
    queryKey: ['admin-member-checkins', restaurantId, memberId],
    queryFn: () => membershipService.getMemberCheckIns(restaurantId, memberId as string),
    enabled: Boolean(memberId),
  });
}

export function useAddMemberCheckIn() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => membershipService.addMemberCheckIn(restaurantId, memberId),
    onSuccess: (_data, memberId) =>
      queryClient.invalidateQueries({ queryKey: ['admin-member-checkins', restaurantId, memberId] }),
  });
}
