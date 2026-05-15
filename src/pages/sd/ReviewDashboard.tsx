import React, { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Filter,
  MessageCircle,
  Paperclip,
  Search,
  Settings2,
  User,
  X,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { AssessmentRequest, DocumentItem, Status } from '../../types.ts';

interface ReviewDashboardProps {
  requests: AssessmentRequest[];
  onUpdate: (id: string, status: Status, additional?: Partial<AssessmentRequest>) => void;
}

type RequestView = 'list' | 'detail';
type ConfirmTab = 'visa' | 'remarks';
type VisaScope = 'Employment' | 'Dependent';
type VisaSection = 'person' | 'visaInfo' | 'materials';

const listRows = [
  { id: 'REQ-9330', candidate: 'jacky16', location: 'Singapore', status: 'Pending', step: 'N/A', submitter: 'SD-Jelena Zhang' },
  { id: 'REQ-9138', candidate: 'jacky16', location: 'Singapore', status: 'Processing', step: '2/4', submitter: 'SD-Jelena Zhang' },
  { id: 'REQ-8902', candidate: 'jacky16', location: 'Singapore', status: 'Processing', step: '2/4', submitter: 'SD-Jelena Zhang' },
  { id: 'REQ-8811', candidate: 'jacky16', location: 'Singapore', status: 'Canceled', step: 'N/A', submitter: 'SD-Jelena Zhang' },
  { id: 'REQ-7740', candidate: 'gelin2', location: 'Korea', status: 'Pending', step: 'N/A', submitter: 'SD-Jelena Zhang' },
  { id: 'REQ-6638', candidate: 'gelin2', location: 'Korea', status: 'Canceled', step: 'N/A', submitter: 'SD-Jelena Zhang' },
  { id: 'REQ-5527', candidate: 'Keely', location: 'China Mainland', status: 'Processing', step: '0/4', submitter: 'Client-Jelena' },
  { id: 'REQ-4432', candidate: 'Julian', location: 'Singapore', status: 'Processing', step: '2/4', submitter: 'Client-Jelena' },
  { id: 'REQ-3324', candidate: 'Julian', location: 'Singapore', status: 'Canceled', step: 'N/A', submitter: 'Client-Jelena' },
  { id: 'REQ-2219', candidate: 'Julian', location: 'Singapore', status: 'Canceled', step: 'N/A', submitter: 'SD-Jelena Zhang' },
];

const employmentVisaInfo: [string, string][] = [
  ['Employment Visa Type', 'Employment Pass'],
  ['Within the Issuing Country/Region?', 'Out of Country'],
  ['Country / Region at the time of Visa application', 'New Zealand'],
  ['Departure Country / Region before entering Visa Location', 'New Zealand'],
];

const dependentVisaInfo: [string, string][] = [
  ['Dependent Visa Type', 'Dependent Pass'],
  ['Relationship to Candidate', 'Spouse'],
  ['Country / Region at the time of Visa application', 'New Zealand'],
  ['Departure Country / Region before entering Visa Location', 'New Zealand'],
];

const dependentInfo: [string, string][] = [
  ['Dependent Name', 'Maya Ahmed'],
  ['Relationship', 'Spouse'],
  ['Nationality / Citizenship', 'EG-Egypt'],
  ['Current Residence', 'New Zealand'],
];

const timeline = [
  {
    id: 'current',
    date: '2026-05-15 14:13:08',
    actor: '[BIPO Service Delivery] SD-MichelleHou hou, SD-Jelena Zhang',
    action: 'Confirm Order [EoR - Onboarding]',
    state: 'active',
  },
  {
    id: 'submit',
    date: '2026-05-15 14:11:38',
    actor: '[Client Contact] Client-Jelena, Jelena1, jelena2',
    action: 'Submit order',
    state: 'done',
    meta: ['User: Submit Order', 'Completion Date: 2026-05-15 14:13:09'],
  },
  {
    id: 'return',
    date: '2026-05-14 17:08:19',
    actor: '[BIPO Service Delivery] SD-MichelleHou hou, SD-Jelena Zhang',
    action: 'Confirm Order [EoR - Onboarding]',
    state: 'done',
    meta: ['User: Return to Client', 'Completion Date: 2026-05-15 14:11:39'],
  },
  {
    id: 'created',
    date: '2026-05-14 17:08:13',
    actor: '[BIPO Service Delivery] SD-Jelena Zhang',
    action: 'Submit Request',
    state: 'done',
    meta: ['Completion Date: 2026-05-14 17:08:18'],
  },
];

export const ReviewDashboard = ({ requests, onUpdate }: ReviewDashboardProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('id');
  const [view, setView] = useState<RequestView>(selectedId ? 'detail' : 'list');
  const [activeId, setActiveId] = useState(selectedId || requests[0]?.id);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === activeId) || requests[0],
    [activeId, requests],
  );

  const openDetail = (id: string) => {
    setActiveId(id);
    setView('detail');
    setSearchParams({ id });
  };

  const backToList = () => {
    setView('list');
    setSearchParams({});
  };

  if (!selectedRequest) {
    return <div className="p-8 text-sm text-slate-500">No requests available.</div>;
  }

  return (
    <div className="flex-1 min-h-0 overflow-hidden bg-slate-50">
      {view === 'list' ? (
        <RequestsQueue requests={requests} onOpenDetail={openDetail} />
      ) : (
        <RequestDetail
          request={selectedRequest}
          onBack={backToList}
          onOpenConfirm={() => setIsConfirmOpen(true)}
        />
      )}

      {isConfirmOpen && (
        <ConfirmOrderModal
          request={selectedRequest}
          onClose={() => setIsConfirmOpen(false)}
          onReturn={() => {
            onUpdate(selectedRequest.id, Status.NeedMoreInformation);
            setIsConfirmOpen(false);
          }}
          onNext={() => {
            onUpdate(selectedRequest.id, Status.InAssessment);
            setIsConfirmOpen(false);
          }}
        />
      )}
    </div>
  );
};

