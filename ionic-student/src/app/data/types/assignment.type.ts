import { ClassScenario, ClassUnit, GroupMembersSubmission } from './class.type';

export interface AssignmentDetails {
  AssignmentDetails: ClassAssignment[];
  TotalPossiblePoints: number;
  IsScenarioExist: boolean;
  AssignmentListUrl: string;
  UnitList: ClassUnit[];
  AssignmentWeightsByCategory: AssignmentWeight[];
}

export interface ClassAssignment {
  AbbreviatedName: string;
  AdaptiveAssignmentId: string;
  AssignmentChildPostFulfillmentCount: number;
  AssignmentFooter: AssignmentFooter;
  AssignmentGradeTypeId: number;
  AssignmentGradeTypeName: string;
  AssignmentId: number;
  AssignmentLayoutTypeId: number;
  AssignmentName: string;
  AssignmentParentPostFulfillmentCount: number;
  AssignmentPart: AssignmentPart[];
  AssignmentSubTitle1: string;
  AssignmentSubTitle2: string;
  AssignmentTypeId: number;
  AssignmentTypeName: string;
  AssignmentUrl: string;
  DeliverableLength: string;
  Description: string;
  DueDate: Date;
  DueDateOffset: number;
  EarnedPoints: number;
  EndDate: Date;
  FacultyCommentsForStudent: string;
  FeatureAvailabilityDate: Date;
  Features: any;
  ForumName: string;
  GradeDueDate: Date;
  GradeLetter: string;
  GradePercentage: number;
  GroupId: number;
  GroupMembersSubmissions: GroupMembersSubmission[];
  GroupName: string;
  HasAssessmentFeature: boolean;
  HasDiscussionBoardFeature: boolean;
  HasInClassAssessmentFeature: boolean;
  HasInClassSubmissionFeature: boolean;
  HasLearningMaterialsFeature: boolean;
  HasGradeMaskedAssignment: boolean;
  HasLiveChatFeature: boolean;
  HasSimulationFeature: boolean;
  HasSubmissionFeature: boolean;
  HoursTillDue: number;
  Instructions: string;
  InstructorComments: string;
  InstructorFeedbackUrl: string;
  IsAutoCalculateGrade: boolean;
  IsCommon: boolean;
  IsCopyable: boolean;
  IsDeletable: boolean;
  IsDismissed: boolean;
  IsEditable: boolean;
  IsExtraCredit: boolean;
  IsGradable: boolean;
  IsGraded: boolean;
  IsGroupProject: boolean;
  IsIntellipathAssignment: boolean;
  IsOverdue: boolean;
  IsPostedToStudent: boolean;
  IsQuiz: boolean;
  IsQuizCompleted: boolean;
  IsRandomizedQuestions: boolean;
  IsShared: boolean;
  IsSubmissionAddedToEPortfolio: boolean;
  LcmsId: string;
  LcsClassId: string;
  LCMSInstructions: string;
  MaxAttempts: number;
  ModelAnswer: string;
  ObjectivesList: string[];
  OriginalDueDate: Date;
  PossiblePoints: number;
  PublishDate: Date;
  PublishSystemId: string;
  QuizStartDate: Date;
  ReadingAssignment: string;
  ReasonToExtend: string;
  ResourceList: string[];
  ScenarioList: ClassScenario[];
  ShowDate: Date;
  SourceLmsAssignmentId: number;
  StartDate: Date;
  StudentAssignmentDocuments: StudentAssignmentDocument[];
  StudentRating: number;
  TalkingPoints: string;
  TimeAllowed: number;
  Topics: string;
  UnitDescription: string;
  UnitName: string;
  UnitNumber: string;
  UnitTitle: string;
  Upcoming: boolean;
}

export interface AssignmentFooter {
  AssignmentId: number;
  AssignmentType: number;
  AssignmentTypeDescription: string;
  AssignmentUrl: string;
}

