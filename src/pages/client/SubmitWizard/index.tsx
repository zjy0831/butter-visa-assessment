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
import { useNavigate } from 'react-router-dom';
import { WizardStep, AssessmentRequest, Status } from '../../../types.ts';
import { MODULES, PROJECTS, LOCATION_DOCS } from '../../../constants.ts';
import { FormField } from '../../../components/UI/FormField.tsx';

interface SubmitWizardProps {
  onSubmit: (request: AssessmentRequest) => void;
}

export const SubmitWizard = ({ onSubmit }: SubmitWizardProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>(WizardStep.ServiceModule);
  const [subStep, setSubStep] = useState<'type' | 'info'>('type');
  const [activeVisaType, setActiveVisaType] = useState<'Employment' | 'Dependant'>('Employment');
  const [activeSection, setActiveSection] = useState<'candidate' | 'info' | 'materials'>('candidate');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const [draft, setDraft] = useState<Partial<AssessmentRequest>>({
    candidateName: 'Amanda Lee',
    candidateEmail: 'amanda.lee@example.com',
    workLocation: 'Singapore',
    nationality: 'China',
    currentLocation: 'China',
    jobTitle: 'Product Manager',
    salary: 'SGD 9,500 / month',
    degree: 'Bachelor',
    expectedStartDate: '2026-07-01',
    visaType: 'EP (Employment Pass)',
    remark: '',
    status: Status.Draft,
    documents: [],
    visaRequired: true,
    visaApplyType: 'Both',
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

  const renderBreadcrumbs = () => {
    const steps = [
      { id: WizardStep.ServiceModule, label: 'Service Module', icon: CheckCircle2, completed: step !== WizardStep.ServiceModule },
      { id: WizardStep.LocationProject, label: 'Service Location & Project', icon: CheckCircle2, completed: step === WizardStep.VisaRequirements },
      { id: WizardStep.VisaRequirements, label: 'Provide Candidate Information', icon: subStep === 'info' ? CheckCircle2 : Clock, completed: subStep === 'info' },
      { id: WizardStep.VisaRequirements, label: 'Collect Work Visa Requirements', icon: Clock, completed: false },
      { id: WizardStep.VisaRequirements, label: 'Other Remarks & Attachment', icon: Clock, completed: false },
    ];

    return (
      <div className="bg-white border-b border-slate-100 p-4 flex items-center gap-2 overflow-x-auto shrink-0">
        {steps.map((s, idx) => (
          <React.Fragment key={idx}>
            <div className={`flex items-center gap-2 pr-4 ${s.completed ? 'text-emerald-500' : step === s.id ? 'text-brand-blue' : 'text-slate-300'}`}>
              {s.completed ? <CheckCircle2 size={16} /> : <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] ${step === s.id ? 'border-brand-blue' : 'border-slate-200'}`}>{idx + 1}</div>}
              <span className="text-[11px] font-bold whitespace-nowrap">{s.label}</span>
            </div>
            {idx < steps.length - 1 && <ChevronRight size={14} className="text-slate-200 mr-4 shrink-0" />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {step === WizardStep.ServiceModule && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 overflow-y-auto">
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
          <div className="flex justify-center gap-4 mt-16 scale-110">
            <button onClick={() => navigate('/requests')} className="px-10 h-11 border border-slate-200 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
            <button 
              onClick={() => selectedModule && setStep(WizardStep.LocationProject)} 
              disabled={!selectedModule}
              className={`px-16 h-11 rounded-lg text-sm font-bold text-white shadow-xl flex items-center gap-2 group transition-all ${selectedModule ? 'bg-brand-blue shadow-blue-500/30' : 'bg-slate-300 opacity-50 cursor-not-allowed'}`}
            >
              Next
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {step === WizardStep.LocationProject && (
        <div className="flex-1 flex flex-col items-center p-12 overflow-y-auto">
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
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
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
          <div className="mt-20 flex gap-4">
            <button onClick={() => setStep(WizardStep.ServiceModule)} className="px-12 h-11 border border-slate-200 rounded-lg text-sm font-bold text-slate-500">Back</button>
            <button 
              onClick={() => selectedProject && setStep(WizardStep.VisaRequirements)} 
              disabled={!selectedProject}
              className={`px-24 h-11 rounded-lg text-sm font-bold text-white shadow-xl flex items-center justify-center gap-3 transition-all ${selectedProject ? 'bg-brand-blue shadow-blue-500/30' : 'bg-slate-300 cursor-not-allowed'}`}
            >
              Start Assessment
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === WizardStep.VisaRequirements && (
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
          {renderBreadcrumbs()}
          <div className="flex-1 flex overflow-hidden">
            <div className="w-64 border-r border-slate-100 p-6 flex flex-col gap-6 bg-slate-50/30">
              <button 
                onClick={() => setSubStep('type')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${subStep === 'type' ? 'bg-white text-brand-blue shadow-md ring-1 ring-slate-200' : 'text-slate-400'}`}
              >
                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">{subStep === 'info' ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 bg-brand-blue rounded-full" />}</div>
                <span className="text-xs font-black uppercase tracking-wider">Visa Type</span>
              </button>
              <button 
                disabled={subStep === 'type'}
                onClick={() => setSubStep('info')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${subStep === 'info' ? 'bg-white text-brand-blue shadow-md ring-1 ring-slate-200' : 'text-slate-300'}`}
              >
                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-brand-blue rounded-full opacity-0" /></div>
                <span className="text-xs font-black uppercase tracking-wider">Details</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 relative bg-slate-50/20">
              <div className="max-w-4xl mx-auto pb-24">
                {subStep === 'type' ? (
                  <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                      <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8">
                        Please confirm whether a visa application is required for the candidate based on actual needs. If yes, select the visa application type and provide detailed visa requirements. If not, simply select "No visa application required."
                      </p>

                      <div className="space-y-10">
                        <div className="space-y-4">
                          <label className="text-sm font-bold text-slate-900 block">
                            <span className="text-rose-500 mr-1">*</span>Is a visa application required?
                          </label>
                          <div className="flex gap-8">
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${draft.visaRequired ? 'border-brand-blue' : 'border-slate-300'}`}>
                                {draft.visaRequired && <div className="w-2.5 h-2.5 bg-brand-blue rounded-full" />}
                              </div>
                              <input type="radio" className="hidden" checked={draft.visaRequired === true} onChange={() => setDraft(p => ({ ...p, visaRequired: true }))} />
                              <span className={`text-sm font-medium ${draft.visaRequired ? 'text-brand-blue' : 'text-slate-600'}`}>Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${draft.visaRequired === false ? 'border-brand-blue' : 'border-slate-300'}`}>
                                {draft.visaRequired === false && <div className="w-2.5 h-2.5 bg-brand-blue rounded-full" />}
                              </div>
                              <input type="radio" className="hidden" checked={draft.visaRequired === false} onChange={() => setDraft(p => ({ ...p, visaRequired: false }))} />
                              <span className={`text-sm font-medium ${draft.visaRequired === false ? 'text-brand-blue' : 'text-slate-600'}`}>No</span>
                            </label>
                          </div>
                        </div>

                        {draft.visaRequired && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-sm font-bold text-slate-900 block">
                              <span className="text-rose-500 mr-1">*</span>Which type of visa do you need to apply for?
                            </label>
                            <div className="flex flex-wrap gap-8">
                              {[
                                { id: 'Employment', label: 'Employment Visa' },
                                { id: 'Dependant', label: 'Dependant Visa' },
                                { id: 'Both', label: 'Employment + Dependant' }
                              ].map((type) => (
                                <label key={type.id} className="flex items-center gap-2 cursor-pointer group">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${draft.visaApplyType === type.id ? 'border-brand-blue' : 'border-slate-300'}`}>
                                    {draft.visaApplyType === type.id && <div className="w-2.5 h-2.5 bg-brand-blue rounded-full" />}
                                  </div>
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
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <p className="text-sm text-slate-500 font-medium">Please select the visa type that the candidate needs to apply for and fill in the corresponding documents.</p>
                    
                    {/* Level 1 Tabs: Employment / Dependant */}
                    {(draft.visaApplyType === 'Both' || draft.visaApplyType === 'Employment' || draft.visaApplyType === 'Dependant') && (
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

                    {/* Content Section */}
                    {activeSection === 'candidate' ? (
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
                  </div>
                )}
              </div>
              <div className="fixed bottom-0 left-60 right-0 bg-white/90 border-t border-slate-100 p-6 flex justify-between items-center z-50">
                <button onClick={() => navigate('/requests')} className="text-sm font-bold text-slate-500 px-8">Discard</button>
                <div className="flex gap-4">
                  <button onClick={() => subStep === 'info' ? setSubStep('type') : setStep(WizardStep.LocationProject)} className="px-10 h-10 border border-slate-200 rounded-lg text-sm font-bold text-slate-600">Back</button>
                  <button 
                    onClick={() => {
                      if (subStep === 'type') {
                        setSubStep('info');
                      } else {
                        const newReq: AssessmentRequest = {
                          ...draft as AssessmentRequest,
                          id: `VA-2026-${Math.floor(Math.random() * 9000) + 1000}`,
                          status: Status.Submitted,
                          client: selectedProject?.client || 'Acme APAC Ltd.',
                          submittedDate: new Date().toISOString().split('T')[0],
                        };
                        onSubmit(newReq);
                      }
                    }}
                    className="px-20 h-10 rounded-lg text-sm font-bold text-white bg-brand-blue shadow-xl shadow-blue-500/30 flex items-center gap-2"
                  >
                    {subStep === 'type' ? 'Next' : 'Complete'}
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
