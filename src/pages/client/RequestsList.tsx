import { Link } from 'react-router-dom';
import { UserPlus, FileText } from 'lucide-react';
import { AssessmentRequest } from '../../types.ts';
import { StatusBadge } from '../../components/UI/StatusBadge.tsx';

interface RequestsListProps {
  requests: AssessmentRequest[];
}

export const RequestsList = ({ requests }: RequestsListProps) => {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto w-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Requests</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and track your EOR onboarding and visa assessment requests.</p>
        </div>
        <Link 
          to="/requests/submit"
          className="bg-brand-blue text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
        >
          <UserPlus size={18} />
          Submit Request
        </Link>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr className="text-left">
              <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px]">Client</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px]">Location</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px]">Candidate</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px]">Status</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] text-right">Operation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map(req => (
              <tr key={req.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-slate-900 font-bold">{req.client}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <FileText size={14} className="text-slate-400" />
                    {req.workLocation}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900">{req.candidateName}</p>
                  <p className="text-[10px] text-slate-400 font-medium tracking-tight uppercase">{req.id}</p>
                </td>
                <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                <td className="px-6 py-4 text-right">
                  <Link to={`/sd/review?id=${req.id}`} className="text-brand-blue font-bold hover:underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
