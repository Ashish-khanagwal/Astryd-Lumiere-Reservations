import { useState } from 'react';
import { Crown, PlusCircle, SquarePen, Trash2, LogIn } from 'lucide-react';
import {
  useMembershipPlans,
  useCreateMembershipPlan,
  useUpdateMembershipPlan,
  useDeleteMembershipPlan,
  useMembers,
  useCreateMember,
  useUpdateMember,
  useDeleteMember,
  useMemberCheckIns,
  useAddMemberCheckIn,
} from '../../hooks/api/useMembership';
import { useAdminToast } from '../../context/AdminToastContext';
import { DataTable } from '../../components/DataTable';
import { ToggleField } from '../../components/forms/ToggleField';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { TextField, TextareaField, SelectField } from '../../components/forms/Field';
import { TagInput } from '../../components/forms/TagInput';
import { MemberStatusBadge } from '../../components/MemberStatusBadge';
import { BILLING_INTERVAL_LABEL, MEMBER_STATUS_LABEL, formatCents } from './membershipMeta';
import type { Member, MemberStatus, MembershipBillingInterval, MembershipPlan } from '../../../types';

type Tab = 'plans' | 'members';

const EMPTY_PLAN: Partial<MembershipPlan> = {
  name: '',
  description: '',
  priceCents: 0,
  billingInterval: 'monthly',
  benefits: [],
  isActive: true,
};

const MEMBER_STATUS_OPTIONS: MemberStatus[] = ['active', 'paused', 'cancelled', 'expired'];
const BILLING_OPTIONS: MembershipBillingInterval[] = ['one_time', 'monthly', 'quarterly', 'yearly'];

