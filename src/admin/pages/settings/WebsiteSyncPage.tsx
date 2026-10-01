import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRestaurant } from '../../../context/RestaurantContext';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import {
  getMainCandidates, getWebsiteSync, getWebsiteSyncStatus, getWebsiteTables,
  linkMainOrganization, saveWebsiteSiteMapping,
  type MainOrganization, type SiteMapping, type WebsiteSyncState,
} from '../../../services/websiteSync';

const emptyMapping: SiteMapping = {
  locationId: '', utcOffset: '+00:00', tableMappings: {}, durationMinutes: 120, kdsEnabled: false,
};

export function WebsiteSyncPage() {
  const { organizationId } = useRestaurant();
  const [state, setState] = useState<WebsiteSyncState | null>(null);
  const [candidates, setCandidates] = useState<MainOrganization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [tables, setTables] = useState<Array<{ id: string; name: string; capacity: number }>>([]);
  const [mapping, setMapping] = useState<SiteMapping>(emptyMapping);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const refresh = useCallback(async () => {
    const [current, matches, status] = await Promise.all([
      getWebsiteSync(organizationId), getMainCandidates(organizationId), getWebsiteSyncStatus(organizationId),
    ]);
    if (!current.link && matches.organizations.length === 1) {
      await linkMainOrganization(organizationId, matches.organizations[0].id);
      current.link = (await getWebsiteSync(organizationId)).link;
    }
    setState(current);
    setCandidates(matches.organizations);
    setCounts(status.counts);
    setSelectedOrg(current.link?.mainOrgId ?? (matches.organizations.length === 1 ? matches.organizations[0].id : ''));
    setSelectedSite((before) => before || current.sites[0]?.restaurantId || '');
  }, [organizationId]);

  useEffect(() => {
    refresh().catch((caught: Error) => setError(caught.message));
  }, [refresh]);

  useEffect(() => {
    if (!selectedSite || !state) return;
    setMapping(state.link?.sites?.[selectedSite] ?? { ...emptyMapping, tableMappings: {} });
    getWebsiteTables(organizationId, selectedSite)
      .then((response) => setTables(response.tables))
      .catch(() => setTables([]));
  }, [organizationId, selectedSite, state]);

  const chosenOrg = candidates.find((candidate) => candidate.id === (state?.link?.mainOrgId || selectedOrg));
  const site = state?.sites.find((entry) => entry.restaurantId === selectedSite);

  const link = async () => {
    setBusy(true); setError(''); setMessage('');
    try {
      await linkMainOrganization(organizationId, selectedOrg);
      await refresh();
      setMessage('Organizations linked. Configure each Site to begin syncing.');
    } catch (caught) {
      setError((caught as Error).message);
    } finally { setBusy(false); }
  };

  const save = async () => {
    setBusy(true); setError(''); setMessage('');
    try {
      await saveWebsiteSiteMapping(organizationId, selectedSite, mapping);
      await refresh();
      setMessage('Site mapping saved. Existing orders and bookings are queued for sync.');
    } catch (caught) {
      setError((caught as Error).message);
    } finally { setBusy(false); }
  };

  return <div className="space-y-6">
    <PageHeader icon={RefreshCw} title="Astryd Main sync" description="Connect your website Sites to the matching Astryd Main organization and POS location." />
    {error && <p role="alert" className="rounded-lg bg-error-container/40 p-3 text-error">{error}</p>}
    {message && <p role="status" className="rounded-lg bg-primary/10 p-3 text-on-surface">{message}</p>}
    <section className="rounded-xl border border-outline/20 bg-surface p-5 space-y-4">
      <h2 className="font-semibold text-on-surface">Organization</h2>
      {state?.link ? <p className="text-secondary">Linked to {state.link.mainOrgName} ({state.link.mainOrgId})</p> : <>
        <p className="text-secondary">Matches use your owner email. If you own several organizations, choose the correct one.</p>
        <select aria-label="Astryd Main organization" className="w-full rounded-lg border border-outline/30 bg-surface p-2" value={selectedOrg} onChange={(event) => setSelectedOrg(event.target.value)}>
          <option value="">Select an organization</option>
          {candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
        </select>
        <Button variant="primary" onClick={link} disabled={!selectedOrg || busy}>Link organization</Button>
      </>}
    </section>
    {state?.link && <section className="rounded-xl border border-outline/20 bg-surface p-5 space-y-4">
      <h2 className="font-semibold text-on-surface">Site mapping</h2>
      <select aria-label="Website Site" className="w-full rounded-lg border border-outline/30 bg-surface p-2" value={selectedSite} onChange={(event) => setSelectedSite(event.target.value)}>
        {state.sites.map((entry) => <option key={entry.restaurantId} value={entry.restaurantId}>{entry.name} · {entry.vertical}</option>)}
      </select>
      <label className="block space-y-1 text-sm text-secondary">POS location
        <select className="w-full rounded-lg border border-outline/30 bg-surface p-2" value={mapping.locationId} onChange={(event) => setMapping({ ...mapping, locationId: event.target.value })}>
          <option value="">Select a location</option>
          {chosenOrg?.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
        </select>
      </label>
      <label className="block space-y-1 text-sm text-secondary">Site UTC offset (for example +05:30)
        <input className="w-full rounded-lg border border-outline/30 bg-surface p-2" value={mapping.utcOffset} onChange={(event) => setMapping({ ...mapping, utcOffset: event.target.value })} />
      </label>
      <label className="block space-y-1 text-sm text-secondary">Booking duration in minutes
        <input type="number" min="1" max="1440" className="w-full rounded-lg border border-outline/30 bg-surface p-2" value={mapping.durationMinutes} onChange={(event) => setMapping({ ...mapping, durationMinutes: Number(event.target.value) })} />
      </label>
      <label className="flex items-center gap-2 text-sm text-secondary"><input type="checkbox" checked={mapping.kdsEnabled} onChange={(event) => setMapping({ ...mapping, kdsEnabled: event.target.checked })} /> Route paid orders to KDS</label>
      {site?.vertical === 'restaurant' && <div className="space-y-2">
        <h3 className="font-medium text-on-surface">Map website tables to POS tables</h3>
        {tables.map((table) => <label key={table.id} className="flex items-center justify-between gap-4 text-sm text-secondary">
          <span>{table.name} (capacity {table.capacity})</span>
          <select aria-label={`POS table for ${table.name}`} className="rounded-lg border border-outline/30 bg-surface p-2" value={mapping.tableMappings[table.id] ?? ''} onChange={(event) => setMapping({ ...mapping, tableMappings: { ...mapping.tableMappings, [table.id]: Number(event.target.value) } })}>
            <option value="">Select table</option>
            {Array.from({ length: 30 }, (_, index) => index + 1).map((number) => <option key={number} value={number}>Table {number}</option>)}
          </select>
        </label>)}
      </div>}
      <Button variant="primary" onClick={save} disabled={!selectedSite || !mapping.locationId || busy}>Save mapping</Button>
    </section>}
    <section className="rounded-xl border border-outline/20 bg-surface p-5 text-sm text-secondary">
      <h2 className="mb-2 font-semibold text-on-surface">Sync status</h2>
      <p>Delivered: {counts.delivered ?? 0} · Pending: {counts.pending ?? 0} · Table conflicts: {counts.conflict ?? 0}</p>
    </section>
  </div>;
}
