import { ThemeId } from 'src/app/shared/enums/theme-id.enum';
import { CampusId } from '../../shared/enums/campus-id.enum';

export interface SchoolInfo {
  CampusId: CampusId;
  SourceSystemId: number;
  TimeZoneCode: string;
  SchoolName: string;
  SchoolNameShort: string;
  BrandName: string;
  Description: string;
  SocialLinks: SocialLink[];
  PortalUrl: string;
  ThemeId: ThemeId;
  TimeZoneOffsetMinutes: number;
  MediaUrl: string;
  GetSatisfationRolledOut: boolean;
  SchoolCode: string;
  ShowCopyClass: boolean;
  IsGradeCommentsRequired: boolean;
  EnableCopyResources: boolean;
  SchoolTime: Date;
  ServerTime: Date;
  DateDelta: number;
  Addr1: string;
  Addr2: string;
  City: string;
  State: string;
  Zip: string;
  HasSmartThinkingEnabled: boolean;
  IsSchoolAnnouncementEnabled: boolean;
  EnableCourseReviewProcess: boolean;
  CourseReviewProcessDayOffsetAfter: number;
  CourseReviewProcessDayOffsetBefore: number;
  CourseReviewProcessEffectiveDate: Date;
  IsConexusHomeV2Enabled: boolean;
  IsOnlineSchool: boolean;
  FeedbackEmail: string;
  IsFERPAFeatureEnabled: boolean;
  IsWebNotificationEnabled: boolean;
  UrbanAirShipKeys: UrbanAirShipKeys;
  IsMessengerEnabled: boolean;
  ShowQuestionsSlideOut: boolean;
  ShowSurveyPanel: boolean;
  IsNewAwardLetterEnabled: boolean;
  AdvisorNotesEnabled: boolean;
  SendBirdPollingInterval: number;
  WebsitePolicies: any;
  ShowFooter: boolean;
  DateDeltaInit: boolean;
  schoolDate(date?: Date): Date;
  schoolToLocalDate(date?: Date): Date;
}

export interface SocialLink {
  ImageUrl: string;
  Name: string;
  AriaLabel: string;
}

export interface UrbanAirShipKeys {
  AppKey: string;
  Token: string;
  VapidPublicKey: string;
  PromptIfDismissedInXHours: number;
}

export interface DepartmentContactInfo {
  ContactDisplayType: number;
  DisplayName: string;
  FirstName: string;
  LastName: string;
  EmailAddress: string;
  Phone: string;
  PhoneExtension: string;
  Fax: string;
  AdClassId: number;
  ClassId: number;
  Department: string;
  DepartmentDescription: string;
  PortalId: number;
  ContactGroup: string;
  SyStaffId: number;
  SourceSystem: number;
  SendBirdChatUserId: string;
  OperationsHours: OperationsHour[];
  NextOfficeHours: NextOfficeHour[];
  IsDepartment: boolean;
}

export interface NextOfficeHour {
  Date: Date;
  Start: string;
  End: string;
  StartMeridian: string;
  EndMeridian: string;
  Day: number;
}

export interface OperationsHour {
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