export function MembershipPage() {
  const { data: plans, isLoading: isLoadingPlans } = useMembershipPlans();
  const createPlan = useCreateMembershipPlan();
  const updatePlan = useUpdateMembershipPlan();
  const deletePlan = useDeleteMembershipPlan();

  const { data: members, isLoading: isLoadingMembers } = useMembers();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  const { showToast } = useAdminToast();

  const [tab, setTab] = useState<Tab>('plans');

  const [planForm, setPlanForm] = useState<Partial<MembershipPlan> | null>(null);
  const [pendingDeletePlan, setPendingDeletePlan] = useState<MembershipPlan | null>(null);

  const [memberForm, setMemberForm] = useState<Partial<Member> | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [pendingDeleteMember, setPendingDeleteMember] = useState<Member | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | MemberStatus>('all');

  const selectedMember = members?.find((m) => m.id === selectedMemberId) ?? null;
  const { data: checkIns } = useMemberCheckIns(selectedMemberId ?? undefined);
  const addCheckIn = useAddMemberCheckIn();

  const planNameById = new Map((plans ?? []).map((p) => [p.id, p.name]));
  const filteredMembers = (members ?? []).filter((m) => statusFilter === 'all' || m.status === statusFilter);

  const handleSavePlan = async () => {
    if (!planForm?.name?.trim()) return;
    if (planForm.id) {
      await updatePlan.mutateAsync({ planId: planForm.id, payload: planForm });
      showToast('Plan updated.');
    } else {
      await createPlan.mutateAsync(planForm);
      showToast('Plan created.');
    }
    setPlanForm(null);
  };

  const handleSaveMember = async () => {
    if (!memberForm?.customerName?.trim() || !memberForm.planId) return;
    if (memberForm.id) {
      await updateMember.mutateAsync({ memberId: memberForm.id, payload: memberForm });
      showToast('Member updated.');
    } else {
      await createMember.mutateAsync(memberForm);
      showToast('Member added.');
    }
    setMemberForm(null);
  };

  const header = (
    <PageHeader
      icon={Crown}
      title="Membership"
      description="Manage plans and members - loyalty, gym membership, or a VIP club, depending on how this page is set up."
      actions={
        tab === 'plans' ? (
          <Button variant="primary" icon={PlusCircle} onClick={() => setPlanForm(EMPTY_PLAN)}>
            Add Plan
          </Button>
        ) : (
          <Button
            variant="primary"
            icon={PlusCircle}
            disabled={!plans?.length}
            onClick={() => setMemberForm({ planId: plans?.[0]?.id, startDate: new Date().toISOString().slice(0, 10) })}
          >
            Add Member
          </Button>
        )
      }
    />
  );

  return (
    <div className="space-y-6">
      {header}

      <div className="flex gap-2">
        <button
          onClick={() => setTab('plans')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            tab === 'plans' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/40 text-secondary hover:border-primary/40'
          }`}
        >
          Plans
        </button>
        <button
          onClick={() => setTab('members')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            tab === 'members' ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/40 text-secondary hover:border-primary/40'
          }`}
        >
          Members {members && members.length > 0 && `(${members.length})`}
        </button>
      </div>

      {tab === 'plans' ? (
        <DataTable
          rows={plans ?? []}
          rowKey={(p) => p.id}
          loading={isLoadingPlans}
          emptyMessage="No membership plans yet."
          columns={[
            { header: 'Plan', render: (p) => <span className="font-semibold text-on-surface">{p.name}</span> },
            { header: 'Price', render: (p) => <span className="font-medium">{formatCents(p.priceCents)}</span> },
            { header: 'Billing', render: (p) => <span className="text-secondary">{BILLING_INTERVAL_LABEL[p.billingInterval]}</span> },
            { header: 'Benefits', render: (p) => <span className="text-secondary text-xs">{p.benefits.join(' · ') || '—'}</span> },
            {
              header: 'Active',
              render: (p) => (
                <ToggleField label="" checked={p.isActive} onChange={(isActive) => updatePlan.mutate({ planId: p.id, payload: { isActive } })} />
              ),
            },
            {
              header: '',
              className: 'text-right',
              render: (p) => (
                <div className="flex gap-1.5 justify-end">
                  <button onClick={() => setPlanForm(p)} className="p-2 rounded-lg text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors" aria-label="Edit">
                    <SquarePen className="h-4 w-4" />
                  </button>
                  <button onClick={() => setPendingDeletePlan(p)} className="p-2 rounded-lg text-secondary hover:bg-error-container/40 hover:text-error transition-colors" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      ) : (
        <div className="space-y-4">
          <div className="admin-card p-4 flex flex-wrap gap-2">
            {(['all', ...MEMBER_STATUS_OPTIONS] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  statusFilter === s ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/40 text-secondary hover:border-primary/40'
                }`}
              >
                {s === 'all' ? 'All' : MEMBER_STATUS_LABEL[s]}
              </button>
            ))}
          </div>

          <DataTable
            rows={filteredMembers}
            rowKey={(m) => m.id}
            loading={isLoadingMembers}
            emptyMessage="No members yet."
            columns={[
              {
                header: 'Member',
                render: (m) => (
                  <button onClick={() => setSelectedMemberId(m.id)} className="font-semibold text-on-surface hover:text-primary transition-colors">
                    {m.customerName}
                  </button>
                ),
              },
              { header: 'Plan', render: (m) => <span className="text-secondary">{planNameById.get(m.planId) ?? '—'}</span> },
              { header: 'Status', render: (m) => <MemberStatusBadge status={m.status} /> },
              { header: 'Started', render: (m) => <span className="text-secondary">{new Date(m.startDate).toLocaleDateString()}</span> },
              {
                header: 'Next billing',
                render: (m) => <span className="text-secondary">{m.nextBillingDate ? new Date(m.nextBillingDate).toLocaleDateString() : '—'}</span>,
              },
              {
                header: '',
                className: 'text-right',
                render: (m) => (
                  <button onClick={() => setPendingDeleteMember(m)} className="p-2 rounded-lg text-secondary hover:bg-error-container/40 hover:text-error transition-colors" aria-label="Remove member">
                    <Trash2 className="h-4 w-4" />
                  </button>
                ),
              },
            ]}
          />
        </div>
      )}

      <Modal
        isOpen={Boolean(planForm)}
        onClose={() => setPlanForm(null)}
        title={planForm?.id ? 'Edit Plan' : 'New Plan'}
        footer={
          <>
            <Button variant="outline" onClick={() => setPlanForm(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSavePlan}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField label="Name" required value={planForm?.name ?? ''} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} />
          <TextareaField label="Description" rows={2} value={planForm?.description ?? ''} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Price ($)"
              type="number"
              step={0.01}
              value={((planForm?.priceCents ?? 0) / 100).toString()}
              onChange={(e) => setPlanForm({ ...planForm, priceCents: Math.round(Number(e.target.value) * 100) })}
            />
            <SelectField
              label="Billing"
              value={planForm?.billingInterval ?? 'monthly'}
              onChange={(e) => setPlanForm({ ...planForm, billingInterval: e.target.value as MembershipBillingInterval })}
            >
              {BILLING_OPTIONS.map((interval) => (
                <option key={interval} value={interval}>
                  {BILLING_INTERVAL_LABEL[interval]}
                </option>
              ))}
            </SelectField>
          </div>
          <TagInput label="Benefits" tags={planForm?.benefits ?? []} onChange={(benefits) => setPlanForm({ ...planForm, benefits })} maxTags={8} />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(pendingDeletePlan)}
        title="Delete plan?"
        description={`"${pendingDeletePlan?.name}" will be removed. Existing members on this plan won't be reassigned automatically.`}
        onCancel={() => setPendingDeletePlan(null)}
        onConfirm={async () => {
          if (pendingDeletePlan) {
            await deletePlan.mutateAsync(pendingDeletePlan.id);
            showToast('Plan deleted.');
          }
          setPendingDeletePlan(null);
        }}
      />

      <Modal
        isOpen={Boolean(memberForm)}
        onClose={() => setMemberForm(null)}
        title="Add Member"
        footer={
          <>
            <Button variant="outline" onClick={() => setMemberForm(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveMember}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField label="Name" required value={memberForm?.customerName ?? ''} onChange={(e) => setMemberForm({ ...memberForm, customerName: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Email" type="email" value={memberForm?.customerEmail ?? ''} onChange={(e) => setMemberForm({ ...memberForm, customerEmail: e.target.value })} />
            <TextField label="Phone" value={memberForm?.customerPhone ?? ''} onChange={(e) => setMemberForm({ ...memberForm, customerPhone: e.target.value })} />
          </div>
          <SelectField label="Plan" required value={memberForm?.planId ?? ''} onChange={(e) => setMemberForm({ ...memberForm, planId: e.target.value })}>
            {(plans ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Start date"
            type="date"
            value={memberForm?.startDate ?? ''}
            onChange={(e) => setMemberForm({ ...memberForm, startDate: e.target.value })}
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteMember)}
        title="Remove member?"
        description={`"${pendingDeleteMember?.customerName}" will be removed from this plan.`}
        onCancel={() => setPendingDeleteMember(null)}
        onConfirm={async () => {
          if (pendingDeleteMember) {
            await deleteMember.mutateAsync(pendingDeleteMember.id);
            showToast('Member removed.');
          }
          setPendingDeleteMember(null);
        }}
      />

      <Modal
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMemberId(null)}
        title={selectedMember?.customerName ?? ''}
        description={selectedMember ? planNameById.get(selectedMember.planId) : undefined}
        maxWidth="max-w-lg"
        footer={
          selectedMember && (
            <div className="flex flex-wrap gap-2 justify-end">
              {MEMBER_STATUS_OPTIONS.filter((s) => s !== selectedMember.status).map((s) => (
                <Button
                  key={s}
                  variant={s === 'cancelled' ? 'danger' : 'outline'}
                  size="sm"
                  loading={updateMember.isPending && updateMember.variables?.memberId === selectedMember.id && updateMember.variables?.payload.status === s}
                  onClick={() => updateMember.mutate({ memberId: selectedMember.id, payload: { status: s } })}
                >
                  Mark {MEMBER_STATUS_LABEL[s]}
                </Button>
              ))}
            </div>
          )
        }
      >
        {selectedMember && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Status</span>
              <MemberStatusBadge status={selectedMember.status} />
            </div>
            <div className="space-y-1.5 text-sm text-secondary">
              <div>{selectedMember.customerEmail}</div>
              {selectedMember.customerPhone && <div>{selectedMember.customerPhone}</div>}
              <div>Started {new Date(selectedMember.startDate).toLocaleDateString()}</div>
              {selectedMember.nextBillingDate && <div>Next billing {new Date(selectedMember.nextBillingDate).toLocaleDateString()}</div>}
              {selectedMember.notes && <div className="italic">"{selectedMember.notes}"</div>}
            </div>

            <div className="border-t border-outline-variant/10 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-on-surface">Check-ins</h4>
                <Button size="sm" variant="outline" icon={LogIn} loading={addCheckIn.isPending} onClick={() => addCheckIn.mutate(selectedMember.id)}>
                  Log check-in
                </Button>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto text-xs text-secondary">
                {(checkIns ?? []).length === 0 ? (
                  <p>No check-ins yet.</p>
                ) : (
                  checkIns!.map((c) => <div key={c.id}>{new Date(c.checkedInAt).toLocaleString()}</div>)
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
