const statusColors: Record<string, string> = {
  RECEIVED: 'bg-slate-100 text-slate-700',
  VALIDATING: 'bg-secondary-100 text-secondary-700',
  VALIDATION_FAILED: 'bg-red-100 text-red-700',
  QUEUED: 'bg-amber-100 text-amber-800',
  SUBMITTED: 'bg-secondary-100 text-secondary-700',
  PENDING_CLEARANCE: 'bg-amber-100 text-amber-800',
  CLEARED: 'bg-primary-100 text-primary-800',
  REJECTED: 'bg-red-100 text-red-700',
  DRAFT: 'bg-slate-100 text-slate-600',
  REGISTERED: 'bg-secondary-100 text-secondary-700',
  ERP_CONNECTED: 'bg-secondary-100 text-secondary-700',
  SUBSCRIBED: 'bg-primary-100 text-primary-700',
  ACTIVE: 'bg-primary-100 text-primary-800',
  OK: 'bg-primary-100 text-primary-800',
  connected: 'bg-primary-100 text-primary-800',
  pending: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] || 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
