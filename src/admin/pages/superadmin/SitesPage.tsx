import { Building2 } from 'lucide-react';
import { useAllSitesForSuperAdmin, useUpdateSiteBrandingBadge } from '../../hooks/api/useSites';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { ToggleField } from '../../components/forms/ToggleField';
import { useAdminToast } from '../../context/AdminToastContext';

/** Multi-Vertical Platform Plan §5.2 - Super Admin only. Every Site across every Org, with the sole control for the "Powered by Astryd" footer badge. */
export function SuperAdminSitesPage() {
  const { data: sites, isLoading } = useAllSitesForSuperAdmin();
  const updateBadge = useUpdateSiteBrandingBadge();
  const { showToast } = useAdminToast();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Building2}
        title="Platform Sites"
        description="Every Site across every Organization on the platform. Only a Super Admin can see this list or control its 'Powered by Astryd' badge."
      />

      <DataTable
        rows={sites ?? []}
        rowKey={(s) => s.id}
        loading={isLoading}
        emptyMessage="No Sites on the platform yet."
        columns={[
          { header: 'Organization', render: (s) => <span className="font-semibold text-on-surface">{s.organizationName}</span> },
          { header: 'Site', render: (s) => s.name },
          { header: 'Status', render: (s) => <span className="capitalize text-secondary">{s.status}</span> },
          {
            header: 'Powered by Astryd',
            className: 'text-right',
            render: (s) => (
              <div className="flex justify-end">
                <ToggleField
                  label=""
                  checked={s.brandingBadgeEnabled}
                  onChange={(enabled) =>
                    updateBadge.mutate(
                      { siteId: s.id, enabled },
                      { onSuccess: () => showToast(enabled ? 'Badge shown on this Site.' : 'Badge hidden on this Site.') },
                    )
                  }
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
