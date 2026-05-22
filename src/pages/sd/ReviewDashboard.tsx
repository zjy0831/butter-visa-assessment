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
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AssessmentRequest, DocumentItem, Status } from '../../types.ts';

interface ReviewDashboardProps {
  requests: AssessmentRequest[];
  onUpdate: (id: string, status: Status, additional?: Partial<AssessmentRequest>) => void;
  role?: 'sd' | 'client';
}

type RequestView = 'list' | 'detail';
type ConfirmTab = 'candidate' | 'visa' | 'remarks';
type AssessmentTab = 'candidate' | 'visa' | 'remarks';
type ConfirmStep = 'requestInfo' | 'visaType';
type VisaScope = 'Employment' | 'Dependent';
type VisaSection = 'person' | 'visaInfo' | 'materials' | 'checklist';
type TimelineItem = {
  id: string;
  date: string;
  actor: string;
  action: string;
  state: 'active' | 'done';
  meta?: string[];
};

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

export const ReviewDashboard = ({ requests, onUpdate, role = 'sd' }: ReviewDashboardProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('id');
  const [view, setView] = useState<RequestView>(selectedId ? 'detail' : 'list');
  const [activeId, setActiveId] = useState(selectedId || requests[0]?.id);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);

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

  const handleProcess = () => {
    if (!selectedRequest) return;

    if (selectedRequest.currentTask === 'Confirm Visa Assessment') {
      setIsAssessmentOpen(true);
      return;
    }

    if (selectedRequest.currentTask === 'Confirm Order [EoR - Onboarding]') {
      setIsConfirmOpen(true);
      return;
    }

    if (selectedRequest.currentTask === 'Supplement Assessment Materials') {
      navigate(`/requests/submit?mode=supplement&id=${selectedRequest.id}`);
      return;
    }

    if (selectedRequest.currentTask === 'Complete Onboarding Info') {
      navigate(`/requests/submit?mode=complete&id=${selectedRequest.id}`);
      return;
    }

    if (selectedRequest.currentTask === 'Submit Order') {
      navigate(`/requests/submit?mode=submit&id=${selectedRequest.id}`);
    }
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
          role={role}
          onBack={backToList}
          onProcess={handleProcess}
        />
      )}

      {isAssessmentOpen && (
        <AssessmentModal
          request={selectedRequest}
          onClose={() => setIsAssessmentOpen(false)}
          onReturn={() => {
            const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
            onUpdate(selectedRequest.id, Status.Pending, {
              currentStage: 'client_supplement',
              currentTask: 'Supplement Assessment Materials',
              pendingAssignee: '[Client Contact] Client-Jelena',
              returnRemarks: 'Please supplement the missing evaluation materials and confirm the candidate information before resubmitting.',
              completedRecords: [
                { id: `r-${Date.now()}`, date: ts, actor: selectedRequest.pendingAssignee || '', action: 'Confirm Visa Assessment', meta: ['User: Return to Client', `Completion Date: ${ts}`] },
                ...(selectedRequest.completedRecords || []),
              ],
            });
            setIsAssessmentOpen(false);
          }}
          onApprove={(remarks) => {
            const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
            onUpdate(selectedRequest.id, Status.Pending, {
              currentStage: 'onboarding_info_completion',
              currentTask: 'Complete Onboarding Info',
              pendingAssignee: '[Client Contact] Client-Jelena',
              returnRemarks: undefined,
              approvalRemarks: remarks.trim() || undefined,
              completedRecords: [
                {
                  id: `r-${Date.now()}`,
                  date: ts,
                  actor: selectedRequest.pendingAssignee || '',
                  action: 'Confirm Visa Assessment',
                  meta: [
                    'User: Assessment Approved',
                    ...(remarks.trim() ? [`Remarks: ${remarks.trim()}`] : []),
                    `Completion Date: ${ts}`,
                  ],
                },
                ...(selectedRequest.completedRecords || []),
              ],
            });
            setIsAssessmentOpen(false);
          }}
          onReject={(remarks) => {
            const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
            onUpdate(selectedRequest.id, Status.Closed, {
              currentStage: 'closed',
              currentTask: 'Close Request',
              pendingAssignee: 'N/A',
              assessmentRejectRemarks: remarks.trim(),
              returnRemarks: undefined,
              completedRecords: [
                {
                  id: `r-${Date.now()}`,
                  date: ts,
                  actor: selectedRequest.pendingAssignee || '',
                  action: 'Confirm Visa Assessment',
                  meta: ['User: Assessment Not Approved', `Reason: ${remarks.trim()}`, `Completion Date: ${ts}`],
                },
                ...(selectedRequest.completedRecords || []),
              ],
            });
            setIsAssessmentOpen(false);
          }}
        />
      )}

      {isConfirmOpen && (
        <ConfirmOrderModal
          request={selectedRequest}
          onClose={() => setIsConfirmOpen(false)}
          onReturn={() => {
            const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
            onUpdate(selectedRequest.id, Status.Pending, {
              currentStage: 'submit_order',
              currentTask: 'Submit Order',
              pendingAssignee: '[Client Contact] Client-Jelena',
              returnRemarks: 'Candidate information needs to be corrected before SD can confirm the order.',
              completedRecords: [
                { id: `r-${Date.now()}`, date: ts, actor: selectedRequest.pendingAssignee || '', action: 'Confirm Order [EoR - Onboarding]', meta: ['User: Return to Client', `Completion Date: ${ts}`] },
                ...(selectedRequest.completedRecords || []),
              ],
            });
            setIsConfirmOpen(false);
          }}
          onNext={() => {
            const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
            onUpdate(selectedRequest.id, Status.Processing, {
              currentStage: 'service_order',
              currentTask: 'Apply Visa Before Onboarding',
              pendingAssignee: '[BIPO Service Delivery] SD-MichelleHou hou, SD-Jelena Zhang',
              returnRemarks: undefined,
              completedRecords: [
                { id: `r-${Date.now()}`, date: ts, actor: selectedRequest.pendingAssignee || '', action: 'Confirm Order [EoR - Onboarding]', meta: ['User: Confirm Order', `Completion Date: ${ts}`] },
                ...(selectedRequest.completedRecords || []),
              ],
            });
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
            {requests.map((request, index) => (
              <tr key={request.id} className={index === 1 ? 'bg-slate-100/80' : 'bg-white'}>
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
                  <button
                    onClick={() => onOpenDetail(request.id)}
                    className="text-xs font-medium text-brand-blue hover:underline"
                  >
                    View
                  </button>
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

const RequestDetail = ({
  request,
  role = 'sd',
  onBack,
  onProcess,
}: {
  request: AssessmentRequest;
  role?: 'sd' | 'client';
  onBack: () => void;
  onProcess: () => void;
}) => {
  const records = getTimeline(request);
  const assigneeTag = role === 'sd' ? '[BIPO Service Delivery]' : '[Client Contact]';
  const isCurrentUserAssignee = !!(request.pendingAssignee?.includes(assigneeTag));
  const canProcess = isCurrentUserAssignee && request.status === Status.Pending && request.currentTask !== 'Close Request';

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
                {records.map((item) => (
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
                    {item.state === 'active' && canProcess ? (
                      <div className="flex w-32 flex-col items-center gap-2">
                        <button
                          onClick={onProcess}
                          className="flex h-10 w-28 items-center justify-center gap-2 rounded text-sm font-bold bg-brand-blue text-white"
                        >
                          <ClipboardList size={15} />
                          Process
                        </button>
                        <button className="text-xs text-brand-blue">Not my task?</button>
                      </div>
                    ) : item.state !== 'active' ? (
                      <button className="flex h-10 w-24 items-center justify-center gap-2 rounded border border-blue-200 bg-blue-50 text-sm font-bold text-brand-blue">
                        <Eye size={15} />
                        View
                      </button>
                    ) : null}
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
                  ['Request ID', request.id],
                  ['Request Submitter', 'SD-Jelena Zhang'],
                  ['Submit Time', `${request.submittedDate} 17:08:16`],
                  ['Location', request.workLocation],
                  ['Project Name', '-'],
                  ['Service Type', 'EoR'],
                  ['Service Module', 'Onboarding'],
                  ['Request Status', request.status],
                  ['Pending Task', request.currentTask],
                  ['Pending Assignee', request.pendingAssignee || 'N/A'],
                ]}
              />
            </InfoCard>
          </aside>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 bg-white px-3 py-3">
        <button className="h-9 rounded border border-slate-200 px-7 text-sm font-bold">Export Request Info</button>
        <button className="h-9 rounded border border-red-200 bg-red-50 px-7 text-sm font-bold text-red-500">Revoke Order</button>
        <button className="h-9 rounded border border-red-200 bg-red-50 px-7 text-sm font-bold text-red-500">Cancel Order</button>
      </div>
    </div>
  );
};

const AssessmentModal = ({
  request,
  onClose,
  onReturn,
  onApprove,
  onReject,
}: {
  request: AssessmentRequest;
  onClose: () => void;
  onReturn: () => void;
  onApprove: (remarks: string) => void;
  onReject: (remarks: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState<AssessmentTab>('candidate');
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-10 py-8">
      <div className="flex max-h-[86vh] w-full max-w-[1700px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <ModalHeader title="Confirm Visa Assessment" onClose={onClose} />
        <div className="mx-5 mb-5">
          <p className="mb-5 text-sm font-medium leading-7 text-slate-500">
            This is the candidate basic information and visa pre-assessment material submitted by the client. Please assess whether the candidate is eligible for visa application. If there are any issues, you can edit directly or return it to the client for correction.
          </p>
          <div className="flex gap-9 border-b border-slate-200">
            <TabButton active={activeTab === 'candidate'} onClick={() => setActiveTab('candidate')}>Candidate Info</TabButton>
            <TabButton active={activeTab === 'visa'} onClick={() => setActiveTab('visa')}>Visa Requirements</TabButton>
            <TabButton active={activeTab === 'remarks'} onClick={() => setActiveTab('remarks')}>Remark & Attachment</TabButton>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          {activeTab === 'candidate' && <AssessmentCandidateInfoView request={request} />}
          {activeTab === 'visa' && <VisaRequirementView request={request} includeChecklist hideCandidateSection />}
          {activeTab === 'remarks' && <RemarkAttachmentView request={request} />}
        </div>

        <div className="grid grid-cols-4 gap-3 bg-slate-50 px-4 py-3">
          <button onClick={onClose} className="h-10 rounded border border-slate-200 bg-white text-sm font-bold">Cancel</button>
          <button onClick={onReturn} className="h-10 rounded bg-brand-blue text-sm font-bold text-white">Return to Client</button>
          <button
            onClick={() => setDecision('reject')}
            className="h-10 rounded border border-red-200 bg-red-50 text-sm font-bold text-red-500"
          >
            Assessment Not Approved
          </button>
          <button
            onClick={() => setDecision('approve')}
            className="h-10 rounded bg-brand-blue text-sm font-bold text-white"
          >
            Assessment Approved
          </button>
        </div>
      </div>
      {decision && (
        <AssessmentDecisionDialog
          decision={decision}
          onClose={() => setDecision(null)}
          onConfirm={(remarks) => {
            if (decision === 'approve') {
              onApprove(remarks);
            } else {
              onReject(remarks);
            }
          }}
        />
      )}
    </div>
  );
};

const AssessmentDecisionDialog = ({
  decision,
  onClose,
  onConfirm,
}: {
  decision: 'approve' | 'reject';
  onClose: () => void;
  onConfirm: (remarks: string) => void;
}) => {
  const [remarks, setRemarks] = useState('');
  const [touched, setTouched] = useState(false);
  const isReject = decision === 'reject';
  const isMissingRequiredRemark = isReject && remarks.trim().length === 0;
  const title = isReject ? 'Confirmation to Reject Visa Assessment' : 'Confirmation to Approve Visa Assessment';
  const description = isReject
    ? 'Please enter the reason why the visa assessment is not approved. After confirmation, this request will be cancelled and the client will be notified.'
    : 'You can add remarks for the client below. After confirmation, this request will be routed to the client to complete additional onboarding candidate information.';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 px-10">
      <div className="w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-normal text-slate-800">{title}</h2>
            <p className="mt-5 text-base leading-7 text-slate-500">{description}</p>
          </div>
          <button onClick={onClose} className="mt-1 text-slate-400 hover:text-slate-700">
            <X size={22} />
          </button>
        </div>

        <div className="px-6 py-6">
          <label className="mb-3 block text-base font-bold text-slate-900">
            {isReject && <span className="mr-2 text-red-500">*</span>}Remarks:
          </label>
          <textarea
            value={remarks}
            onBlur={() => setTouched(true)}
            onChange={(event) => setRemarks(event.target.value)}
            placeholder="Please input remarks"
            className={`min-h-24 w-full resize-y rounded border bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-300 ${
              touched && isMissingRequiredRemark ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-brand-blue'
            }`}
          />
          {touched && isMissingRequiredRemark && (
            <p className="mt-2 text-sm text-red-500">remark is required</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-50 px-5 py-4">
          <button onClick={onClose} className="h-11 rounded border border-slate-200 bg-white text-sm font-bold text-slate-900">
            Close
          </button>
          <button
            onClick={() => {
              setTouched(true);
              if (isMissingRequiredRemark) return;
              onConfirm(remarks);
            }}
            disabled={isMissingRequiredRemark}
            className={`h-11 rounded text-sm font-bold text-white ${
              isMissingRequiredRemark ? 'cursor-not-allowed bg-slate-300' : 'bg-brand-blue'
            }`}
          >
            Confirm
          </button>
        </div>
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
  const [activeTab, setActiveTab] = useState<ConfirmTab>('candidate');
  const [confirmStep, setConfirmStep] = useState<ConfirmStep>('requestInfo');
  const hasVisa = request.visaRequired !== false;
  const skipsAssessment = hasVisa && request.visaAssessmentRequired === false;
  const stepLabels = hasVisa
    ? ['Confirm Request Info', 'Confirm Visa Type', 'Confirm Onboarding Flow']
    : ['Confirm Request Info', 'Confirm Onboarding Flow'];
  const activeStepIndex = confirmStep === 'visaType' ? 1 : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-10 py-8">
      <div className="flex max-h-[86vh] w-full max-w-[1700px] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <ModalHeader title="Confirm Order [EoR - Onboarding]" onClose={onClose} />

        <div
          className="mx-5 mb-6 grid overflow-hidden rounded bg-slate-100 text-xs font-medium text-slate-300"
          style={{ gridTemplateColumns: `repeat(${stepLabels.length}, minmax(0, 1fr))` }}
        >
          {stepLabels.map((step, index) => (
            <React.Fragment key={step}>
              <StepCell active={index === activeStepIndex}>{step}</StepCell>
            </React.Fragment>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          {confirmStep === 'requestInfo' ? (
            <>
              <div className="flex gap-9 border-b border-slate-200">
                <TabButton active={activeTab === 'candidate'} onClick={() => setActiveTab('candidate')}>Candidate Info</TabButton>
                <TabButton active={activeTab === 'visa'} onClick={() => setActiveTab('visa')}>Visa Requirements</TabButton>
                <TabButton active={activeTab === 'remarks'} onClick={() => setActiveTab('remarks')}>Remarks & Attachments</TabButton>
              </div>

              {activeTab === 'candidate' && <CandidateInfoView request={request} />}
              {activeTab === 'visa' && (
                hasVisa
                  ? skipsAssessment
                    ? <ConfirmOrderVisaSummary request={request} />
                    : <VisaRequirementView request={request} includeChecklist />
                  : <NoVisaRequirementSummary />
              )}
              {activeTab === 'remarks' && <RemarkAttachmentView request={request} />}
            </>
          ) : (
            <ConfirmVisaTypeStep request={request} />
          )}
        </div>

        <div className={`grid gap-3 bg-slate-50 px-4 py-3 ${confirmStep === 'visaType' ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <button onClick={onClose} className="h-10 rounded border border-slate-200 bg-white text-sm font-bold">Cancel</button>
          {confirmStep === 'visaType' && (
            <button onClick={() => setConfirmStep('requestInfo')} className="h-10 rounded border border-slate-200 bg-white text-sm font-bold text-slate-600">Back</button>
          )}
          <button onClick={onReturn} className="h-10 rounded bg-brand-blue text-sm font-bold text-white">Return to Client</button>
          <button
            onClick={() => {
              if (skipsAssessment && confirmStep === 'requestInfo') {
                setConfirmStep('visaType');
                return;
              }
              onNext();
            }}
            className="h-10 rounded bg-brand-blue text-sm font-bold text-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const NoVisaRequirementSummary = () => (
  <div className="pt-8">
    <ReadOnlyGrid rows={[['Is a visa application required?', 'NO']]} />
  </div>
);

const ConfirmOrderVisaSummary = ({ request }: { request: AssessmentRequest }) => (
  <div className="pt-8">
    <ReadOnlyGrid
      rows={[
        ['Is a visa application required?', 'YES'],
        ['Which type of visa do you need to apply for?', formatVisaApplicationType(request.visaApplyType)],
        ['Is visa pre-assessment required?', 'No'],
      ]}
    />
  </div>
);

const ConfirmVisaTypeStep = ({ request }: { request: AssessmentRequest }) => {
  const scopes = getVisaScopes(request.visaApplyType);
  const [activeScope, setActiveScope] = useState<VisaScope>(scopes[0]);
  const documents = request.documents.length > 0 ? request.documents : fallbackDocuments;

  return (
    <div className="space-y-8 py-4">
      <section className="space-y-3">
        <label className="block text-sm font-bold text-slate-900">Offline Pre-assessment Communication</label>
        <div className="rounded border border-slate-200 bg-white">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 text-xs font-bold text-slate-500">
            <button className="rounded px-2 py-1 hover:bg-slate-50">B</button>
            <button className="rounded px-2 py-1 italic hover:bg-slate-50">I</button>
            <button className="rounded px-2 py-1 hover:bg-slate-50">List</button>
            <button className="ml-auto inline-flex items-center gap-1 rounded border border-blue-200 px-3 py-1.5 text-brand-blue">
              <Paperclip size={13} />
              Upload proof
            </button>
          </div>
          <textarea
            className="min-h-32 w-full resize-none p-4 text-sm outline-none"
            placeholder="Record the offline pre-assessment discussion with the client, decision basis, or supporting notes."
          />
        </div>
      </section>

      <section>
        <div className="flex gap-10 border-b border-slate-200">
          {scopes.map((scope) => (
            <React.Fragment key={scope}>
              <TabButton active={activeScope === scope} onClick={() => setActiveScope(scope)}>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-500" />
                  {scope} Visa
                </span>
              </TabButton>
            </React.Fragment>
          ))}
        </div>

        <div className="grid max-w-4xl grid-cols-1 gap-8 py-8 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-900">
              <span className="mr-1 text-rose-500">*</span>Visa Type
            </label>
            <select className="h-11 w-full rounded border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-brand-blue">
              <option>{activeScope === 'Employment' ? 'Employment Pass' : 'Dependent Pass'}</option>
              <option>{activeScope === 'Employment' ? 'S Pass' : 'Long Term Visit Pass'}</option>
              <option>{activeScope === 'Employment' ? 'Work Permit' : 'Dependent Permit'}</option>
            </select>
          </div>

          {activeScope === 'Employment' && (
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                <span className="mr-1 text-rose-500">*</span>Within the Issuing Country/Region?
              </label>
              <select className="h-11 w-full rounded border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-brand-blue">
                <option>out of country</option>
                <option>in country</option>
              </select>
            </div>
          )}
        </div>

        <div className="my-2 flex items-center gap-5">
          <div className="h-px flex-1 bg-slate-200" />
          <h3 className="text-sm font-bold text-slate-900">Visa Type: {activeScope === 'Employment' ? 'Employment Pass' : 'Dependent Pass'}</h3>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <p className="mb-4 text-sm font-medium text-slate-700">Candidate Documents</p>
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-4 py-4">Is required</th>
              <th className="px-4 py-4">Reminder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="px-4 py-4 text-slate-700">{doc.name.replace(' Bio Page', '')}</td>
                <td className="px-4 py-4 text-slate-700">Attachment</td>
                <td className="px-4 py-4 text-slate-700">{doc.isRequired ? 'Yes' : 'No'}</td>
                <td className="px-4 py-4 text-slate-500">-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

const CandidateInfoView = ({ request }: { request: AssessmentRequest }) => (
  <div className="pt-7">
    <h3 className="text-2xl font-bold text-slate-800">{request.candidateName}</h3>
    <p className="mt-2 text-sm text-slate-500">Onboard on 2025-01-01</p>
    <div className="mt-5 flex gap-9 overflow-x-auto border-b border-slate-200">
      {['Basic Info', 'Contact Info', 'Location Info', 'Contract', 'Payroll Info', 'Bank Info', 'Dependants Info', 'Manager', 'Work Visa', 'Emergency Contact Info'].map((tab, index) => (
        <React.Fragment key={tab}>
          <TabButton active={index === 0} onClick={() => undefined}>{tab}</TabButton>
        </React.Fragment>
      ))}
    </div>
    <ReadOnlyGrid
      rows={[
        ['First Name', '-'],
        ['Middle Name', '-'],
        ['Last Name', '-'],
        ['Employee Name', request.candidateName],
        ['Want To Be Called As', 'Mr'],
        ['Gender', 'Male'],
        ['Birth Date', '-'],
        ['Join Date', '2025-01-01'],
        ['Last Working Date', '-'],
        ['Job Title(EN)', request.jobTitle],
        ['Tax Account Number', '-'],
        ['Nationality / Citizenship', request.nationality],
      ]}
    />
    <div className="flex justify-center gap-3 pb-2">
      <button className="h-9 rounded border border-blue-200 bg-blue-50 px-6 text-sm font-bold text-brand-blue">Edit Directly</button>
      <button className="h-9 rounded border border-red-200 bg-red-50 px-6 text-sm font-bold text-red-500">Add Return Remarks</button>
    </div>
  </div>
);

const AssessmentCandidateInfoView = ({ request }: { request: AssessmentRequest }) => (
  <div className="pt-2">
    <div className="mb-1">
      <h3 className="text-2xl font-semibold tracking-normal text-slate-800">{request.candidateName}</h3>
    </div>
    <ReadOnlyGrid
      rows={[
        ['Candidate Name', request.candidateName],
        ['Candidate Email', request.candidateEmail],
        ['Nationality / Citizenship', request.nationality],
        ['Current Residence', request.currentLocation],
        ['Work Location', request.workLocation],
        ['Job Title / Position', request.jobTitle],
        ['Salary', request.salary],
        ['Degree / Education Level', request.degree],
        ['Expected Start Date', request.expectedStartDate],
      ]}
    />
    <div className="flex justify-center gap-3 pb-2">
      <button className="h-9 rounded border border-blue-200 bg-blue-50 px-6 text-sm font-bold text-brand-blue">Edit Directly</button>
      <button className="h-9 rounded border border-red-200 bg-red-50 px-6 text-sm font-bold text-red-500">Add Return Remarks</button>
    </div>
  </div>
);

const VisaRequirementView = ({
  request,
  includeChecklist,
  hideCandidateSection,
}: {
  request: AssessmentRequest;
  includeChecklist?: boolean;
  hideCandidateSection?: boolean;
}) => {
  const [activeScope, setActiveScope] = useState<VisaScope>('Employment');
  const [activeSection, setActiveSection] = useState<VisaSection>('visaInfo');
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
    <div className="pt-8">
      <div className="grid grid-cols-2 gap-x-24 gap-y-7 text-sm">
        <ReadOnlyField label="Is a visa application required?" value={request.visaRequired === false ? 'NO' : 'YES'} />
        <ReadOnlyField label="Which type of visa do you need to apply for?" value={formatVisaApplicationType(request.visaApplyType)} />
        {request.visaRequired && (
          <ReadOnlyField label="Is visa pre-assessment required?" value={request.visaAssessmentRequired ? 'Yes' : 'No'} />
        )}
      </div>

      <div className="mt-7 flex gap-10 border-b border-slate-200">
        {(['Employment', 'Dependent'] as VisaScope[]).map((scope) => (
          <React.Fragment key={scope}>
            <TabButton
              active={activeScope === scope}
              onClick={() => {
                setActiveScope(scope);
                setActiveSection('visaInfo');
              }}
            >
              {scope} Visa
            </TabButton>
          </React.Fragment>
        ))}
      </div>

      <div className="mt-5 flex gap-10 border-b border-slate-200">
        {!hideCandidateSection && (
          <TabButton active={activeSection === 'person'} onClick={() => setActiveSection('person')}>
            {activeScope === 'Employment' ? 'Candidate Info' : 'Dependent Info'}
          </TabButton>
        )}
        <TabButton active={activeSection === 'visaInfo'} onClick={() => setActiveSection('visaInfo')}>Visa Info</TabButton>
        <TabButton active={activeSection === 'materials'} onClick={() => setActiveSection('materials')}>
          <span className="inline-flex items-center gap-2">
            <FileText size={15} />
            Evaluation Materials
          </span>
        </TabButton>
        {includeChecklist && (
          <TabButton active={activeSection === 'checklist'} onClick={() => setActiveSection('checklist')}>
            Confirm Document Checklist
          </TabButton>
        )}
      </div>

      {activeSection === 'person' && !hideCandidateSection && <ReadOnlyGrid rows={personRows} />}
      {activeSection === 'visaInfo' && (
        <ReadOnlyGrid rows={activeScope === 'Employment' ? employmentVisaInfo : dependentVisaInfo} />
      )}
      {(activeSection === 'materials' || activeSection === 'checklist') && <DocumentChecklist documents={documents} />}

      <div className="flex justify-center gap-3 pb-2">
        <button className="h-9 rounded border border-blue-200 bg-blue-50 px-6 text-sm font-bold text-brand-blue">Edit Directly</button>
        <button className="h-9 rounded border border-red-200 bg-red-50 px-6 text-sm font-bold text-red-500">Add Return Remarks</button>
      </div>
    </div>
  );
};

const RemarkAttachmentView = ({ request }: { request: AssessmentRequest }) => {
  const documents = request.documents.length > 0 ? request.documents : fallbackDocuments;

  return (
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
  );
};

const getTimeline = (request: AssessmentRequest): TimelineItem[] => {
  const activeActor = request.pendingAssignee || '[BIPO Service Delivery] SD-MichelleHou hou, SD-Jelena Zhang';
  const base: TimelineItem[] = [
    {
      id: 'created',
      date: '2026-05-14 17:08:13',
      actor: '[BIPO Service Delivery] SD-Jelena Zhang',
      action: 'Submit Request',
      state: 'done',
      meta: ['Completion Date: 2026-05-14 17:08:18'],
    },
  ];

  return [
    {
      id: 'current',
      date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      actor: activeActor,
      action: request.currentTask,
      state: 'active',
    },
    ...(request.completedRecords || []).map((r) => ({ ...r, state: 'done' as const })),
    ...base,
  ];
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

const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div className="flex items-center justify-between px-5 py-5">
    <div className="flex items-center gap-2">
      <h2 className="text-lg font-medium text-slate-800">{title}</h2>
      <span className="text-xs text-brand-blue">Request Info</span>
    </div>
    <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
      <X size={18} />
    </button>
  </div>
);

const StepCell = ({ active, children }: { active?: boolean; children: ReactNode }) => (
  <div className={`relative flex h-10 items-center gap-3 px-5 ${active ? 'text-orange-500' : ''}`}>
    <span className={`h-4 w-4 rounded-full border-2 ${active ? 'border-orange-400' : 'border-slate-300'}`} />
    {children}
  </div>
);

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
    className={`relative whitespace-nowrap pb-3 text-sm font-bold ${active ? 'text-brand-blue' : 'text-slate-600'}`}
  >
    {children}
    {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-blue" />}
  </button>
);

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="mb-4 text-sm text-slate-500">{label}</p>
    <p className="text-sm font-medium text-slate-900">{value || '-'}</p>
  </div>
);

const ReadOnlyGrid = ({ rows }: { rows: [string, string][] }) => (
  <div className="grid grid-cols-1 gap-x-24 gap-y-7 py-8 md:grid-cols-2">
    {rows.map(([label, value]) => (
      <React.Fragment key={label}>
        <ReadOnlyField label={label} value={value || '-'} />
      </React.Fragment>
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

const formatVisaApplicationType = (type?: AssessmentRequest['visaApplyType']) => {
  if (type === 'Employment') return 'Employment Visa';
  if (type === 'Dependant') return 'Dependent Visa';
  return 'Employment + Dependent';
};

const getVisaScopes = (type?: AssessmentRequest['visaApplyType']): VisaScope[] => {
  if (type === 'Employment') return ['Employment'];
  if (type === 'Dependant') return ['Dependent'];
  return ['Employment', 'Dependent'];
};

const fallbackDocuments: DocumentItem[] = [
  { id: 'fallback-1', name: 'Passport Bio Page', isRequired: true, status: 'Uploaded', lastUpdated: '2026-05-14' },
  { id: 'fallback-2', name: 'Resume / CV', isRequired: true, status: 'Uploaded', lastUpdated: '2026-05-14' },
  { id: 'fallback-3', name: 'Degree Certificate', isRequired: true, status: 'Missing' },
  { id: 'fallback-4', name: 'Existing Visa / Residence Permit', isRequired: false, status: 'Not uploaded' },
];
