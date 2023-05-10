export interface NotificationsFilter {
  ClassIds: number[];
  ClassDateList: ClassDateList[];
  AnnouncementId: number;
  Title: string;
  Description: string;
  Dismissed: boolean;
  Read: boolean;
  Active: boolean;
  Priority: number;
  IsHighPriority: boolean;
  CreatedOn: Date;
  CreatedBy: string;
  UpdatedOn: Date;
  UpdatedBy: string;
  PublishedBy: string;
  PublishDate: Date;
  PublishDateByCampus: Date;
  PublishDateUTC: Date;
  SendAnnouncementEmail: boolean;
  PublishYear: number;
  PublishMonth: number;
  PublishDay: number;
  PublishHour: number;
  PublishMinute: number;
  AnnouncementUrl: string;
  AddToAllSection: boolean;
}

export interface ClassDateList {
  AdClassId: number;
  ClassId: number;
  StartDate: Date;
  EndDate: Date;
  PublishDate: Date;
  StudentEarlyAccessDate: Date;
}

export interface Notification {
  ClassId: number;
  NotificationId: number;
  Title: string;
  Description: string;
  PublishDate: Date;
  PublishDateByCampus: Date;
  PublishDateUTC: Date;
  Priority: number;
  Read: boolean;
  Dismissed: boolean;
  Active: boolean;
  CreatedBy: string;
  CategoryName: string;
  IsHighPriority: boolean;
  TimeZoneCode: string;
}

export interface Getcountnotification {
  AnnouncementCount: AnnouncementCount;
}

export interface AnnouncementCount {
  UnreadCount: number;
  ReadCount: number;
  UnreadCurrentCount: number;
  TotalCount: number;
}
