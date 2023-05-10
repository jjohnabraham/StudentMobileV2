import { CampusId } from '../../shared/enums/campus-id.enum';

export interface User {
  StudentStatusId: number;
  UserName: string;
  FirstName: string;
  LastName: string;
  EmailAddress: string;
  ChatUserId: string;
  CVueUserId: number;
  NavigationLinks: NavigationLink[];
  PortalPath: string;
  ServerTime: Date;
  ServerTimeZone: string;
  IsHybridStudent: boolean;
  CurrentClasses: null;
  IsImpersonated: boolean;
  IsDemo: boolean;
  IsMinStartDaysCompleted: boolean;
  ClassRoomRole: number;
  SourceSystemId: number;
  SyCampusId: CampusId;
  UserIdExternal: string;
  StudentIdValidUntil: Date;
  NextMeetingList: NextMeetingList[];
  SapAppeal: SapAppeal;
  hideNavigation: boolean;
  IsContinuingDemoStudent: boolean;
  SessionId: string;
  IsStudent: boolean;
  IsFaculty: boolean;
  StudentNumber: string;
  UnsupportedStudentPhoneNumber: string;
  StudentGradDate: Date;
  LmsUserId: number;
}

export interface NavigationLink {
  Title: string;
  Path: string;
  ToolTip: string;
  Mode: string;
  Name: string;
  Roles: string;
  schools: string;
  RemoveMenuStudentInAnyRole: string;
  RemoveMenuStudentNotInAnyRole: string;
  RemoveMenuStudentNotInRoles: string;
  RemoveMenuStudentInAnySyschoolstatus: string;
  IsStudent: string;
  IsFaculty: string;
  hidden: boolean;
  Target: string;
  IsConexus: boolean;
  IsUiSref: boolean;
  IsMessenger: boolean;
}

export interface NextMeetingList {
  LmsClassId: number;
  CourseTermSection: string;
  MeetingType: string;
  MeetingTitle: string;
  MeetingTime: Date;
  Duration: number;
  Location: string;
  BuildingDescription: string;
  BuildingCode: string;
  RoomNumber: string;
  RoomCode: string;
  Description: string;
  LiveSessionID: number;
  TimeZoneCode: string;
  StartDtYear: number;
  StartDtMonth: number;
  StartDtDay: number;
  StartDtHour: number;
  StartDtMinute: number;
  MeetingDescription: string;
  Topic: string;
  MeetingTypeId: number;
  UnitTypeId: number;
}

export interface SapAppeal {
  DueDate: Date;
  Message: string;
  AdditionalInformationLink: string;
}

export interface StaffInfo {
  SourceSystem: number;
  SyStaffId: number;
  Code: string;
  UserName: string;
  FirstName: string;
  LastName: string;
  SyCampusId: CampusId;
  FullName: string;
  Email: string;
  Phone: string;
  CvueStaffGroups: CvueStaffGroup[];
  Active: boolean;
  NextOfficeHours: NextOfficeHour[];
}

export interface CvueStaffGroup {
  LmsRoleId: number;
  Code: string;
}

export interface NextOfficeHour {
  Date: Date;
  Start: string;
  End: string;
  StartMeridian: string;
  EndMeridian: string;
  Day: number;
}

export interface SltToken {
  SLT: string;
  SSID: number;
  SyCampusId: number;
}
