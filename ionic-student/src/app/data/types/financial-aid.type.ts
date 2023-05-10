export interface ActionViewType {
  FinancialAidDocumentRedirectUrl: string;
  ShowAdditionalActionButton: boolean;
  RequiredActions: RequiredAction[];
  RequestedNotRequiredActions: RequiredAction[];
}

export interface RequiredAction {
  CmDocumentId: number;
  CmDocTypeId: number;
  Summary: string;
  Details: string;
  DocumentLink: string;
  SubmissionMethod: number;
  DocumentSubmissionDate: Date;
  DocumentAssignedDate: Date;
  HasInstruction: boolean;
  DateDue: Date;
  DocStatus: string;
  TimeToComplete: TimeToComplete;
  LevelOfUrgency: LevelOfUrgency;
  Department: string;
}

export interface Payment {
  DisplayFaPaymentInfoCard: boolean;
  PastDuePaymentAmount: number;
  NextPaymentDueAmount: number;
  NextPaymentDueDate: string;
  StudentPortalPaymentURL: string;
  TfcPaymentUrl: string;
  UseTfcSiteForPayment: boolean;
}

export interface StatusViewType {
  IsPackaged: boolean;
  NotYetPackagedActions: null;
  Message: string;
  FinancialAidAwardRedirectUrl: string;
  FinancialAidStatuses: FinancialAidStatus[];
}

export interface FinancialAidStatus {
  AcademicYearEndDate: Date;
  AcademicYearStartDate: Date;
  AdEnrollId: number;
  DisplayOrder: number;
  EnrolledDegreeCode: string;
  FaStudentAyId: number;
  HasAward: boolean;
  Message: string;
  Status: number;
  Title: string;
}

export interface Tips {
  Message: string;
}

export interface AwardLetter {
  DateDue: Date;
  CmDocumentId: number;
  CmDocTypeId: number;
  CmDocStatusId: number;
  CmDocTypeDescrip: string;
  CmDocStatus: string;
  NewDocStatus: string;
  HighImportance: boolean;
  SyModuleId: number;
  RequestedBy: string;
  DateReceived: Date;
  ImageNowId: string;
  UrlPathAndQuery: string;
  ShowLink: boolean;
  HasStatusMessage: boolean;
  HasInstruction: boolean;
  PortalViewable: boolean;
}

export enum TimeToComplete {
  None = 0,
  OneMinute = 1,
  FiveMinutes = 2,
  FifteenMinutes = 3,
  ThirtyMinutes = 4,
  NA = 5,
}

export enum LevelOfUrgency {
  None = 0,
  Always = 1,
  ThreeDays = 2,
  Week = 3,
  TwoWeeks = 4,
  ThreeWeeks = 5,
  NA = 6,
}
