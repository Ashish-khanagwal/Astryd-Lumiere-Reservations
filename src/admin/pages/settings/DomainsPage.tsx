import { useState } from 'react';
import { Globe, PlusCircle, RefreshCw, Trash2 } from 'lucide-react';
import { useAddDomain, useDeleteDomain, useDomains, useVerifyDomain } from '../../hooks/api/useDomains';
import { useAdminToast } from '../../context/AdminToastContext';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { TextField } from '../../components/forms/Field';
import { ListSkeleton } from '../../components/Skeleton';
import { ApiError } from '../../../services/http';
import { STATUS_COLOR, VERIFICATION_STATUS_LABEL, SSL_STATUS_LABEL } from './domainMeta';
import type { DomainMapping, DomainSslStatus, DomainVerificationStatus } from '../../../types';

function StatusPill({ status, label }: { status: DomainVerificationStatus | DomainSslStatus; label: string }) {
  const c = STATUS_COLOR[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.fill} ${c.border} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot} ${status === 'pending' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

export function DomainsPage() {
  const { data: domains, isLoading } = useDomains();
  const addDomain = useAddDomain();
  const verifyDomain = useVerifyDomain();
  const deleteDomain = useDeleteDomain();
  const { showToast } = useAdminToast();
  const [hostname, setHostname] = useState('');
  const [pendingDelete, setPendingDelete] = useState<DomainMapping | null>(null);

  const header = (
    <PageHeader
      icon={Globe}
      title="Domains"
      description="Point a domain you already own at this Site. Paste the record into your registrar, then we verify DNS and issue SSL automatically - no manual step required."
    />
  );

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        {header}
        <ListSkeleton rows={2} />
      </div>
    );
  }

  const handleAdd = async () => {
    const trimmed = hostname.trim().toLowerCase();
    if (!trimmed) return;
    try {
      await addDomain.mutateAsync(trimmed);
      setHostname('');
      showToast('Domain added - add the DNS record below to verify it.');
    } catch (error: unknown) {
      showToast(error instanceof ApiError ? error.message : 'Unable to add that domain.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {header}

      <div className="admin-card p-5">
        <h3 className="text-sm font-bold text-on-surface mb-3">Add a custom domain</h3>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
          <TextField
            wrapperClassName="flex-1"
            placeholder="www.yoursite.com"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button variant="primary" icon={PlusCircle} loading={addDomain.isPending} onClick={handleAdd}>
            Add domain
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {(domains ?? []).map((domain) => (
          <div key={domain.id} className="admin-card p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-on-surface">{domain.hostname}</span>
                  {domain.type === 'platform_subdomain' && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-surface-container-high px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <StatusPill status={domain.verificationStatus} label={VERIFICATION_STATUS_LABEL[domain.verificationStatus]} />
                  <StatusPill status={domain.sslStatus} label={SSL_STATUS_LABEL[domain.sslStatus]} />
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {domain.type === 'custom_domain' && domain.verificationStatus !== 'verified' && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={RefreshCw}
                    loading={verifyDomain.isPending}
                    onClick={() =>
                      verifyDomain.mutate(domain.id, {
                        onSuccess: () => showToast('Domain verified - SSL issued.'),
                      })
                    }
                  >
                    Verify now
                  </Button>
                )}
                {domain.type === 'custom_domain' && (
                  <button
                    onClick={() => setPendingDelete(domain)}
                    aria-label="Remove domain"
                    className="p-2 rounded-lg text-secondary hover:bg-error-container/40 hover:text-error transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {domain.type === 'custom_domain' && domain.verificationStatus !== 'verified' && (
              <div className="mt-4 pt-4 border-t border-outline-variant/10">
                <p className="text-xs text-secondary mb-2">
                  Add this record at your domain registrar. It usually verifies within a few minutes of the record going live.
                </p>
                <div className="rounded-xl border border-outline-variant/20 overflow-hidden">
                  <div className="grid grid-cols-3 gap-4 px-4 py-2 bg-surface-container-low text-[11px] font-bold uppercase tracking-wide text-secondary">
                    <span>Type</span>
                    <span>Name</span>
                    <span>Value</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm font-mono">
                    <span>{domain.recordType}</span>
                    <span>{domain.recordName}</span>
                    <span className="truncate">{domain.recordValue}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Remove domain?"
        description={`"${pendingDelete?.hostname}" will stop pointing at this Site. Your default platform domain keeps working.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) {
            await deleteDomain.mutateAsync(pendingDelete.id);
            showToast('Domain removed.');
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
