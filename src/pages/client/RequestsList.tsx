import { Link, useNavigate } from 'react-router-dom';
import { Filter, Search, Settings2, User, X } from 'lucide-react';
import { AssessmentRequest, Status } from '../../types.ts';

interface RequestsListProps {
  requests: AssessmentRequest[];
}

export const RequestsList = ({ requests }: RequestsListProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-3 pt-4">
        <div className="flex items-center gap-9 text-sm font-bold text-slate-700">
          {['Contractor', 'EoR', 'GPO', 'Work Visa'].map((tab) => (
            <button
              key={tab}
              className={`border-b-2 px-1 pb-3 ${tab === 'EoR' ? 'border-brand-blue text-brand-blue' : 'border-transparent'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-3 py-6">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <div className="flex h-9 w-[300px] items-center overflow-hidden rounded border border-slate-200 bg-white">
            <input
              className="h-full min-w-0 flex-1 px-3 text-xs outline-none"
              placeholder="Search Request ID, Client, Client Code"
            />
            <button className="flex h-full w-12 items-center justify-center border-l border-slate-200 text-slate-500">
              <Search size={15} />
            </button>
          </div>
          <DateFilter label="Submit Time Start" />
          <span className="text-slate-400">~</span>
          <DateFilter label="Submit Time End" />
          <button className="h-9 rounded border border-slate-200 px-4 text-xs font-bold text-slate-700">More filters (0)</button>
          {['Manual', 'Auto', 'PSC', 'Onboarding'].map((item) => (
            <button key={item} className="flex h-6 items-center gap-1 rounded border border-slate-300 px-2 text-xs text-slate-700">
              <Filter size={11} />
              {item}
              <X size={11} />
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button className="flex h-9 items-center gap-2 rounded border border-slate-200 px-4 text-xs font-bold">
            <Settings2 size={14} />
            Column Setting
          </button>
          <button className="h-9 rounded border border-slate-200 px-4 text-xs font-bold">Export</button>
          <button
            onClick={() => navigate('/requests/submit')}
            className="h-9 rounded bg-brand-blue px-4 text-xs font-bold text-white"
          >
            Submit Request
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-3">
        <table className="w-full min-w-[1480px] text-sm">
          <thead className="bg-slate-100 text-left text-xs font-bold text-slate-700">
            <tr>
              <th className="px-3 py-4">Client</th>
              <th className="px-3 py-4">Client Code</th>
              <th className="px-3 py-4">Location</th>
              <th className="px-3 py-4">Service Type</th>
              <th className="px-3 py-4">Service Module</th>
              <th className="px-3 py-4">Request Content</th>
              <th className="px-3 py-4">Submitter</th>
              <th className="px-3 py-4">BIPO Service Delivery</th>
              <th className="px-3 py-4">Local Service Contact</th>
              <th className="px-3 py-4">Status</th>
              <th className="px-3 py-4">Pending Task</th>
              <th className="px-3 py-4">Operation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {requests.map((request) => (
              <tr key={request.id} className="bg-white">
                <td className="px-3 py-4 text-slate-700">{request.client}</td>
                <td className="px-3 py-4 text-slate-700">{request.client.toLowerCase().replace(/\s+/g, '_')}</td>
                <td className="px-3 py-4 text-slate-700">{request.workLocation}</td>
                <td className="px-3 py-4 text-slate-700">EoR</td>
                <td className="px-3 py-4 text-slate-700">Onboarding</td>
                <td className="px-3 py-4 text-slate-700">Candidate: {request.candidateName}...</td>
                <td className="px-3 py-4 text-slate-700">
                  <span className="inline-flex items-center gap-1"><User size={13} />SD-Jelena Zhang</span>
                </td>
                <td className="px-3 py-4 text-slate-700">SD-MichelleHou hou, SD-Jelena Zhang</td>
                <td className="px-3 py-4 text-slate-700">LS-Jelena</td>
                <td className="px-3 py-3">
                  <ProgressStatus request={request} />
                </td>
                <td className="max-w-[260px] px-3 py-4 text-slate-700">
                  <span className="line-clamp-1">{request.currentTask}</span>
                </td>
                <td className="px-3 py-4">
                  <Link
                    to={`/requests/detail?id=${request.id}`}
                    className="text-xs font-medium text-brand-blue hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex h-12 items-center justify-center gap-4 border-t border-slate-200 bg-white text-xs text-slate-600">
        <span>Total {requests.length}</span>
        <button className="rounded border border-slate-200 px-4 py-2">30/page</button>
        <span className="font-bold text-brand-blue">1</span>
      </div>
    </div>
  );
};

const DateFilter = ({ label }: { label: string }) => (
  <button className="h-9 rounded border border-slate-200 px-4 text-left text-xs text-slate-400">
    {label}
  </button>
);

const ProgressStatus = ({ request }: { request: AssessmentRequest }) => {
  const isProcessing = request.status === Status.Processing;
  const isPending = request.status === Status.Pending;
  const step = isProcessing ? '2/4' : 'N/A';

  return (
    <div className="group relative w-36 space-y-2">
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${isPending ? 'w-full bg-amber-100' : isProcessing ? 'w-1/2 bg-brand-blue' : 'w-0 bg-slate-200'}`} />
      </div>
      <div className="flex justify-between text-sm text-slate-700">
        <span>{request.status}</span>
        <span>{step}</span>
      </div>
      <div className="pointer-events-none absolute right-0 top-full z-30 mt-2 hidden w-[520px] rounded border border-slate-200 bg-white p-4 text-sm shadow-xl group-hover:block">
        <div className="mb-3 border-b border-slate-200 pb-3 text-slate-600">
          Request Status: <span className="font-medium text-amber-500">{request.status} ( {step} )</span>
        </div>
        <p className="mb-2 text-slate-600">
          Pending Task Name: <span className="font-medium text-slate-700">{request.currentTask}</span>
        </p>
        <p className="text-slate-600">
          Pending Task Assignee: <span className="font-medium text-slate-700">{request.pendingAssignee || 'N/A'}</span>
        </p>
      </div>
    </div>
  );
};
