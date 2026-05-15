export enum Status {
  Draft = 'Draft',
  Submitted = 'Submitted',
  InAssessment = 'In Assessment',
  NeedMoreInformation = 'Need More Information',
  Approved = 'Approved',
  Rejected = 'Rejected',
  ConvertedToOnboarding = 'Converted to Onboarding',
  Cancelled = 'Cancelled'
}

export type Role = 'client' | 'sd';

export enum WizardStep {
  List = 'List',
  ServiceModule = 'ServiceModule',
  LocationProject = 'LocationProject',
  VisaRequirements = 'VisaRequirements'
}

export interface DocumentItem {
  id: string;
  name: string;
  isRequired: boolean;
  status: 'Missing' | 'Uploaded' | 'Not uploaded';
  lastUpdated?: string;
  file?: string;
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
  client: string;
  submittedDate: string;
  documents: DocumentItem[];
  onboardingRequestId?: string;
  visaRequired?: boolean;
  visaApplyType?: 'Employment' | 'Dependant' | 'Both';
}
