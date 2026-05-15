export enum Status {
  Pending = 'Pending',
  Processing = 'Processing',
  Revoked = 'Revoked',
  Canceled = 'Canceled',
  Closed = 'Closed',
  Completed = 'Completed'
}

export type Role = 'client' | 'sd';

export enum WizardStep {
  VisaSupportDecision = 'VisaSupportDecision',
  List = 'List',
  ServiceModule = 'ServiceModule',
  LocationProject = 'LocationProject',
  VisaRequirements = 'VisaRequirements'
}

export type CurrentStage =
  | 'visa_support_decision'
  | 'place_order'
  | 'visa_assessment'
  | 'client_supplement'
  | 'onboarding_info_completion'
  | 'submit_order'
  | 'confirm_order'
  | 'service_order'
  | 'closed'
  | 'completed';

export type CurrentTask =
  | 'Visa Support Decision'
  | 'Place Order'
  | 'Confirm Visa Assessment'
  | 'Supplement Assessment Materials'
  | 'Complete Onboarding Info'
  | 'Submit Order'
  | 'Confirm Order [EoR - Onboarding]'
  | 'Open Service Order'
  | 'Apply Visa Before Onboarding'
  | 'Apply Visa After Onboarded'
  | 'Complete Order'
  | 'Close Request'
  | 'N/A';

export interface DocumentItem {
  id: string;
  name: string;
  isRequired: boolean;
  status: 'Missing' | 'Uploaded' | 'Not uploaded';
  lastUpdated?: string;
  file?: string;
}

export interface HistoryRecord {
  id: string;
  date: string;
  actor: string;
  action: string;
  meta?: string[];
}

export interface AssessmentRequest {
  id: string;
  candidateName: string;
  candidateEmail: string;
  workLocation: string;
  nationality: string;
  currentLocation: string;
  jobTitle: string;
  salary: string;
  degree: string;
  expectedStartDate: string;
  visaType: string;
  remark: string;
  status: Status;
  currentStage: CurrentStage;
  currentTask: CurrentTask;
  client: string;
  submittedDate: string;
  documents: DocumentItem[];
  onboardingRequestId?: string;
  visaRequired?: boolean;
  visaApplyType?: 'Employment' | 'Dependant' | 'Both';
  returnRemarks?: string;
  pendingAssignee?: string;
  completedRecords?: HistoryRecord[];
}
