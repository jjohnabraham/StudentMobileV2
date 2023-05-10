export interface EnrollmentDegreeInfo {
  AdEnrollId: number;
  EnrollmentStatus: string;
  Degree: Degree;
  SuccessCoachName: string;
  SuccessCoachEmail: string;
  SuccessCoachPhone: string;
  IsCurrent: boolean;
  Displayname: string;
  ExpectedGraduationDate: Date;
  CreditsRequired: number;
  CreditsEarned: number;
  CreditsAttempted: number;
  CreditsInProgress: number;
  CreditsRemaining: number;
  GPA: number;
  GPACalc: number;
  MilestoneMessage: string;
  DegreeCompletion: number;
  IsMinCreditsCompleted: boolean;
  HasInCompleteClasses: boolean;
  IsDegreeMessageExcluded: boolean;
}

export interface Degree {
  Title: string;
  Concentration: string;
  ProgramCode: string;
  MessageType: number;
  Message: string;
  FastTrackSchedulingMessage: string;
}

export interface Enrollment {
  AdEnrollId: number;
  EnrollmentStatus: string;
  Degree: Degree;
  SuccessCoachName: string;
  SuccessCoachEmail: string;
  SuccessCoachPhone: string;
  IsCurrent: boolean;
  Displayname: string;
  ExpectedGraduationDate: Date;
  AdEnrollmentDescription: string;
  CreditsRequired: number;
  CreditsEarned: number;
  CreditsAttempted: number;
  CreditsInProgress: number;
  CreditsRemaining: number;
  GPA: number;
  GPACalc: number;
  MilestoneMessage: string;
  DegreeCompletion: number;
  IsMinCreditsCompleted: boolean;
  HasInCompleteClasses: boolean;
  IsDegreeMessageExcluded: boolean;
  length: number;
}

export interface EnrollmentClassesInfo {
  ClassList: CourseInfo[];
  FastTrackScheduledExamsList: FastTrackScheduledExamsList[];
  FastTrackActionMessage: string;
  AccelerateAssessmentOpportunityActionMessage: string;
  transferPendingClass: TransferPendingClass;
  UnofficialTransferCredit: number;
  AppliedTransferCredit: number;
  AdEnrollId: number;
  EnrollmentStatus: string;
  Degree: Degree;
  SuccessCoachName: string;
  SuccessCoachEmail: string;
  SuccessCoachPhone: string;
  IsCurrent: boolean;
  Displayname: string;
  ExpectedGraduationDate: Date;
  CreditsRequired: number;
  CreditsEarned: number;
  CreditsAttempted: number;
  CreditsInProgress: number;
  CreditsRemaining: number;
  GPA: number;
  GPACalc: number;
  MilestoneMessage: string;
  DegreeCompletion: number;
  IsMinCreditsCompleted: boolean;
  HasInCompleteClasses: boolean;
  IsDegreeMessageExcluded: boolean;
}

export interface CourseInfo {
  CourseName: string;
  AdClassSchedId: number;
  AdenrollSchedId: number;
  AdcourseId: number;
  LmsClassId: number;
  Term: Term;
  TermCode: string;
  SyCampusId: number;
  SourceSystemId: number;
  StartDate: Date;
  EndDate: Date;
  CourseCode: string;
  Description: string;
  Section: string;
  InstructorName: string;
  InstructorSyStaffId: number;
  InstructorSourceSystemId: number;
  InstructorEmail: string;
  InstructorIsActive: boolean;
  InstructorIsPlaceHolder: boolean;
  CreditsPossible: number;
  CreditsEarned: number;
  QualityPoints: number;
  LetterGrade: string;
  NumericGrade: number;
  ScheduleType: number;
  Locations: Location[];
  Institution: string;
  Actionable: boolean;
  IsFastTrackEligibleClass: boolean;
  IsAccelerateAssessmentOpportunityEligibleClass: boolean;
  NoAssignmentMessage: NoAssignmentMessage;
}

export interface Location {
  RoomNumber: string;
  RoomDescrip: string;
  BuildingNumber: string;
  BuildingCode: string;
  BuildingDescrip: string;
  StartTimeFormattedString: string;
}

export interface NoAssignmentMessage {
  Message: string;
  Email: string;
  Phone: string;
}

export interface Term {
  AdTermId: number;
  Code: string;
  Description: string;
  StartDate: Date;
  EndDate: Date;
  StudentHonorsType: number;
}

export interface Degree {
  Title: string;
  Concentration: string;
  ProgramCode: string;
  MessageType: number;
  Message: string;
  FastTrackSchedulingMessage: string;
}

export interface FastTrackScheduledExamsList {
  StartDate: Date;
  Enddate: Date;
  CourseCode: string;
  Term: string;
  Description: string;
  Section: string;
}

export interface TransferPendingClass {
  TransferCourseHelpMessage: string;
  TransferClassList: TransferClassList[];
}

export interface TransferClassList {
  TransferCourseDescrip: string;
  TransferCreditsEarned: number;
  TransferCourseCode: string;
  TransferSchoolName: string;
  TermCode: string;
}

export interface FastTrackInfo {
  IsSuccess: boolean;
  Message: string;
  ResultCode: number;
  NextAvailableDates: NextAvailableDate[];
}

export interface NextAvailableDate {
  FTTermId: number;
  FTCourseId: number;
  FTTermStartdate: Date;
}
