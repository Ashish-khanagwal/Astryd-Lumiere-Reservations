import { MEMBER_STATUS_COLOR, MEMBER_STATUS_LABEL } from '../pages/membership/membershipMeta';
import type { MemberStatus } from '../../types';

interface MemberStatusBadgeProps {
  status: MemberStatus;
}

export function MemberStatusBadge({ status }: MemberStatusBadgeProps) {
  const c = MEMBER_STATUS_COLOR[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.fill} ${c.border} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {MEMBER_STATUS_LABEL[status]}
    </span>
  );
}
