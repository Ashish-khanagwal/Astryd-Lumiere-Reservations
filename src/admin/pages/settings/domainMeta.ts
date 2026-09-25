import type { DomainSslStatus, DomainVerificationStatus } from '../../../types';

export const VERIFICATION_STATUS_LABEL: Record<DomainVerificationStatus, string> = {
  pending: 'Checking DNS…',
  verified: 'Verified',
  failed: 'Failed',
};

export const SSL_STATUS_LABEL: Record<DomainSslStatus, string> = {
  pending: 'SSL pending',
  issued: 'SSL issued',
  failed: 'SSL failed',
};

/** Alpha-tinted fill + solid border/text in the same hue - mirrors MemberStatusBadge's color mapping. */
export const STATUS_COLOR: Record<DomainVerificationStatus | DomainSslStatus, { fill: string; border: string; text: string; dot: string }> = {
  pending: { fill: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  verified: { fill: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  issued: { fill: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  failed: { fill: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
};