const RequestsQueue = ({
  requests,
  onOpenDetail,
}: {
  requests: AssessmentRequest[];
  onOpenDetail: (id: string) => void;
}) => {
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
          <button className="h-9 rounded bg-brand-blue px-4 text-xs font-bold text-white">Submit Request</button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-3">
        <table className="w-full min-w-[1380px] text-sm">
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
              <th className="px-3 py-4">Operation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {listRows.map((row, index) => {
              const request = requests[index % requests.length];
              return (
                <tr key={row.id} className={index === 3 ? 'bg-slate-100/80' : 'bg-white'}>
                  <td className="px-3 py-4 text-slate-700">Zhappy</td>
                  <td className="px-3 py-4 text-slate-700">zhappy</td>
                  <td className="px-3 py-4 text-slate-700">{row.location}</td>
                  <td className="px-3 py-4 text-slate-700">EoR</td>
                  <td className="px-3 py-4 text-slate-700">Onboarding</td>
                  <td className="px-3 py-4 text-slate-700">Candidate: {row.candidate}...</td>
                  <td className="px-3 py-4 text-slate-700">
                    <span className="inline-flex items-center gap-1"><User size={13} />{row.submitter}</span>
                  </td>
                  <td className="px-3 py-4 text-slate-700">SD-MichelleHou hou, ...</td>
                  <td className="px-3 py-4 text-slate-700">LS-Jelena</td>
                  <td className="px-3 py-3">
                    <ProgressStatus status={row.status} step={row.step} />
                  </td>
                  <td className="px-3 py-4">
                    <button
                      onClick={() => onOpenDetail(request.id)}
                      className="text-xs font-medium text-brand-blue hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex h-12 items-center justify-center gap-4 border-t border-slate-200 bg-white text-xs text-slate-600">
        <span>Total 418</span>
        <button className="rounded border border-slate-200 px-4 py-2">30/page</button>
        <span className="font-bold text-brand-blue">1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
        <span>...</span>
        <span>14</span>
      </div>
    </div>
  );
};

const RequestDetail = ({
  request,
  onBack,
  onOpenConfirm,
}: {
  request: AssessmentRequest;
  onBack: () => void;
  onOpenConfirm: () => void;
}) => {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded border border-slate-200">
            <ArrowLeft size={16} />
          </button>
          <span className="text-sm font-bold text-slate-600">Request Info</span>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-blue text-[10px] font-bold text-white">i</span>
        </div>
        <button className="flex h-9 items-center gap-2 rounded border border-slate-200 px-4 text-xs font-bold">
          <MessageCircle size={14} />
          Request Chat
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-12 gap-3">
          <section className="col-span-12 overflow-hidden rounded border border-slate-200 lg:col-span-9">
            <PanelTitle>Records</PanelTitle>
            <div className="relative bg-slate-50 px-6 py-6">
              <div className="absolute bottom-8 left-[25px] top-8 w-px bg-slate-200" />
              <div className="space-y-9">
                {timeline.map((item) => (
                  <div key={item.id} className="relative flex gap-5">
                    <div className={`relative z-10 mt-1 h-3 w-3 rounded-full ${item.state === 'active' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="mb-3 text-sm text-slate-400">{item.date}</p>
                      <p className="text-sm font-bold text-slate-600">
                        <span className="font-medium text-brand-blue">{item.actor}</span> {item.action}
                      </p>
                      {item.meta?.map((line) => (
                        <p key={line} className="mt-2 text-sm text-slate-700">{line}</p>
                      ))}
                    </div>
                    {item.state === 'active' ? (
                      <div className="flex w-32 flex-col items-center gap-2">
                        <button
                          onClick={onOpenConfirm}
                          className="flex h-10 w-28 items-center justify-center gap-2 rounded bg-brand-blue text-sm font-bold text-white"
                        >
                          <ClipboardList size={15} />
                          Process
                        </button>
                        <button className="text-xs text-brand-blue">Not my task?</button>
                      </div>
                    ) : (
                      <button className="flex h-10 w-24 items-center justify-center gap-2 rounded border border-blue-200 bg-blue-50 text-sm font-bold text-brand-blue">
                        <Eye size={15} />
                        View
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="col-span-12 space-y-3 lg:col-span-3">
            <InfoCard title="Candidate Information">
              <InfoGrid
                rows={[
                  ['Name', request.candidateName],
                  ['Onboarding Date', '2025-01-01'],
                  ['Email Address', request.candidateEmail],
                  ['Nationality', request.nationality || 'EG-Egypt'],
                  ['Work Location', request.workLocation],
                ]}
              />
              <div className="mt-4 flex justify-end gap-3 text-xs text-brand-blue">
                <button>Export</button>
                <button>Details</button>
              </div>
            </InfoCard>

            <InfoCard title="Request Info">
              <InfoGrid
                rows={[
                  ['Request ID', '202605141708169330'],
                  ['Request Submitter', 'SD-Jelena Zhang'],
                  ['Submit Time', '2026-05-14 17:08:16'],
                  ['Location', request.workLocation],
                  ['Project Name', '-'],
                  ['Service Type', 'EoR'],
                  ['Service Module', 'Onboarding'],
                  ['Client/Client Code', 'Zhappy / zhappy'],
                  ['Client Contact', 'Client-Jelena, Jelena1, jelena2'],
                  ['BIPO Service Delivery', 'SD-MichelleHou hou, SD-Jelena Zhang'],
                ]}
              />
            </InfoCard>
          </aside>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 bg-white px-3 py-3">
        <button className="h-9 rounded border border-slate-200 px-7 text-sm font-bold">Export Request Info</button>
        <button className="h-9 rounded border border-red-200 bg-red-50 px-7 text-sm font-bold text-red-500">Withdraw Candidate</button>
        <button className="h-9 rounded border border-red-200 bg-red-50 px-7 text-sm font-bold text-red-500">Revoke Order</button>
        <button className="h-9 rounded border border-red-200 bg-red-50 px-7 text-sm font-bold text-red-500">Cancel Order</button>
      </div>
    </div>
  );
};

const ConfirmOrderModal = ({
  request,
  onClose,
  onReturn,
  onNext,
}: {
  request: AssessmentRequest;
  onClose: () => void;
  onReturn: () => void;
  onNext: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<ConfirmTab>('visa');
  const [activeScope, setActiveScope] = useState<VisaScope>('Employment');
  const [activeSection, setActiveSection] = useState<VisaSection>('person');

  const documents = request.documents.length > 0 ? request.documents : fallbackDocuments;
  const personRows: [string, string][] =
    activeScope === 'Employment'
      ? [
          ['Candidate Name', request.candidateName],
          ['Candidate Email', request.candidateEmail],
          ['Nationality / Citizenship', request.nationality],
          ['Current Residence', request.currentLocation],
          ['Job Title / Position', request.jobTitle],
          ['Salary', request.salary],
          ['Degree / Education Level', request.degree],
          ['Expected Start Date', request.expectedStartDate],
        ]
      : dependentInfo;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-10 py-8">
      <div className="flex max-h-[86vh] w-full max-w-[1700px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-slate-800">Confirm Order [EoR - Onboarding]</h2>
            <Link to="#" className="text-xs text-brand-blue">Request Info</Link>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="mx-5 mb-6 grid grid-cols-3 overflow-hidden rounded bg-slate-100 text-xs font-medium text-slate-300">
          {['Confirm Request Info', 'Confirm Visa Type', 'Confirm Onboarding Flow'].map((step, index) => (
            <div key={step} className={`relative flex h-10 items-center gap-3 px-5 ${index === 0 ? 'text-orange-500' : ''}`}>
              <span className={`h-4 w-4 rounded-full border-2 ${index === 0 ? 'border-orange-400' : 'border-slate-300'}`} />
              {step}
              {index < 2 && <span className="absolute right-0 h-7 w-7 rotate-45 border-r border-t border-slate-300 bg-slate-100" />}
            </div>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          <div className="flex gap-9 border-b border-slate-200">
            <TabButton active={activeTab === 'visa'} onClick={() => setActiveTab('visa')}>Visa Requirements</TabButton>
            <TabButton active={activeTab === 'remarks'} onClick={() => setActiveTab('remarks')}>Remark & Attachments</TabButton>
          </div>

          {activeTab === 'visa' ? (
            <div className="pt-8">
              <div className="grid grid-cols-2 gap-24 text-sm">
                <ReadOnlyField label="Is a visa application required?" value={request.visaRequired === false ? 'NO' : 'YES'} />
                <ReadOnlyField label="Visa Application Type" value="Employment + Dependent" />
              </div>

              <div className="mt-7 flex gap-10 border-b border-slate-200">
                {(['Employment', 'Dependent'] as VisaScope[]).map((scope) => (
                  <div key={scope}>
                    <TabButton
                      active={activeScope === scope}
                      onClick={() => {
                        setActiveScope(scope);
                        setActiveSection('person');
                      }}
                    >
                      {scope} Visa
                    </TabButton>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex gap-10 border-b border-slate-200">
                <TabButton active={activeSection === 'person'} onClick={() => setActiveSection('person')}>
                  {activeScope === 'Employment' ? 'Candidate Info' : 'Dependent Info'}
                </TabButton>
                <TabButton active={activeSection === 'visaInfo'} onClick={() => setActiveSection('visaInfo')}>Visa Info</TabButton>
                <TabButton active={activeSection === 'materials'} onClick={() => setActiveSection('materials')}>
                  <span className="inline-flex items-center gap-2">
                    <FileText size={15} />
                    Evaluation Materials
                  </span>
                </TabButton>
              </div>

              {activeSection === 'person' && <ReadOnlyGrid rows={personRows} />}
              {activeSection === 'visaInfo' && (
                <ReadOnlyGrid rows={activeScope === 'Employment' ? employmentVisaInfo : dependentVisaInfo} />
              )}
              {activeSection === 'materials' && <DocumentChecklist documents={documents} />}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 py-7 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-700">Remark</h3>
                <div className="min-h-32 rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {request.remark || 'Client noted that the candidate may relocate with a dependent applicant. SD should confirm whether both visa paths can be handled in the same onboarding flow.'}
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-700">Attachments</h3>
                <div className="space-y-3">
                  {documents.slice(0, 3).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded border border-slate-200 px-4 py-3 text-sm">
                      <span className="flex items-center gap-2 font-medium text-slate-700">
                        <Paperclip size={15} />
                        {doc.name}
                      </span>
                      <button className="text-brand-blue"><Download size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 bg-slate-50 px-4 py-3">
          <button onClick={onClose} className="h-10 rounded border border-slate-200 bg-white text-sm font-bold">Cancel</button>
          <button onClick={onReturn} className="h-10 rounded bg-brand-blue text-sm font-bold text-white">Return to Client</button>
          <button onClick={onNext} className="h-10 rounded bg-brand-blue text-sm font-bold text-white">Next</button>
        </div>
      </div>
    </div>
  );
};

const DateFilter = ({ label }: { label: string }) => (
  <button className="h-9 rounded border border-slate-200 px-4 text-left text-xs text-slate-400">
    {label}
  </button>
);

const ProgressStatus = ({ status, step }: { status: string; step: string }) => {
  const isProcessing = status === 'Processing';
  const isPending = status === 'Pending';

  return (
    <div className="w-36 space-y-2">
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${isPending ? 'w-full bg-amber-100' : isProcessing ? 'w-1/2 bg-brand-blue' : 'w-0 bg-slate-200'}`} />
      </div>
      <div className="flex justify-between text-sm text-slate-700">
        <span>{status}</span>
        <span>{step}</span>
      </div>
    </div>
  );
};

const PanelTitle = ({ children }: { children: string }) => (
  <div className="bg-brand-blue px-5 py-4 text-sm font-bold text-white">{children}</div>
);

const InfoCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="overflow-hidden rounded border border-slate-200">
    <PanelTitle>{title}</PanelTitle>
    <div className="bg-slate-50 p-5">{children}</div>
  </section>
);

const InfoGrid = ({ rows }: { rows: [string, string][] }) => (
  <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
    {rows.map(([label, value]) => (
      <div key={label}>
        <p className="mb-2 text-slate-400">{label}:</p>
        <p className="break-words font-medium text-slate-700">{value}</p>
      </div>
    ))}
  </div>
);

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`relative pb-3 text-sm font-bold ${active ? 'text-brand-blue' : 'text-slate-600'}`}
  >
    {children}
    {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-blue" />}
  </button>
);

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="mb-4 text-sm text-slate-500">{label}</p>
    <p className="text-sm font-medium text-slate-900">{value}</p>
  </div>
);

const ReadOnlyGrid = ({ rows }: { rows: [string, string][] }) => (
  <div className="grid grid-cols-1 gap-x-24 gap-y-7 py-8 md:grid-cols-2">
    {rows.map(([label, value]) => (
      <div key={label}>
        <ReadOnlyField label={label} value={value || '-'} />
      </div>
    ))}
  </div>
);

const DocumentChecklist = ({ documents }: { documents: DocumentItem[] }) => (
  <div className="py-6">
    <table className="w-full text-sm">
      <thead className="border-y border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
        <tr>
          <th className="px-4 py-3">Evaluation Material</th>
          <th className="px-4 py-3">Required</th>
          <th className="px-4 py-3">Upload Status</th>
          <th className="px-4 py-3 text-right">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {documents.map((doc) => (
          <tr key={doc.id}>
            <td className="px-4 py-4 font-medium text-slate-800">{doc.name}</td>
            <td className="px-4 py-4 text-slate-600">{doc.isRequired ? 'Required' : 'Optional'}</td>
            <td className="px-4 py-4">
              <span className={`inline-flex items-center gap-1 text-xs font-bold ${doc.status === 'Uploaded' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {doc.status === 'Uploaded' && <CheckCircle2 size={14} />}
                {doc.status}
              </span>
            </td>
            <td className="px-4 py-4 text-right">
              <button className="rounded border border-blue-200 px-3 py-1.5 text-xs font-bold text-brand-blue">View</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const fallbackDocuments: DocumentItem[] = [
  { id: 'fallback-1', name: 'Passport Bio Page', isRequired: true, status: 'Uploaded', lastUpdated: '2026-05-14' },
  { id: 'fallback-2', name: 'Resume / CV', isRequired: true, status: 'Uploaded', lastUpdated: '2026-05-14' },
  { id: 'fallback-3', name: 'Degree Certificate', isRequired: true, status: 'Missing' },
  { id: 'fallback-4', name: 'Existing Visa / Residence Permit', isRequired: false, status: 'Not uploaded' },
];
