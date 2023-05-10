import { AssignmentFooter, AssignmentWeight, ClassAssignment } from './assignment.type';
import { UnitObjective } from './unit.type';
import { Location } from './enrollment.type';

export interface Class {
  AdClassId: number;
  AnnouncementStudentSummary: AnnouncementStudentSummary;
  CampusId: number;
  ClassEnded: boolean;
  ClassId: number;
  ClassTermType: string;
  CourseCode: string;
  CourseId: number;
  CourseName: string;
  CourseSection: string;
  Credits: number;
  CurrentClassStatus: string;
  CurrentGradeLetter: string;
  CurrentGradePercentage: number;
  DaysLeft: number;
  EarlyDaysCount: number;
  EarlyMonthCount: number;
  EarlyMonthDayCount: number;
  EndDate: Date;
  EnrollmentId: number;
  FinalGradeLetter: string;
  FinalGradePercentage: number;
  HasGradeMaskedAssignment: boolean;
  HasDiscussionBoardFeature: boolean;
  IsAccelerated: boolean;
  IsBypassClassroom: boolean;
  IsCompleted: boolean;
  IsCurrent: boolean;
  IsCurrentTerm: boolean;
  IsCustomCourse: boolean;
  IsEarlyAccess: boolean;
  IsFuture: boolean;
  IsHadron: boolean;
  IsHold: boolean;
  IsHybridClass: boolean;
  IsInComplete: boolean;
  IsOrientation: boolean;
  LastDateOfAttendance: Date;
  Locations: Location[];
  NumOfGradedAssignments: number;
  NumOfGradedAssignmentsExcludeExtraCredit: number;
  ParentAdClassId: number;
  ParentSourceSystemId: number;
  PrimaryInstructor: string;
  PrimaryInstructorEmail: string;
  PrimaryInstructorIsActive: boolean;
  PrimaryInstructorIsPlaceHolder: boolean;
  PrimaryInstructorPhone: string;
  PrimaryInstructorSendBirdId: string;
  ShowCurrentClassLink: boolean;
  ShowDaysLeft: boolean;
  ShowIntelliPathLink: boolean;
  ShowLDA: boolean;
  SourceSystemId: number;
  StaffId: number;
  StartDate: Date;
  TermCode: string;
  TermDescription: string;
  TermEndDate: Date;
  TermId: number;
  TermStartDate: Date;
  TotalAssignments: number;
  WeeksLeftCount: number;
  HadronV3: boolean;
}

export interface AnnouncementStudentSummary {
  LmsClassId: number;
  SSID: number;
  SyStudentID: number;
  NotificationTypeID: number;
  Total: number;
  Read: number;
  UnRead: number;
  Active: number;
  ActiveRead: number;
  ActiveUnread: number;
  Dismissed: number;
  DismissedRead: number;
  DismissedUnRead: number;
}

export interface ClassStatus {
  HasAccess: boolean;
  Title: string;
  Message: string;
  TemplateId: number;
  ClassRedirectUrl: string;
  IsStandard: boolean;
  ShowPolicy: boolean;
  ShowUserPolicy: boolean;
  ShowClassPolicy: boolean;
  HadronV3: boolean;
}

export interface AcceptPolicyResponse {
  RecordsAffected: number;
}

