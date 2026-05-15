import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Search, 
  ArrowRight,
  Info,
  ShieldCheck,
  Send,
  Upload,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WizardStep, AssessmentRequest, Status } from '../../../types.ts';
import { MODULES, PROJECTS, LOCATION_DOCS } from '../../../constants.ts';
import { FormField } from '../../../components/UI/FormField.tsx';

interface SubmitWizardProps {
  requests?: AssessmentRequest[];
  onSubmit: (request: AssessmentRequest) => void;
  onUpdate?: (id: string, status: Status, additional?: Partial<AssessmentRequest>) => void;
}

export const SubmitWizard = ({ requests = [], onSubmit, onUpdate }: SubmitWizardProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') as 'supplement' | 'complete' | 'submit' | null;
  const requestId = searchParams.get('id');
  const existingRequest = requests.find((request) => request.id === requestId);
  const isExistingTask = Boolean(mode && existingRequest);
  const [step, setStep] = useState<WizardStep>(isExistingTask ? WizardStep.VisaRequirements : WizardStep.ServiceModule);
  const [subStep, setSubStep] = useState<'type' | 'info'>(isExistingTask && mode !== 'supplement' ? 'info' : 'type');
  const [activeVisaType, setActiveVisaType] = useState<'Employment' | 'Dependant'>('Employment');
  const [activeSection, setActiveSection] = useState<'candidate' | 'info' | 'materials' | 'remarks'>(mode === 'supplement' ? 'materials' : 'candidate');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const [draft, setDraft] = useState<Partial<AssessmentRequest>>({
    candidateName: existingRequest?.candidateName || 'Amanda Lee',
    candidateEmail: existingRequest?.candidateEmail || 'amanda.lee@example.com',
    workLocation: existingRequest?.workLocation || 'Singapore',
    nationality: existingRequest?.nationality || 'China',
    currentLocation: existingRequest?.currentLocation || 'China',
    jobTitle: existingRequest?.jobTitle || 'Product Manager',
    salary: existingRequest?.salary || 'SGD 9,500 / month',
    degree: existingRequest?.degree || 'Bachelor',
    expectedStartDate: existingRequest?.expectedStartDate || '2026-07-01',
    visaType: existingRequest?.visaType || 'EP (Employment Pass)',
    remark: existingRequest?.remark || '',
    status: existingRequest?.status || Status.Pending,
    documents: existingRequest?.documents || [],
    visaRequired: existingRequest?.visaRequired ?? true,
    visaApplyType: existingRequest?.visaApplyType || 'Both',
  });

  useEffect(() => {
    // If only Dependant is selected, set it as active
    if (draft.visaApplyType === 'Dependant') {
      setActiveVisaType('Dependant');
    } else {
      setActiveVisaType('Employment');
    }
  }, [draft.visaApplyType, subStep]);

  useEffect(() => {
    const location = draft.workLocation || '';
    if (LOCATION_DOCS[location]) {
      setDraft(prev => ({
        ...prev,
        documents: LOCATION_DOCS[location].map(d => ({ ...d, status: 'Not uploaded' }))
      }));
    }
  }, [draft.workLocation]);

  const handleUpload = (docId: string) => {
    setDraft(prev => ({
      ...prev,
      documents: prev.documents?.map(d => 
        d.id === docId ? { ...d, status: 'Uploaded', lastUpdated: new Date().toISOString().split('T')[0] } : d
      )
    }));
  };

  const renderTopProgress = () => {
    const isSupplementTask = mode === 'supplement';
    const isCompleteTask = mode === 'complete';
    const activeTopStep =
      isSupplementTask ? (activeSection === 'remarks' ? 'remarks' : (draft.visaRequired === false && subStep === 'info') ? 'candidate' : 'workVisa')
      : isCompleteTask ? (activeSection === 'candidate' ? 'candidate' : activeSection === 'remarks' ? 'remarks' : 'workVisa')
      : step === WizardStep.ServiceModule ? 'module'
      : step === WizardStep.LocationProject ? 'project'
      : activeSection === 'remarks' ? 'remarks'
      : (draft.visaRequired === false && subStep === 'info') ? 'candidate'
      : 'workVisa';

    const steps = isSupplementTask
      ? [
          { id: 'workVisa', label: 'Supplement Assessment Materials' },
          ...(draft.visaRequired === false ? [{ id: 'candidate', label: 'Provide Candidate Information' }] : []),
          { id: 'remarks', label: 'Other Remarks & Attachment' },
        ]
      : isCompleteTask
      ? [
          { id: 'candidate', label: 'Provide Candidate Info' },
          { id: 'workVisa', label: 'Collect Work Visa Requirements' },
          { id: 'remarks', label: 'Other Remarks & Attachment' },
        ]
      : [
          { id: 'module', label: 'Service Module' },
          { id: 'project', label: 'Service Location & Project' },
          { id: 'workVisa', label: 'Collect Work Visa Requirements' },
          ...(draft.visaRequired === false ? [{ id: 'candidate', label: 'Provide Candidate Information' }] : []),
          { id: 'remarks', label: 'Other Remarks & Attachment' },
        ];
    const activeIndex = steps.findIndex((item) => item.id === activeTopStep);

    if (isCompleteTask) {
      return (
        <div className="mx-5 mb-5 grid grid-cols-3 overflow-hidden rounded bg-slate-100 text-sm font-bold text-slate-300">
          {steps.map((s, idx) => (
            <div
              key={s.id}
              className={`relative flex h-14 items-center gap-3 px-6 ${
                idx < activeIndex ? 'text-emerald-500' : idx === activeIndex ? 'text-orange-500' : 'text-slate-300'
              }`}
            >
              {idx < activeIndex ? (
                <CheckCircle2 size={18} />
              ) : (
                <span className={`h-5 w-5 rounded-full border-2 ${idx === activeIndex ? 'border-orange-400' : 'border-slate-300'}`} />
              )}
              <span className="whitespace-nowrap">{s.label}</span>
              {idx < steps.length - 1 && <span className="absolute right-0 h-8 w-8 rotate-45 border-r border-t border-slate-300 bg-slate-100" />}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        className="mx-5 mb-5 overflow-hidden rounded bg-slate-100 text-sm font-bold text-slate-300"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((s, idx) => (
          <div
            key={s.id}
            className={`relative flex h-14 items-center gap-3 px-6 ${
              idx < activeIndex ? 'text-emerald-500' : idx === activeIndex ? 'text-orange-500' : 'text-slate-300'
            }`}
          >
            {idx < activeIndex ? (
              <CheckCircle2 size={18} />
            ) : (
              <span className={`h-5 w-5 shrink-0 rounded-full border-2 ${idx === activeIndex ? 'border-orange-400' : 'border-slate-300'}`} />
            )}
            <span className="whitespace-nowrap text-[11px] font-bold">{s.label}</span>
            {idx < steps.length - 1 && <span className="absolute right-0 h-8 w-8 rotate-45 border-r border-t border-slate-300 bg-slate-100" />}
          </div>
        ))}
      </div>
    );
  };

  const handleComplete = () => {
    if (isExistingTask && existingRequest && onUpdate) {
      const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const actionByMode: Record<string, string> = {
        supplement: 'Supplement Assessment Materials',
        complete: 'Complete Onboarding Info',
        submit: 'Submit Order',
      };
      const completedAction = actionByMode[mode || ''] || 'Submit';
      const nextStage = mode === 'supplement' ? 'visa_assessment' : 'confirm_order';
      const nextTask = mode === 'supplement' ? 'Confirm Visa Assessment' : 'Confirm Order [EoR - Onboarding]';
      onUpdate(existingRequest.id, Status.Pending, {
        ...draft,
        currentStage: nextStage,
        currentTask: nextTask,
        returnRemarks: undefined,
        pendingAssignee: mode === 'supplement'
          ? '[BIPO Service Delivery] SD-MichelleHou hou, SD-Jelena Zhang'
          : '[BIPO Service Delivery] SD-Jelena Zhang',
        completedRecords: [
          { id: `r-${Date.now()}`, date: ts, actor: existingRequest.pendingAssignee || '', action: completedAction, meta: ['User: Submit', `Completion Date: ${ts}`] },
          ...(existingRequest.completedRecords || []),
        ],
      } as Partial<AssessmentRequest>);
      navigate('/requests');
      return;
    }

    const newReq: AssessmentRequest = {
      ...draft as AssessmentRequest,
      id: `VA-2026-${Math.floor(Math.random() * 9000) + 1000}`,
      status: Status.Pending,
      currentStage: draft.visaRequired === false ? 'confirm_order' : 'visa_assessment',
      currentTask: draft.visaRequired === false ? 'Confirm Order [EoR - Onboarding]' : 'Confirm Visa Assessment',
      client: selectedProject?.client || 'Zhappy',
      submittedDate: new Date().toISOString().split('T')[0],
      pendingAssignee: '[BIPO Service Delivery] SD-MichelleHou hou, SD-Jelena Zhang',
    };
    onSubmit(newReq);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-6">
      <div className="relative flex h-[92vh] w-full max-w-[1640px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-medium text-slate-900">
              {mode === 'supplement' ? 'Supplement Assessment Materials' : mode === 'complete' ? 'Submit order' : mode === 'submit' ? 'Submit Order' : 'Submit Request'}
            </h2>
            {mode === 'complete' && <span className="text-xs font-medium text-brand-blue">Request Info</span>}
          </div>
          <button onClick={() => navigate('/requests')} className="text-slate-400 hover:text-slate-700">×</button>
        </div>
        {mode === 'supplement' && existingRequest?.returnRemarks && (
          <div className="mx-6 mb-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Return Remarks: {existingRequest.returnRemarks}
          </div>
        )}
        {renderTopProgress()}
        <div className="min-h-0 flex-1 overflow-hidden">
      {step === WizardStep.ServiceModule && (
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-900 mb-3">Please select the service module you want to request</h2>
              <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
                The system will guide you through the corresponding steps and required information based on your selection.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl w-full">
              {MODULES.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setSelectedModule(module.id)}
                  className={`flex flex-col items-start p-6 rounded-xl border-2 transition-all group relative ${selectedModule === module.id ? 'border-brand-blue bg-blue-50/50 shadow-lg shadow-blue-500/10' : 'border-slate-100 hover:border-slate-200 bg-white hover:shadow-md'}`}
                >
                  <div className={`p-2.5 rounded-lg mb-4 ${selectedModule === module.id ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-200'} transition-all`}>
                    <module.icon size={28} />
                  </div>
                  <span className={`text-sm font-bold text-left leading-tight ${selectedModule === module.id ? 'text-brand-blue' : 'text-slate-600'}`}>
                    {module.name}
                  </span>
                  {selectedModule === module.id && <div className="absolute top-4 right-4 text-brand-blue"><CheckCircle2 size={18} /></div>}
                </button>
              ))}
            </div>
          </div>
          <div className="shrink-0 grid grid-cols-2 gap-3 border-t border-slate-200 bg-white p-5">
            <button onClick={() => navigate('/requests')} className="h-12 rounded border border-slate-200 text-sm font-bold text-slate-600">Cancel</button>
            <button
              onClick={() => selectedModule && setStep(WizardStep.LocationProject)}
              disabled={!selectedModule}
              className={`h-12 rounded text-sm font-bold text-white flex items-center justify-center gap-2 transition-all ${selectedModule ? 'bg-brand-blue' : 'bg-slate-300 opacity-50 cursor-not-allowed'}`}
            >
              Next
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === WizardStep.LocationProject && (
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto flex flex-col items-center p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Please select the service project</h2>
              <p className="text-slate-500 text-sm">Location-specific requirements will automatically load based on your selection.</p>
            </div>
            <div className="w-full max-w-4xl relative mb-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-14 pr-6 shadow-sm focus:border-brand-blue outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
              {PROJECTS.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`relative overflow-hidden rounded-2xl border-2 text-left transition-all ${selectedProject?.id === project.id ? 'border-brand-blue bg-blue-50/20' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                >
                  <div className="h-28 bg-slate-200 relative">
                    <div className="absolute top-3 left-3 bg-slate-900/60 text-white text-[9px] px-2 py-1 rounded font-black uppercase">EOR</div>
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/80 to-transparent">
                      <p className="text-white font-black text-lg leading-tight">{project.region}</p>
                      <p className="text-white/80 text-xs font-bold uppercase tracking-wider">{project.client}</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Location</span>
                      <span className="text-slate-900">{project.location}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Project Code</span>
                      <span className="text-slate-900 font-mono italic">{project.code}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="shrink-0 grid grid-cols-2 gap-3 border-t border-slate-200 bg-white p-5">
            <button onClick={() => setStep(WizardStep.ServiceModule)} className="h-12 rounded border border-slate-200 text-sm font-bold text-slate-600">Back</button>
            <button
              onClick={() => {
                if (selectedProject) {
                  setSubStep('type');
                  setStep(WizardStep.VisaRequirements);
                }
              }}
              disabled={!selectedProject}
              className={`h-12 rounded text-sm font-bold text-white flex items-center justify-center gap-2 transition-all ${selectedProject ? 'bg-brand-blue' : 'bg-slate-300 cursor-not-allowed'}`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {step === WizardStep.VisaRequirements && (
        <div className="flex h-full flex-col overflow-hidden bg-white">
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {(!isExistingTask || mode === 'supplement') && !(draft.visaRequired === false && subStep === 'info') && (
              <div className="w-56 shrink-0 border-r border-slate-200 bg-white px-4 py-8">
                <p className="mb-4 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">Steps</p>
                <div className="space-y-1">
                  {([
                    { id: 'type' as const, label: 'Visa Application Type' },
                    ...(draft.visaRequired !== false ? [{ id: 'info' as const, label: 'Visa Requirements' }] : []),
                  ] as const).map((item, idx) => {
                    const isActive = subStep === item.id;
                    const isPast = item.id === 'type' && subStep === 'info';
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.id === 'type') {
                            setSubStep('type');
                          } else if (draft.visaRequired !== undefined) {
                            setSubStep('info');
                            setActiveSection(draft.visaRequired === false ? 'candidate' : mode === 'supplement' ? 'materials' : 'info');
                          }
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors ${isActive ? 'bg-blue-50 font-bold text-brand-blue' : isPast ? 'text-slate-500 cursor-pointer hover:bg-slate-50' : draft.visaRequired !== undefined ? 'text-slate-500 cursor-pointer hover:bg-slate-50' : 'text-slate-400 cursor-not-allowed'}`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${isActive ? 'border-brand-blue' : isPast ? 'border-emerald-500' : 'border-slate-300'}`}>
                          {isPast ? <CheckCircle2 size={12} className="text-emerald-500" /> : <span className={`text-xs font-bold ${isActive ? 'text-brand-blue' : 'text-slate-400'}`}>{idx + 1}</span>}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {subStep === 'type' ? (
              <div className="flex flex-col flex-1 overflow-y-auto p-5">
                <div className="flex flex-col flex-1 w-full rounded-2xl bg-slate-50 p-10">
                  <p className="mb-8 text-sm font-medium leading-7 text-slate-500">
                    Please confirm whether a visa application is required for the candidate based on actual needs. If yes, select the visa application type and provide detailed visa requirements. If not, simply select "No visa application required."
                  </p>
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-slate-900">
                        <span className="mr-1 text-rose-500">*</span>Is a visa application required?
                      </label>
                      <div className="flex gap-8">
                        <label className="flex cursor-pointer items-center gap-2">
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${draft.visaRequired ? 'border-brand-blue' : 'border-slate-300'}`}>
                            {draft.visaRequired && <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />}
                          </span>
                          <input type="radio" className="hidden" checked={draft.visaRequired === true} onChange={() => setDraft(p => ({ ...p, visaRequired: true }))} />
                          <span className={`text-sm font-medium ${draft.visaRequired ? 'text-brand-blue' : 'text-slate-600'}`}>Yes</span>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${draft.visaRequired === false ? 'border-brand-blue' : 'border-slate-300'}`}>
                            {draft.visaRequired === false && <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />}
                          </span>
                          <input type="radio" className="hidden" checked={draft.visaRequired === false} onChange={() => setDraft(p => ({ ...p, visaRequired: false }))} />
                          <span className={`text-sm font-medium ${draft.visaRequired === false ? 'text-brand-blue' : 'text-slate-600'}`}>No</span>
                        </label>
                      </div>
                    </div>
                    {draft.visaRequired && (
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-900">
                          <span className="mr-1 text-rose-500">*</span>Which type of visa do you need to apply for?
                        </label>
                        <div className="flex flex-wrap gap-8">
                          {[
                            { id: 'Employment', label: 'Employment Visa' },
                            { id: 'Dependant', label: 'Dependant Visa' },
                            { id: 'Both', label: 'Employment + Dependant' }
                          ].map((type) => (
                            <label key={type.id} className="flex cursor-pointer items-center gap-2">
                              <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${draft.visaApplyType === type.id ? 'border-brand-blue' : 'border-slate-300'}`}>
                                {draft.visaApplyType === type.id && <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />}
                              </span>
                              <input
                                type="radio"
                                className="hidden"
                                checked={draft.visaApplyType === type.id}
                                onChange={() => setDraft(p => ({ ...p, visaApplyType: type.id as any }))}
                              />
                              <span className={`text-sm font-medium ${draft.visaApplyType === type.id ? 'text-brand-blue' : 'text-slate-600'}`}>{type.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {draft.visaRequired !== false && (
                    <div className="mt-auto flex justify-center border-t border-slate-200 pt-6">
                      <button
                        onClick={() => {
                          setSubStep('info');
                          setActiveSection(mode === 'supplement' ? 'materials' : 'info');
                        }}
                        className="h-11 w-48 rounded bg-brand-blue text-sm font-bold text-white"
                      >
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
            <div className={`flex flex-col flex-1 overflow-y-auto ${(mode === 'complete' || draft.visaRequired === false) ? 'bg-white px-5 pt-4' : 'p-5'}`}>
              <div className={`${(mode === 'complete' || draft.visaRequired === false) ? 'max-w-none pb-6' : 'flex flex-col flex-1 w-full rounded-2xl bg-slate-50 p-10'}`}>
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    {activeSection === 'remarks' ? (
                      <div className="grid grid-cols-1 gap-8 py-6 md:grid-cols-2">
                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-slate-900">Other Remarks</label>
                          <textarea
                            value={draft.remark || ''}
                            onChange={(event) => setDraft((prev) => ({ ...prev, remark: event.target.value }))}
                            placeholder="Please input"
                            className="min-h-44 w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none transition-all focus:border-brand-blue"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="block text-sm font-bold text-slate-900">Attachment</label>
                          <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm font-bold text-brand-blue">
                            Upload Attachment
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                    {!(mode === 'complete' && activeSection === 'candidate') && !(mode === 'complete' && activeSection !== 'remarks') && (
                    <p className="text-sm text-slate-500 font-medium">
                      {draft.visaRequired === false
                        ? 'Please provide the candidate information required for the normal EOR onboarding place order flow.'
                        : 'Please select the visa type that the candidate needs to apply for and fill in the corresponding documents.'}
                    </p>
                    )}
                    
                    {/* Level 1 Tabs: Employment / Dependant */}
                    {draft.visaRequired && !(mode === 'complete' && activeSection !== 'remarks') && (draft.visaApplyType === 'Both' || draft.visaApplyType === 'Employment' || draft.visaApplyType === 'Dependant') && (
                      <div className="flex gap-8 border-b border-slate-200">
                        {(draft.visaApplyType === 'Both' || draft.visaApplyType === 'Employment') && (
                          <button 
                            onClick={() => setActiveVisaType('Employment')}
                            className={`pb-4 flex items-center gap-2 text-sm font-bold transition-all relative ${activeVisaType === 'Employment' ? 'text-brand-blue' : 'text-slate-400'}`}
                          >
                            <AlertCircle size={16} className="text-amber-500" />
                            Employment Visa
                            {activeVisaType === 'Employment' && <motion.div layoutId="level1-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full" />}
                          </button>
                        )}
                        {(draft.visaApplyType === 'Both' || draft.visaApplyType === 'Dependant') && (
                          <button 
                            onClick={() => setActiveVisaType('Dependant')}
                            className={`pb-4 flex items-center gap-2 text-sm font-bold transition-all relative ${activeVisaType === 'Dependant' ? 'text-brand-blue' : 'text-slate-400'}`}
                          >
                            <AlertCircle size={16} className="text-amber-500" />
                            Dependant Visa
                            {activeVisaType === 'Dependant' && <motion.div layoutId="level1-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full" />}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Level 2 Tabs: Candidate Info / Visa Info / Evaluation Materials */}
                    {draft.visaRequired && !(mode === 'complete' && activeSection !== 'remarks') && (
                    <div className="flex gap-8 border-b border-slate-100">
                      <button 
                        onClick={() => setActiveSection('candidate')}
                        className={`pb-4 flex items-center gap-2 text-sm font-bold transition-all relative ${activeSection === 'candidate' ? 'text-brand-blue' : 'text-slate-400'}`}
                      >
                        <AlertCircle size={16} className="text-amber-500" />
                        Candidate Info
                        {activeSection === 'candidate' && <motion.div layoutId="level2-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full" />}
                      </button>
                      <button 
                        onClick={() => setActiveSection('info')}
                        className={`pb-4 flex items-center gap-2 text-sm font-bold transition-all relative ${activeSection === 'info' ? 'text-brand-blue' : 'text-slate-400'}`}
                      >
                        <AlertCircle size={16} className="text-amber-500" />
                        Visa Info
                        {activeSection === 'info' && <motion.div layoutId="level2-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full" />}
                      </button>
                      <button 
                        onClick={() => setActiveSection('materials')}
                        className={`pb-4 flex items-center gap-2 text-sm font-bold transition-all relative ${activeSection === 'materials' ? 'text-brand-blue' : 'text-slate-400'}`}
                      >
                        <AlertCircle size={16} className="text-amber-500" />
                        Evaluation Materials
                        {activeSection === 'materials' && <motion.div layoutId="level2-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full" />}
                      </button>
                    </div>
                    )}

                    {/* Content Section */}
                    {activeSection === 'candidate' ? (
                      (mode === 'complete' || draft.visaRequired === false) ? (
                        <CandidateCreationStep
                          draft={draft}
                          setDraft={setDraft}
                        />
                      ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 py-6">
                        <FormField label="Candidate Name" value={draft.candidateName || ''} onChange={(v) => setDraft(p => ({ ...p, candidateName: v }))} required />
                        <FormField label="Candidate Email" value={draft.candidateEmail || ''} onChange={(v) => setDraft(p => ({ ...p, candidateEmail: v }))} required />
                        <FormField label="Nationality / Citizenship" value={draft.nationality || ''} onChange={(v) => setDraft(p => ({ ...p, nationality: v }))} required />
                        <FormField label="Current Residence" value={draft.currentLocation || ''} onChange={(v) => setDraft(p => ({ ...p, currentLocation: v }))} required />
                        <FormField label="Job Title" value={draft.jobTitle || ''} onChange={(v) => setDraft(p => ({ ...p, jobTitle: v }))} required />
                        <FormField label="Proposed Monthly Salary" value={draft.salary || ''} onChange={(v) => setDraft(p => ({ ...p, salary: v }))} required />
                        <FormField label="Highest Education" value={draft.degree || ''} onChange={(v) => setDraft(p => ({ ...p, degree: v }))} required />
                        <FormField label="Expected Onboarding" type="date" value={draft.expectedStartDate || ''} onChange={(v) => setDraft(p => ({ ...p, expectedStartDate: v }))} required />
                      </div>
                      )
                    ) : mode === 'complete' && activeSection !== 'remarks' ? (
                      <CompleteWorkVisaStep
                        draft={draft}
                        activeVisaType={activeVisaType}
                        activeSection={activeSection}
                        setDraft={setDraft}
                        setActiveVisaType={setActiveVisaType}
                        setActiveSection={setActiveSection}
                        handleUpload={handleUpload}
                      />
                    ) : activeSection === 'info' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 py-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-900 block">
                            <span className="text-rose-500 mr-1">*</span>{activeVisaType} Visa Type
                          </label>
                          <select className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 outline-none focus:border-brand-blue transition-all">
                            <option>Please select</option>
                            <option>Work Permit</option>
                            <option>S Pass</option>
                            <option>Employment Pass</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-900 flex items-center gap-1">
                            <span className="text-rose-500 mr-1">*</span>Within the Issuing Country/Region?
                            <Info size={14} className="text-brand-blue" />
                          </label>
                          <select className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 outline-none focus:border-brand-blue transition-all">
                            <option>Please select</option>
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-900 flex items-center gap-1">
                            <span className="text-rose-500 mr-1">*</span>Country / Region at the time of Visa application
                            <Info size={14} className="text-brand-blue" />
                          </label>
                          <select className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 outline-none focus:border-brand-blue transition-all">
                            <option>Please select</option>
                            <option>China</option>
                            <option>Singapore</option>
                            <option>Hong Kong</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-900 flex items-center gap-1">
                            <span className="text-rose-500 mr-1">*</span>Departure Country / Region before entering Visa Location
                            <Info size={14} className="text-brand-blue" />
                          </label>
                          <select className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-900 outline-none focus:border-brand-blue transition-all">
                            <option>Please select</option>
                            <option>China</option>
                            <option>Singapore</option>
                            <option>Hong Kong</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 overflow-hidden">
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-slate-100 border-t border-slate-100">
                            {draft.documents?.map(doc => (
                              <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-4 pr-4">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-900">{doc.name}</span>
                                    <span className={`text-[10px] font-bold ${doc.isRequired ? 'text-rose-500' : 'text-slate-400'}`}>
                                      {doc.isRequired ? '* Required' : 'Optional'}
                                    </span>
                                  </div>
                                </td>
                                <td className={`py-4 text-[11px] font-black uppercase tracking-tight ${doc.status === 'Uploaded' ? 'text-emerald-600' : 'text-slate-300'}`}>
                                  {doc.status}
                                </td>
                                <td className="py-4 text-right">
                                  <button onClick={() => handleUpload(doc.id)} className="text-brand-blue font-bold px-4 py-2 hover:bg-blue-50 rounded-lg text-xs transition-colors">UPLOAD</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    </>
                    )}
                  </div>
                  {!(mode === 'complete' || draft.visaRequired === false) && activeSection !== 'remarks' && (
                    <div className="mt-auto flex justify-center gap-4 border-t border-slate-200 pt-6">
                      <button
                        onClick={() => setSubStep('type')}
                        className="h-11 w-48 rounded border border-slate-200 text-sm font-bold text-slate-600"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          if (activeSection !== 'remarks') {
                            setActiveSection('remarks');
                          } else {
                            handleComplete();
                          }
                        }}
                        className="h-11 w-48 rounded bg-brand-blue text-sm font-bold text-white"
                      >
                        Continue
                      </button>
                    </div>
                  )}
              </div>
            </div>
            )}
          </div>
          {mode === 'complete' ? (
            <div className={`shrink-0 grid gap-3 border-t border-slate-100 bg-white p-4 ${activeSection === 'candidate' ? 'grid-cols-3' : 'grid-cols-4'}`}>
              <button onClick={() => navigate('/requests')} className="h-12 rounded border border-slate-200 text-sm font-bold text-slate-900">
                Cancel
              </button>
              {activeSection === 'candidate' ? (
                <button
                  onClick={() => navigate(existingRequest ? `/requests/detail?id=${existingRequest.id}` : '/requests')}
                  className="h-12 rounded border border-slate-200 text-sm font-bold text-slate-900"
                >
                  Back
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (activeSection === 'remarks') {
                      setActiveSection('info');
                      return;
                    }
                    setActiveSection('candidate');
                  }}
                  className="h-12 rounded border border-slate-200 text-sm font-bold text-slate-900"
                >
                  Back
                </button>
              )}
              {activeSection !== 'candidate' && (
                <button className="h-12 rounded bg-brand-blue text-sm font-bold text-white">
                  Cancel Order
                </button>
              )}
              <button
                onClick={() => {
                  if (activeSection === 'candidate') {
                    setActiveSection('info');
                    return;
                  }
                  if (activeSection !== 'remarks') {
                    setActiveSection('remarks');
                    return;
                  }
                  handleComplete();
                }}
                className="h-12 rounded bg-brand-blue text-sm font-bold text-white"
              >
                {activeSection === 'candidate' ? 'Create Candidate & Next' : activeSection !== 'remarks' ? 'Next' : 'Complete'}
              </button>
            </div>
          ) : subStep === 'type' ? (
            <div className="shrink-0 grid grid-cols-3 gap-3 border-t border-slate-200 bg-white p-5">
              <button onClick={() => navigate('/requests')} className="h-12 rounded border border-slate-200 text-sm font-bold">Cancel</button>
              <button
                onClick={() => {
                  if (isExistingTask) {
                    navigate(existingRequest ? `/requests/detail?id=${existingRequest.id}` : '/requests');
                  } else {
                    setStep(WizardStep.LocationProject);
                  }
                }}
                className="h-12 rounded border border-slate-200 text-sm font-bold text-slate-600"
              >Back</button>
              <button
                onClick={() => {
                  setSubStep('info');
                  setActiveSection(draft.visaRequired === false ? 'candidate' : mode === 'supplement' ? 'materials' : 'info');
                }}
                className="h-12 rounded bg-brand-blue text-sm font-bold text-white"
              >
                Next
              </button>
            </div>
          ) : (
            <div className="shrink-0 grid grid-cols-3 gap-3 border-t border-slate-200 bg-white p-5">
              <button onClick={() => navigate('/requests')} className="h-12 rounded border border-slate-200 text-sm font-bold text-slate-600">Cancel</button>
              <button
                onClick={() => {
                  if (activeSection === 'remarks') {
                    setActiveSection(draft.visaRequired === false ? 'candidate' : mode === 'supplement' ? 'materials' : 'info');
                    return;
                  }
                  if (isExistingTask && mode !== 'supplement') {
                    navigate('/requests');
                    return;
                  }
                  setSubStep('type');
                }}
                className="h-12 rounded border border-slate-200 text-sm font-bold text-slate-600"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (activeSection !== 'remarks') {
                    setActiveSection('remarks');
                    return;
                  }
                  handleComplete();
                }}
                className="h-12 rounded bg-brand-blue text-sm font-bold text-white"
              >
                {activeSection !== 'remarks' ? 'Next' : 'Complete'}
              </button>
            </div>
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

const CandidateCreationStep = ({
  draft,
  setDraft,
}: {
  draft: Partial<AssessmentRequest>;
  setDraft: React.Dispatch<React.SetStateAction<Partial<AssessmentRequest>>>;
}) => {
  const sections = [
    'Basic Info',
    'Contact Info',
    'Location Info',
    'Contract',
    'Payroll Info',
    'Bank Info',
    'Dependants Info',
    'Manager',
    'Work Visa',
    'Emergency Contact Info',
    'Others',
  ];

  return (
    <div className="h-full min-h-[660px]">
      <div className="mb-7 flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Create New Candidate</h3>
        <div className="text-sm font-bold">
          <button className="text-brand-blue">Import</button>
          <span className="mx-2 font-medium text-slate-500">Or</span>
          <button className="text-brand-blue">Select Existing Candidate</button>
        </div>
      </div>

      <div className="grid min-h-[600px] grid-cols-[270px_minmax(0,1fr)_360px] gap-8">
        <aside className="relative py-3">
          <div className="absolute bottom-8 left-[11px] top-9 w-px bg-slate-300" />
          <div className="relative space-y-6">
            {sections.map((item, index) => (
              <div className="relative flex items-center gap-3" key={item}>
                <span className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white ${index === 0 ? 'border-brand-blue' : 'border-slate-300'}`}>
                  {index === 0 && <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />}
                </span>
                <span className={`text-sm font-medium ${index === 0 ? 'font-bold text-brand-blue' : 'text-slate-700'}`}>{item}</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="relative overflow-hidden rounded-lg bg-slate-50 p-6">
          <div className="absolute bottom-28 right-4 top-8 w-1.5 rounded-full bg-slate-200">
            <div className="h-24 rounded-full bg-slate-400/50" />
          </div>
          <div className="max-h-[560px] overflow-hidden pr-9">
            <div className="grid grid-cols-2 gap-x-8 gap-y-8">
              <FormField label="First Name" value="" onChange={() => undefined} />
              <FormField label="Middle Name" value="" onChange={() => undefined} />
              <FormField label="Last Name" value="" onChange={() => undefined} />
              <div />
              <FormField label="Employee Name" value={draft.candidateName || ''} onChange={(value) => setDraft((prev) => ({ ...prev, candidateName: value }))} required />
              <FormField label="Want To Be Called As" value="Mr" onChange={() => undefined} required />
              <FormField label="Gender" value="Male" onChange={() => undefined} required />
              <FormField label="Birth Date" type="date" value="" onChange={() => undefined} />
              <FormField label="Join Date" type="date" value={draft.expectedStartDate || ''} onChange={(value) => setDraft((prev) => ({ ...prev, expectedStartDate: value }))} required />
              <FormField label="Last Working Date" type="date" value="" onChange={() => undefined} />
              <FormField label="Login Access Expires" type="date" value="" onChange={() => undefined} />
              <FormField label="Job Title(EN)" value={draft.jobTitle || ''} onChange={(value) => setDraft((prev) => ({ ...prev, jobTitle: value }))} />
              <FormField label="Email Address" value={draft.candidateEmail || ''} onChange={(value) => setDraft((prev) => ({ ...prev, candidateEmail: value }))} required />
              <FormField label="Nationality / Citizenship" value={draft.nationality || ''} onChange={(value) => setDraft((prev) => ({ ...prev, nationality: value }))} required />
            </div>
          </div>
        </section>

        <aside className="flex flex-col items-center justify-center bg-white text-center text-slate-400">
          <div className="relative mb-7 h-40 w-48">
            <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-50 text-7xl font-bold text-brand-blue">
              ?
            </div>
            <span className="absolute bottom-3 left-10 h-12 w-4 rounded bg-slate-700" />
            <span className="absolute bottom-3 right-10 h-12 w-4 rounded bg-slate-700" />
            <span className="absolute bottom-0 left-6 right-6 h-px bg-slate-400" />
          </div>
          <p className="max-w-72 text-base leading-7">Select a field to view detailed instructions here.</p>
        </aside>
      </div>
    </div>
  );
};

const CompleteWorkVisaStep = ({
  draft,
  activeVisaType,
  activeSection,
  setDraft,
  setActiveVisaType,
  setActiveSection,
  handleUpload,
}: {
  draft: Partial<AssessmentRequest>;
  activeVisaType: 'Employment' | 'Dependant';
  activeSection: 'candidate' | 'info' | 'materials' | 'remarks';
  setDraft: React.Dispatch<React.SetStateAction<Partial<AssessmentRequest>>>;
  setActiveVisaType: React.Dispatch<React.SetStateAction<'Employment' | 'Dependant'>>;
  setActiveSection: React.Dispatch<React.SetStateAction<'candidate' | 'info' | 'materials' | 'remarks'>>;
  handleUpload: (docId: string) => void;
}) => {
  const documents = draft.documents || [];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-4 py-2">
      <section className="rounded-xl bg-slate-50 p-8">
        <div className="space-y-10">
          <div className="space-y-5">
            <label className="block text-sm font-medium text-slate-900">
              <span className="mr-1 text-rose-500">*</span>Is a visa application required?
            </label>
            <div className="flex gap-10">
              <label className="flex cursor-pointer items-center gap-3">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${draft.visaRequired ? 'border-brand-blue' : 'border-slate-300'}`}>
                  {draft.visaRequired && <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />}
                </span>
                <input type="radio" className="hidden" checked={draft.visaRequired === true} onChange={() => setDraft((prev) => ({ ...prev, visaRequired: true }))} />
                <span className={`text-sm font-medium ${draft.visaRequired ? 'text-brand-blue' : 'text-slate-600'}`}>Yes</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${draft.visaRequired === false ? 'border-brand-blue' : 'border-slate-300'}`}>
                  {draft.visaRequired === false && <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />}
                </span>
                <input type="radio" className="hidden" checked={draft.visaRequired === false} onChange={() => setDraft((prev) => ({ ...prev, visaRequired: false }))} />
                <span className={`text-sm font-medium ${draft.visaRequired === false ? 'text-brand-blue' : 'text-slate-600'}`}>No</span>
              </label>
            </div>
          </div>

          <div className="space-y-5">
            <label className="block text-sm font-medium text-slate-900">
              <span className="mr-1 text-rose-500">*</span>Which type of visa do you need to apply for?
            </label>
            <div className="flex flex-wrap gap-10">
              {[
                { id: 'Employment', label: 'Employment Visa' },
                { id: 'Dependant', label: 'Dependant Visa' },
                { id: 'Both', label: 'Employment + Dependant' }
              ].map((type) => (
                <label key={type.id} className="flex cursor-pointer items-center gap-3">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${draft.visaApplyType === type.id ? 'border-brand-blue' : 'border-slate-300'}`}>
                    {draft.visaApplyType === type.id && <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />}
                  </span>
                  <input
                    type="radio"
                    className="hidden"
                    checked={draft.visaApplyType === type.id}
                    onChange={() => setDraft((prev) => ({ ...prev, visaApplyType: type.id as any }))}
                  />
                  <span className={`text-sm font-medium ${draft.visaApplyType === type.id ? 'text-brand-blue' : 'text-slate-600'}`}>{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-b border-slate-200">
            <div className="flex gap-10">
              {(draft.visaApplyType === 'Both' || draft.visaApplyType === 'Employment') && (
                <button
                  onClick={() => setActiveVisaType('Employment')}
                  className={`relative flex items-center gap-2 pb-4 text-sm font-bold ${activeVisaType === 'Employment' ? 'text-brand-blue' : 'text-slate-600'}`}
                >
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  Employment Visa
                  {activeVisaType === 'Employment' && <span className="absolute inset-x-0 bottom-0 h-1 bg-brand-blue" />}
                </button>
              )}
              {(draft.visaApplyType === 'Both' || draft.visaApplyType === 'Dependant') && (
                <button
                  onClick={() => setActiveVisaType('Dependant')}
                  className={`relative flex items-center gap-2 pb-4 text-sm font-bold ${activeVisaType === 'Dependant' ? 'text-brand-blue' : 'text-slate-600'}`}
                >
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  Dependant Visa
                  {activeVisaType === 'Dependant' && <span className="absolute inset-x-0 bottom-0 h-1 bg-brand-blue" />}
                </button>
              )}
            </div>
          </div>

          <div className="border-b border-slate-200">
            <div className="flex gap-10">
              <button
                onClick={() => setActiveSection('info')}
                className={`relative flex items-center gap-2 pb-4 text-sm font-bold ${activeSection === 'info' ? 'text-brand-blue' : 'text-slate-700'}`}
              >
                <CheckCircle2 size={18} className="text-emerald-500" />
                Visa Info
                {activeSection === 'info' && <span className="absolute inset-x-0 bottom-0 h-1 bg-brand-blue" />}
              </button>
              <button
                onClick={() => setActiveSection('materials')}
                className={`relative flex items-center gap-2 pb-4 text-sm font-bold ${activeSection === 'materials' ? 'text-brand-blue' : 'text-slate-700'}`}
              >
                <CheckCircle2 size={18} className="text-emerald-500" />
                Evaluation Materials
                {activeSection === 'materials' && <span className="absolute inset-x-0 bottom-0 h-1 bg-brand-blue" />}
              </button>
              <button className="flex items-center gap-2 pb-4 text-sm font-bold text-slate-700">
                <Info size={16} />
                Confirm Document Checklist
              </button>
            </div>
          </div>

          {activeSection === 'info' ? (
            <div className="grid grid-cols-3 gap-x-8 gap-y-12 pt-2">
              <FormField label={`${activeVisaType} Visa Type`} value={activeVisaType === 'Employment' ? 'Employment Pass' : 'Dependent Pass'} onChange={() => undefined} required />
              <FormField label="Within the Issuing Country/Region?" value="Out of Country" onChange={() => undefined} required />
              <FormField label="Country / Region at the time of Visa application" value="New Zealand" onChange={() => undefined} required />
              <FormField label="Departure Country / Region before entering Visa Location" value="New Zealand" onChange={() => undefined} required />
            </div>
          ) : (
            <div className="overflow-hidden pt-2">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100 border-t border-slate-100">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-100/70">
                      <td className="py-4 pr-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{doc.name}</span>
                          <span className={`text-[10px] font-bold ${doc.isRequired ? 'text-rose-500' : 'text-slate-400'}`}>
                            {doc.isRequired ? '* Required' : 'Optional'}
                          </span>
                        </div>
                      </td>
                      <td className={`py-4 text-[11px] font-black uppercase tracking-tight ${doc.status === 'Uploaded' ? 'text-emerald-600' : 'text-slate-300'}`}>
                        {doc.status}
                      </td>
                      <td className="py-4 text-right">
                        <button onClick={() => handleUpload(doc.id)} className="rounded-lg px-4 py-2 text-xs font-bold text-brand-blue hover:bg-blue-50">UPLOAD</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <aside className="bg-white px-3 pt-3">
        <h3 className="mb-8 text-sm font-bold text-slate-900">Visa Application Guidance <span className="text-amber-400">💡</span></h3>
        <div className="space-y-6 text-sm text-slate-700">
          <button className="block w-full border-b border-slate-200 pb-5 text-left">Visa Guidance for Singapore - Part I</button>
          <button className="block w-full text-left">Visa Guidance for Singapore - Part II</button>
        </div>
      </aside>
    </div>
  );
};