export interface AssignmentPart {
  AssignmentPartId: number;
  LmsAssignmentId: number;
  Title: string;
  Description: string;
  DueDate: Date;
  PointsPossible: number;
  DisplayOrder: number;
  IsDismissed: boolean;
  PartUrl: string;
  DueDateOffset: number;
}

export interface AssignmentWeight {
  AssignmentTypeName: string;
  PossiblePoints: number;
  GradePercentage: number;
}

export interface StudentAssignmentDocument {
  LMSDocumentID: number;
  MimeType: string;
  Name: string;
}

export interface DetailsOfAssignment {
  SourceSystem: number;
  LmsAssignmentId: number;
  SyStudentId: number;
  PortalUserId: number;
  PointsEarned: number;
  PointsPossible: number;
  GradePercent: number;
  FinalActualGradingPoints: number;
  GradeLetter: string;
  StudentFinalGradingComments: string;
  FinalGradingComments: string;
  AssignmentFiles: AssignmentFile[];
}

export interface AssignmentFile {
  LmsClassId: number;
  LMSAssignmentID: number;
  StudentAssignmentID: number;
  LMSDocumentMappingID: number;
  LMSDocumentID: number;
  Title: string;
  Description: string;
  LMSDocumentPhysicalID: number;
  DocumentName: string;
  DocumentPath: string;
  MIMEType: string;
  IsEditable: boolean;
  UnitSequenceNumber: string;
  CreateDate: Date;
  UnitTitle: string;
  Size: number;
}

export interface AssignmentSummary {
  IsAssignment: boolean;
  AbbreviatedName: string;
  AdaptiveAssignmentId: string;
  AssignmentChildPostFulfillmentCount: number;
  AssignmentGradeTypeId: number;
  AssignmentGradeTypeName: string;
  AssignmentId: number;
  AssignmentLayoutTypeId: number;
  AssignmentName: string;
  AssignmentParentPostFulfillmentCount: number;
  AssignmentPart: AssignmentPart[];
  AssignmentTypeId: number;
  AssignmentTypeName: string;
  Description: string;
  DueDate: Date;
  DueDateOffset: number;
  EarnedPoints: number;
  EndDate: Date;
  Features: null;
  GradeDueDate: Date;
  GradeLetter: string;
  HasAssessmentFeature: boolean;
  HasDiscussionBoardFeature: boolean;
  HasInClassAssessmentFeature: boolean;
  HasInClassSubmissionFeature: boolean;
  HasLearningMaterialsFeature: boolean;
  HasGradeMaskedAssignment: boolean;
  HasLiveChatFeature: boolean;
  HasSimulationFeature: boolean;
  HasSubmissionFeature: boolean;
  HoursTillDue: number;
  IsAutoCalculateGrade: boolean;
  IsCommon: boolean;
  IsCopyable: boolean;
  IsDeletable: boolean;
  IsEditable: boolean;
  IsExtraCredit: boolean;
  IsGradable: boolean;
  IsGraded: boolean;
  IsGroupProject: boolean;
  IsIntellipathAssignment: boolean;
  IsOverdue: boolean;
  IsPostedToStudent: boolean;
  IsQuiz: boolean;
  IsShared: boolean;
  PossiblePoints: number;
  PublishDate: Date;
  PublishSystemId: string;
  ShowDate: Date;
  SourceLmsAssignmentId: number;
  StartDate: Date;
  UnitName: string;
  UnitNumber: string;
  UnitTitle: string;
  Upcoming: boolean;
}

export interface CourseBook {
  Url: string;
  CourseName: string;
  Title: string;
  Author: string;
  Publisher: string;
  Edition: string;
  ISBN: string;
  TermCode: string;
  CourseCode: string;
  Section: string;
  ClassId: number;
  StartDate: Date;
  EndDate: Date;
  IsCurrentClass: boolean;
  IsEbook: boolean;
  MaterialType: string;
  MaterialUrl: string;
  ItalicizedTitle: boolean;
  CourseMaterialsText: string;
  BooksAndGuideText: string;
}
