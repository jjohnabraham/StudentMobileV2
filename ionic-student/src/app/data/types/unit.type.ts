import { SafeHtml } from '@angular/platform-browser';

export interface Unit {
  UnitOverview: UnitInfo;
  IsSubmissionsPilot: boolean;
  HasAssignments: boolean;
  ClassId: number;
  LmsTopicId: number;
  UnitNumber: string;
  UnitTitle: string;
  IsCurrent: boolean;
  StartDate: Date;
  EndDate: Date;
  MinDueDate: Date;
  MaxDueDate: Date;
  HasCourseOverview: boolean;
}

export interface UnitAssignment {
  ClassId: number;
  CourseCode: string;
  UnitNumber: string;
  UnitTitle: string;
  StartDate: Date;
  EndDate: Date;
  Assignments: UnitAssignmentElement[];
  IsSubmissionsPilot: boolean;
  IsDiscussionBoardPilot: boolean;
  IsZoomPilot: boolean;
}

export interface UnitAssignmentElement {
  IsAssignment: boolean;
  EarnedPoints: number;
  IsExtraCredit: boolean;
  GradeLetter: string;
  HasInClassAssessmentFeature: boolean;
  HasInClassSubmissionFeature: boolean;
  IsDismissed: boolean;
  AssignmentPart: UnitAssignmentPart[];
  IsIntellipathAssignment: boolean;
  HasLearningMaterialsFeature: boolean;
  HasSubmissionFeature: boolean;
  HasDiscussionBoardFeature: boolean;
  HasLiveChatFeature: boolean;
  HasAssessmentFeature: boolean;
  IsQuiz: boolean;
  IsGroupProject: boolean;
  IsEditable: boolean;
  IsDeletable: boolean;
  IsAutoCalculateGrade: boolean;
  IsPostedToStudent: boolean;
  IsCommon: boolean;
  HasSimulationFeature: boolean;
  IsGraded: boolean;
  Features: null;
  AssignmentId: number;
  SourceLmsAssignmentId: number;
  AssignmentName: string;
  Description: string;
  AssignmentTypeId: number;
  IsGradable: boolean;
  AssignmentTypeName: string;
  DueDate: Date;
  DueDateOffset: number;
  Upcoming: boolean;
  PossiblePoints: number;
  IsCopyable: boolean;
}

export interface UnitAssignmentPart {
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

export interface UnitInfo {
  ClassId: number;
  LmsTopicId: number;
  UnitNumber: string;
  UnitTitle: string;
  StartDate: Date;
  EndDate: Date;
  UnitDescription: string;
  UnitIntroduction: string;
}

export interface UnitObjectives {
  UnitNumber: string;
  UnitTitle: string;
  StartDate: Date;
  EndDate: Date;
  StartDateOffset: number;
  EndDateOffset: number;
  ObjectiveList: UnitObjective[];
}

export interface UnitObjective {
  LmsClassId: number;
  LmsAssignmentId: number;
  ObjectiveTitle: string;
  LmsTopicId: number;
  ContextTypeId: number;
}

export interface UnitLearningMaterials {
  Url: string;
  AdClassId: number;
  AssignmentId: number;
  AssignmentName: string;
  ClassId: number;
  ContextId: number;
  ContextTypeId: number;
  Description: string;
  DocumentID: number;
  IsActive: boolean;
  IsRequired: boolean;
  IsResource: boolean;
  MimeType: string;
  Name: string;
  ParentResourceID: number;
  ResourceID: number;
  ResourceType: string;
  Size: number;
  SizeText: string;
  SourceLmsClassId: number;
  UnitName: string;
  UnitNumber: string;
}

export interface UnitSteps {
  Step: Step;
  SubSteps: Step[];
}

export interface Step {
  Html: SafeHtml;
  LmsStepId: number;
  ShortTitle: string;
  Title: string;
  Body: string;
  Footer: string;
  DerivedShortTitle: string;
  C3StepId: number;
  UnitId: number;
  UnitNumber: number;
  SubstepNumber: number;
}
