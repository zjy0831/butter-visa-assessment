import { Status } from '../../types.ts';

export const StatusBadge = ({ status }: { status: Status }) => {
  const configs: Record<Status, string> = {
    [Status.Draft]: 'bg-slate-100 text-slate-600',
    [Status.Submitted]: 'bg-blue-50 text-blue-600',
    [Status.InAssessment]: 'bg-amber-50 text-amber-600',
    [Status.NeedMoreInformation]: 'bg-orange-50 text-orange-600',
    [Status.Approved]: 'bg-emerald-50 text-emerald-600',
    [Status.Rejected]: 'bg-rose-50 text-rose-600',
    [Status.ConvertedToOnboarding]: 'bg-indigo-50 text-indigo-600',
    [Status.Cancelled]: 'bg-slate-100 text-slate-500',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${configs[status]}`}>
      {status}
    </span>
  );
};
