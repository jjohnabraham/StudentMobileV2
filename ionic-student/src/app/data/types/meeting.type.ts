export interface ZoomConcludedChats {
  error: any;
  Recordings: ZoomRecording[];
}

export interface ZoomRecording {
  DurationTotal: number;
  IsArchive: boolean;
  IsAssignment: boolean;
  LmsClassId: number;
  LmsLiveSessionId: number;
  LmsZoomMeetingInstanceId: number;
  LmsAssignmentId: number;
  Title: string;
  MeetingRecordedStatusId: number;
  Description: string;
  StartDateTime: Date;
  CreatedDate: Date;
  MeetingStartDate: Date;
  MeetingEndDate: Date;
  RecordingStartDate: Date;
  RecordingEndDate: Date;
  Iteration: number;
  RecordingDurationMinutes: number;
  MeetingDurationMinutes: number;
  RecordingDurationSeconds: number;
  MeetingDurationSeconds: number;
  GroupId: number;
  Viewed: boolean;
  isRecorded: boolean;
  MeetingDescription: string;
  MeetingTypeId: number;
  Active: boolean;
  Url: string;
  NumberOfParticipants: number;
  HostLmsUserId: number;
  HostFirstName: string;
  HostLastName: string;
  IsHostUserActive: boolean;
  HideMeetingForStudent: boolean;
  RecordingPostedDate: Date;
  TimeZoneCode: string;
}
