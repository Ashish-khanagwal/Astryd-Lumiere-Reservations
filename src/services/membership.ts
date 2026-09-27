import { http } from './http';
import { mapCheckoutSession, paymentRequest } from './payments';
import type { CheckoutSession } from '../types';
import type { Member, MemberCheckIn, MembershipPlan } from '../types';

export const getMembershipPlans = (siteId: string) => http.get<MembershipPlan[]>(`/sites/${siteId}/membership/plans`);

export const createMembershipPlan = (siteId: string, payload: Partial<MembershipPlan>) =>
  http.post<MembershipPlan>(`/sites/${siteId}/membership/plans`, payload);

export const updateMembershipPlan = (siteId: string, planId: string, payload: Partial<MembershipPlan>) =>
  http.patch<MembershipPlan>(`/sites/${siteId}/membership/plans/${planId}`, payload);

export const deleteMembershipPlan = (siteId: string, planId: string) =>
  http.delete<{ message: string }>(`/sites/${siteId}/membership/plans/${planId}`);

export const getMembers = (siteId: string, email?: string) =>
  http.get<Member[]>(`/sites/${siteId}/membership/members${email ? `?email=${encodeURIComponent(email)}` : ''}`);

/** Public lookup - a guest looking up their own membership by email, scoped server-side (Multi-Vertical Platform Plan §8.4). */
export const findMemberByEmail = async (siteId: string, email: string): Promise<Member | undefined> => {
  if (import.meta.env.VITE_USE_MOCKS !== 'true') {
    const token = new URLSearchParams(window.location.search).get('memberToken');
    if (token) {
      const result = await http.post<{ member: Member; checkIns: MemberCheckIn[] }>(`/sites/${siteId}/membership/lookup/verify`, { token });
      privateCheckIns.set(result.member.id, result.checkIns);
      const url = new URL(window.location.href);
      url.searchParams.delete('memberToken');
      window.history.replaceState(null, '', url);
      return result.member;
    }
    const result = await http.post<{ message: string }>(`/sites/${siteId}/membership/lookup`, { email });
    throw new Error(result.message);
  }
  const matches = await getMembers(siteId, email);
  return matches[0];
};

export const createMember = (siteId: string, payload: Partial<Member>) =>
  http.post<Member>(`/sites/${siteId}/membership/members`, payload);

export async function createMembershipCheckout(siteId: string, payload: Partial<Member>): Promise<CheckoutSession> {
  const response = await paymentRequest<Parameters<typeof mapCheckoutSession>[0]>(`/sites/${encodeURIComponent(siteId)}/membership/checkout`, {
    method: 'POST', body: JSON.stringify(payload),
  });
  return mapCheckoutSession(response);
}

export const updateMember = (siteId: string, memberId: string, payload: Partial<Member>) =>
  http.patch<Member>(`/sites/${siteId}/membership/members/${memberId}`, payload);

export const deleteMember = (siteId: string, memberId: string) =>
  http.delete<{ message: string }>(`/sites/${siteId}/membership/members/${memberId}`);

const privateCheckIns = new Map<string, MemberCheckIn[]>();
export const getMemberCheckIns = (siteId: string, memberId: string) =>
  privateCheckIns.has(memberId) ? Promise.resolve(privateCheckIns.get(memberId)!) : http.get<MemberCheckIn[]>(`/sites/${siteId}/membership/members/${memberId}/check-ins`);

export const addMemberCheckIn = (siteId: string, memberId: string) =>
  http.post<MemberCheckIn>(`/sites/${siteId}/membership/members/${memberId}/check-ins`);
