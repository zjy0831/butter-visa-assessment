import { Status } from '../../types.ts';

export const StatusBadge = ({ status }: { status: Status }) => {
  const configs: Record<Status, string> = {
    [Status.Pending]: 'bg-amber-50 text-amber-700',
    [Status.Processing]: 'bg-blue-50 text-blue-700',
    [Status.Revoked]: 'bg-slate-100 text-slate-600',
    [Status.Canceled]: 'bg-slate-100 text-slate-500',
    [Status.Closed]: 'bg-rose-50 text-rose-700',
    [Status.Completed]: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${configs[status]}`}>
      {status}
    </span>
  );
};
