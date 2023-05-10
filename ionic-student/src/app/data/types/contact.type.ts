export interface ContactInfo {
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
  Name: string;
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