export interface ClassInfo {
  RolledOut: boolean;
  TemplateId: number;
  TermId: number;
  TermCode: string;
  ClassId: number;
  IsCustomCourse: boolean;
  SourceSystemId: number;
  ClassCampusId: number;
  SyCampusId: number;
  AdaptiveGroupId: string;
  LCSClassId: string;
  LCSDiscussionBoardId: string;
  LCSGroupDisscussionBoardId: string;
  LCSCourseGalleryDBId: string;
  CourseTitle: string;
  CourseCode: string;
  Section: string;
  CourseSection: string;
  TotalSections: number;
  CourseDescription: string;
  CourseOverview: string;
  CourseMaterialsText: string;
  BooksAndGuideText: string;
  CreditHours: number;
  ContactHours: number;
  CourseMaterials: CourseMaterial[];
  FinalGradesNotPostedOrIncomplete: boolean;
  Instructors: Instructor[];
  InstructorHours: InstructorSchedule[];
  PrimaryInstructor: Instructor;
  StartDate: Date;
  EndDate: Date;
  ClassEnded: boolean;
  IsFutureClass: boolean;
  LastDateOfAttendance: Date;
  CurrentGradePercentage: number;
  CurrentGradeLetter: string;
  NumOfGradedAssignments: number;
  HasEarlyAccessEdit: boolean;
  IsDiscussionBoardPilot: boolean;
  IsZoomPilot: boolean;
  IsSubmissionsPilot: boolean;
  ShowPolicy: boolean;
  ShowUserPolicy: boolean;
  ShowClassPolicy: boolean;
  IsBypassClassroom: boolean;
  challengeExamPolicy: string;
  AssignmentList: ClassAssignment[];
  UnitList: ClassUnit[];
  ScenarioList: ClassScenario[];
  AssignmentWeightsByCategory: AssignmentWeight[];
  IsInEarlyAccess: boolean;
  Settings: string;
  LiveSessionList: ClassLiveSession[];
  NextMeeting: ClassLiveSession;
  IsFinalGradePeriod: boolean;
  FinalGradingStartDate: Date;
  FinalGradingEndDate: Date;
  IsMidTermGradePeriod: boolean;
  MidTermGradingStartDate: Date;
  MidTermGradingEndDate: Date;
  IsFacultyForClass: boolean;
  IsAdmin: boolean;
  IsAdminReadOnly: boolean;
  HasMidTermGrade: boolean;
  ObjectivesList: string[];
  ResourceList: string[];
  ShowAtRiskFeature: boolean;
  ShowRepeatingCourse: boolean;
  PreRequisiteList: ClassPreRequisite[];
  ClassBreakList: ClassBreak[];
  HasCourseRubric: boolean;
  CourseRubric: CourseRubric;
  AttendanceScheduleList: ClassAttendanceSchedule[];
  ScheduleList: ClassSchedule[];
  UnreadAnnouncements: number;
  StudentEarlyAccessDate: Date;
  FeatureAvailabilityDate: Date;
  DeliveryMethod: number;
  area: string;
  OverlayCampaign: OverlayCampaign;
  IsAddAssignmentVisible: boolean;
  IsAttendancePostingEnabled: boolean;
  HideBookshelfLink: boolean;
  IsOnlineSchool: boolean;
  LscDisabled: boolean;
  GradeScales: GradeScale[];
  TermStartDate: Date;
  AddAssignmentWindowsDaysOffset: number;
  Locations: ClassLocation[];
  IsOrientation: boolean;
  IsMP4Enabled: boolean;
  DueDateNullText: string;
  IsIFFEnabled: boolean;
  ShowOVPage: boolean;
}

export interface GroupMembersSubmission {
  FirstName: string;
  LastName: string;
  Email: string;
  ClassStatus: string;
  SyStudentId: number;
  IsActiveGroupMember: boolean;
  IsMe: boolean;
  IsActive: boolean;
  SubmissionDetailList: SubmissionDetail[];
}

export interface SubmissionDetail {
  GroupName: string;
  GroupId: number;
  SubmissionTitle: string;
  FeatureId: number;
  TopicId: string;
  SubmissionDate: Date;
  Action: string;
  MetaData: SubmissionMetaData;
  ContextTypeId: number;
}

export interface SubmissionMetaData {
  [key: string]: string;
}

export interface ClassScenario {
  ScenarioId: number;
  ContextTypeId: number;
  ContextId: number;
  Scenario: string;
}

export interface ClassAttendanceSchedule {
  AttendanceID: number;
  Date: Date;
  StartTime: Date;
  LengthInMinutes: number;
  Status: number;
  Room: ClassRoom;
}

export interface ClassRoom {
  Code: string;
  Description: string;
  RoomNumber: string;
  BuildingNumber: string;
  BuildingDescription: string;
}

