import { KeyRound, Mail, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { http } from '../../../services/http';
import { useAuth } from '../../../context/AuthContext';
import { PageHeader } from '../../components/PageHeader';
import { SectionCard } from '../../components/SectionCard';
import { StatusPill } from '../../components/StatusPill';

export function AccountPage() {
  const { user } = useAuth();
  const initials = user?.name?.[0] ?? '?';
  const [verificationMessage, setVerificationMessage] = useState('');
  const [sending, setSending] = useState(false);
  const resendVerification = async () => {
    setSending(true);
    try {
      const response = await http.post<{ message: string }>('/auth/resend-verification');
      setVerificationMessage(response.message);
    } catch (error) {
      setVerificationMessage(error instanceof Error ? error.message : 'Unable to request verification.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader icon={UserIcon} title="Account" description="Your admin panel identity and access level." />

      <SectionCard>
        <div className="flex items-center gap-4 pb-5 mb-5 border-b border-outline-variant/10">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary text-2xl font-bold">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold text-on-surface truncate tracking-tight">{user?.name}</div>
            <div className="text-sm text-secondary truncate">{user?.email}</div>
          </div>
          <StatusPill label={(user?.role ?? '').replace('_', ' ')} tone={user?.role === 'owner' || user?.role === 'super_admin' ? 'positive' : 'neutral'} />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-secondary">
              <UserIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-secondary uppercase tracking-wide">Name</div>
              <div className="text-sm text-on-surface font-medium mt-0.5">{user?.name}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-secondary">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-secondary uppercase tracking-wide">Email</div>
              <div className="text-sm text-on-surface font-medium mt-0.5">{user?.email}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-secondary">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-secondary uppercase tracking-wide">Role</div>
              <div className="text-sm text-on-surface font-medium mt-0.5 capitalize">{user?.role.replace('_', ' ')}</div>
            </div>
          </div>
        </div>
      </SectionCard>

      {user?.emailVerified === false && (
        <SectionCard>
          <p className="text-sm text-secondary">Verify your email before publishing your site.</p>
          <button type="button" disabled={sending} onClick={resendVerification} className="mt-3 text-sm font-bold text-primary disabled:opacity-50">
            {sending ? 'Requesting…' : 'Resend verification email'}
          </button>
          {verificationMessage && <p role="status" className="mt-2 text-sm text-secondary">{verificationMessage}</p>}
        </SectionCard>
      )}

      <div className="flex items-start gap-2.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/20 p-4">
        <KeyRound className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
        <p className="text-xs text-secondary">Use the "Forgot password" flow on the login screen to request a password reset link.</p>
      </div>
    </div>
  );
}
