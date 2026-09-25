import type { Id, ISODateString, Tenant, Timestamps } from './common';

export const MEMBERSHIP_BILLING_INTERVALS = ['one_time', 'monthly', 'quarterly', 'yearly'] as const;
export type MembershipBillingInterval = (typeof MEMBERSHIP_BILLING_INTERVALS)[number];

/** Multi-Vertical Platform Plan §3.2 - Loyalty/Rewards, Plan Tiers, or a VIP club, depending on the Site's chosen template variant (§8.4). */
export interface MembershipPlan extends Tenant, Timestamps {
  id: Id;
  name: string;
  description: string;
  priceCents: number;
  billingInterval: MembershipBillingInterval;
  benefits: string[];
  isActive: boolean;
  order: number;
}

export const MEMBER_STATUSES = ['active', 'paused', 'cancelled', 'expired'] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export interface Member extends Tenant, Timestamps {
  id: Id;
  planId: Id;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: MemberStatus;
  startDate: string; // "YYYY-MM-DD"
  nextBillingDate: string | null;
  notes?: string;
}

/** Mainly surfaced by the Gym-flavored template (§8.4 Variant B) but generic - any Site can log check-ins. */
export interface MemberCheckIn extends Tenant {
  id: Id;
  memberId: Id;
  checkedInAt: ISODateString;
}