export interface ClassBreak {
  SourceSystem: number;
  AdClassSchedId: number;
  Code: string;
  Description: string;
  StartDate: Date;
  EndDate: Date;
  AdShiftId: number;
  SyCampusId: number;
}

export interface CourseMaterial {
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

export interface CourseRubric {
  ContextTypeId: number;
  ContextId: number;
  DocumentID: number;
  ResourceID: number;
  ParentResourceID: number;
  Name: string;
  Description: string;
  Size: number;
  MimeType: string;
  IsResource: boolean;
  ResourceType: string;
  IsRequired: boolean;
  IsActive: boolean;
}

export interface GradeScale {
  GradeScaleID: number;
  LetterGrade: string;
  Description: string;
  LowerLimit: number;
  UpperLimit: number;
  IsPassFail: boolean;
}

export interface InstructorSchedule {
  AvailableHoursScheduleId: number;
  Day: string;
  ContactInformation: string;
  Active: boolean;
  Start: string;
  End: string;
  StartMeridian: string;
  EndMeridian: string;
  DayOrder: number;
  ContactMethod: string;
  Url: string;
  DiscussionBoardId: number;
  LiveClassSessionId: number;
}

export interface Instructor {
  SourceSystem: number;
  SyStaffID: number;
  InstructorType: number;
  Name: InstructorName;
  Email: string;
  Contact: InstructorContact;
  FirstName: string;
  LastName: string;
}

export interface InstructorContact {
  EmailAddress: string;
  Phone: string;
  WorkExt: string;
}

export interface InstructorName {
  FirstName: string;
  LastName: string;
  FullName: string;
}

export interface MeetingTypeDetails {
  MeetingTypeId: number;
  SourceSystemId: number;
  SyCampusId: number;
  Description: string;
  AllowMultipleClassSections: boolean;
}

export interface ClassLocation {
  SourceSystem: number;
  AdClassSchedId: number;
  RoomNumber: string;
  RoomCode: string;
  RoomDescrip: string;
  BuildingNumber: string;
  RoomCapacity: number;
  BuildingCode: string;
  BuildingDescrip: string;
  StartTime: Date;
  ClassDay: string;
  DayOfWeek: number;
  EndTime: Date;
  StartTimeFormattedString: string;
}

export interface OverlayCampaign {
  OverlayCampaignId: number;
  OverlayCampaignsCampusMappingId: number;
  Title: string;
  Introduction: string;
  VideoLink: string;
  DownloadLinks: string[];
  StartDate: Date;
  EndDate: Date;
  NumberOfAttempts: number;
  AttemptsLimit: number;
  IsLastAttempt: boolean;
  LastAttemptDate: Date;
  IsCompleted: boolean;
  ImageLink: string;
  ActionText: string;
  ActionUrl: string;
  MediaType: number;
}

export interface ClassPreRequisite {
  CourseCode: string;
  Description: string;
  AdCourseId: number;
  Credits: number;
}

export interface ClassSchedule {
  DayOfTheWeek: number;
  Room: ClassRoom;
  StartTime: Date;
  LengthInMinutes: number;
  EndTime: Date;
  OfficeHourDay: string;
}

export interface ClassUnit {
  ClassId: number;
  LmsTopicId: number;
  UnitNumber: string;
  UnitTitle: string;
  IsCurrent: boolean;
  StartDate: Date;
  EndDate: Date;
  StartDateOffset: number;
  EndDateOffset: number;
  MinDueDate: Date;
  MaxDueDate: Date;
  ObjectiveList: UnitObjective[];
}

export interface ClassSummary {
  ClassId: number;
  SourceSystem: number;
  AdClassSchedId: number;
  SyCampusId: number;
  StartDate: Date;
  EndDate: Date;
  RolledOut: boolean;
  CreditHours: number;
  CourseTitle: string;
  CourseCode: string;
  TermCode: string;
  Section: string;
  NextMeeting: ClassSummaryMeeting;
  NextLiveSession: NextLiveSession;
  AssignmentList: ClassSummaryAssignment[];
  LiveSessionList: ClassLiveSession[];
  PrimaryInstructor: PrimaryInstructor;
  StudentSpecific: StudentSpecific;
  IsMP4Enabled: boolean;
}

export interface ClassSummaryAssignment {
  AssignmentGradeTypeId: number;
  DueDate: Date;
  HasAssessmentFeature: boolean;
  HasDiscussionBoardFeature: boolean;
  HasSimulationFeature: boolean;
  HasSubmissionFeature: boolean;
  IsAssignment: boolean;
  IsAutoCalculateGrade: boolean;
  IsCommon: boolean;
  IsExtraCredit: boolean;
  IsIntellipathAssignment: boolean;
  IsPostedToStudent: boolean;
  IsQuiz: boolean;
  LmsAssignmentId: number;
  PartList: ClassAssignmentPart[];
  PossiblePoints: number;
  ShowDate: Date;
  Title: string;
  TypeName: string;
}

export interface ClassAssignmentPart {
  AssignmentPartId: number;
  LmsAssignmentId: number;
  Title: string;
  Description: string;
  DueDate: Date;
  PointsPossible: number;
  DisplayOrder: number;
  DueDateOffset: number;
}

export interface ClassLiveSession {
  IsArchive: boolean;
  IsAssignment: boolean;
  LMSAssignmentId: number;
  TimeZoneCode: string;
  IsNextMeetingForInstructor: boolean;
  Active: boolean;
  CourseTermSectionString: string;
  ZoomUrl: string;
  SyCampusId: number;
  ContextTypeId: number;
  CurrentFlag: number;
  Description: string;
  EndDateTime: Date;
  LCMSCurrentVersion: string;
  LCMSIdentifier: string;
  ClassIds: number[];
  LiveSessionId: number;
  RecordedSessionId: number;
  GroupId: number;
  SessionType: number;
  Ssid: number;
  StartDateTime: Date;
  StartDateTimeUTC: Date;
  StartDateTimeSchool: Date;
  EndDateTimeUTC: Date;
  StartDateTimeFormattedString: string;
  Title: string;
  Topic: string;
  MeetingTypesMapId: number;
  MeetingTypeDetails: MeetingTypeDetails;
  UnitTypeId: string;
  MeetingTypeId: number;
  HideMeetingForStudent: boolean;
  MeetingDescription: string;
  IsPostedToMulipleClassSection: boolean;
  HostUserId: number;
  HostFirstName: string;
  HostLastName: string;
  IsHostUserActive: boolean;
  Duration: string;
  Viewed: boolean;
  StartDtYear: number;
  StartDtMonth: number;
  StartDtDay: number;
  StartDtHour: number;
  StartDtMinute: number;
  AvailableImmediately: boolean;
  LiveChatUrl: string;
  IsRecurring: boolean;
  MeetingType: number;
  SendEmail: boolean;
  BuildingDescription: string;
  BuildingCode: string;
  RoomNumber: string;
  RoomCode: string;
  Vendor: number;
  RecurringIdentifier: string;
  EndDateTimeFormattedString: string;
  RecordingScoId: number;
  IsRecordingMp4: boolean;
  Mp4Url: string;
  ShowMiniLesson: boolean;
}

export interface NextLiveSession {
  LiveSessionID: number;
  StartDateTime: Date;
  EndDateTime: Date;
  Title: string;
  SessionType: number;
  DayOfTheWeek: number;
}

export interface ClassSummaryMeeting {
  Date: Date;
  StartTime: Date;
  LengthMinutes: number;
  Status: string;
  RoomCode: string;
  RoomDescrip: string;
  RoomBuildingNumber: string;
  RoomRoomNumber: string;
  RoomCapacity: number;
  BuildingCode: string;
  BuildingDescrip: string;
}

export interface PrimaryInstructor {
  SourceSystem: number;
  SyStaffId: number;
  FirstName: string;
  LastName: string;
  FullName: string;
  Email: string;
}

export interface StudentSpecific {
  SourceSystem: number;
  SyStudentId: number;
  LDA: Date;
  IsOrientation: boolean;
  CurrentGradeLetter: string;
  CurrentGradePercentage: number;
  CourseDescription: string;
  CourseOverview: string;
  IsAccelerated: boolean;
}

export interface ClassSettings {
  UserSettingId: number;
  UserSettingTypeId: number;
  Ssid: number;
  SyCampusId: number;
  SyStudentId: number;
  SyStaffId: number;
  PortalUserId: number;
  AdClassId: number;
  LmsIdentifier: string;
  Settings: string;
}

export interface SaveSettingResponse {
  RecordsAffected: number;
}

export interface LiveChatUri {
  Uri: string;
  Vendor: number;
  error: LiveChatUriError;
}

export interface LiveChatUriError {
  ErrorTitle: string;
  ErrorSubTitle: string;
  StatusAs500: boolean;
  ShowTitle: boolean;
  ErrorMessage: string;
  ErrorCode: string;
  ErrorMessageHidden: string;
  CurrentUser: CurrentUser;
  TechSupportContact: TechSupportContact;
  PortalUrl: string;
  area: string;
  IsError: boolean;
}

export interface CurrentUser {
  Permissions: UserPermission[];
  SchoolStatusId: number;
  PortalRoles: string[];
  IsValid: boolean;
  IpAddress: string;
  HasHolds: boolean;
  AdaptiveUserId: string;
  CVueUserId: number;
  CampusId: number;
  Claims: null;
  EmailAddress: string;
  PreferredFirstName: string;
  FirstName: string;
  FullName: string;
  DisplayFirstName: string;
  HybridUser: null;
  HideNavigation: boolean;
  SkipHybridRedirect: boolean;
  Id: string;
  IsFacultyOrAdmin: boolean;
  IsFaculty: boolean;
  IsStaff: boolean;
  IsAdmin: boolean;
  IsMasterCourse: boolean;
  IsAdvisor: boolean;
  IsHybridStudent: boolean;
  IsPersistent: boolean;
  IsImpersonated: boolean;
  IsDemo: boolean;
  OriginatingApplicationUserId: number;
  IsStudent: boolean;
  SltFrom: number;
  LmsUserId: number;
  LastName: string;
  PortalUserId: number;
  UserIdExternal: string;
  SessionId: string;
  EnvironmentId: number;
  SourceSystemId: number;
  UserName: string;
  IsPasswordResetRequired: boolean;
  UserRoles: number;
  SyStudentId: number;
  SyStaffId: number;
  CampusIdentifier: CampusIdentifier;
  IsCourseReviewer: boolean;
  IsCourseDev: boolean;
  IsGradeUpdater: boolean;
  IsOverlayAdmin: boolean;
}

export interface CampusIdentifier {
  SourceSystemId: number;
  CampusId: number;
}

export interface UserPermission {
  CampusId: number;
  AdClassSchedId: number;
  ClassId: number;
  Permissions: string;
  Role: number;
  SourceSystemId: number;
  LDA: Date;
}

export interface TechSupportContact {
  DepartmentId: number;
  Name: string;
  Code: string;
  DisplayName: string;
  MobileViewType: number;
  MobileStitchInViewType: number;
  Description: string;
  Phone: string;
  Fax: string;
  Email: string;
  PhoneForMobile: string;
  FaxForMobile: string;
  OperationHours: TechSupportOperationHours;
  IsSchoolContact: boolean;
  DoctoralDescrip: string;
  DoctoralPhone: string;
  DoctoralFax: string;
  DoctoralEmail: string;
}

export interface TechSupportOperationHours {
  OfficeHours: string;
}

export interface TodoEntry {
  ClassId: number;
  ToDoId: number;
  Title: string;
  AssignmentTitle: string;
  PartTitle: null;
  Description: string;
  DueDate: Date;
  Dismissed: boolean;
  IsCustomToDo: boolean;
  TaskType: number;
  AssignmentFooter: AssignmentFooter;
  LiveChat: ClassLiveSession;
  NotificationType: number;
  AssignmentPartId: number;
}
