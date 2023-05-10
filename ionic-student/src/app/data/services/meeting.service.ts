import { Injectable } from '@angular/core';
import { PecHttpService } from '../../shared/services/pec-http.service';
import { ClassService } from './class.service';
import { Observable, throwError } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { ZoomConcludedChats } from '../types/meeting.type';
import { ClassInfo, ClassLiveSession, ClassSummary, MeetingTypeDetails } from '../types/class.type';
import * as moment from 'moment';
import { AssignmentPart, ClassAssignment } from '../types/assignment.type';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  private offset = moment().utcOffset(); //get device utc offset
  constructor(private http: PecHttpService, private classService: ClassService) {}

  public zoomConcludedChats(classId: number, assignmentId?: number, groupId?: number): Observable<ZoomConcludedChats> {
    if (!assignmentId) {
      assignmentId = 0;
    }

    if (!groupId) {
      groupId = 0;
    }

    return this.classService.status(classId, false).pipe(
      concatMap((status) =>
        status && status.HasAccess
          ? this.http.request({
              url: `api/GetZoomConcludedChats?classId=${classId}&assignmentId=${assignmentId}&groupId=${groupId}`,
              signature: 'api/GetZoomConcludedChats?classId=${classId}&assignmentId=${assignmentId}&groupId=${groupId}',
              method: 'Get',
              config: { cache: false, cacheKeys: [`class-${classId}-meetings`] },
            })
          : throwError('No Access to class')
      )
    );
  }

  public getPECEventInfo(meeting: Meeting, classInfo: ClassSummary) {
    let pecEvent: PecEvent;
    if (meeting && classInfo) {
      pecEvent = new PecEvent();
      let classCode = '';
      const meetingType: MeetingType =
        meeting.MeetingType && meeting.MeetingType === 1 ? MeetingType.LIVE_CHAT : MeetingType.IN_CLASS;

      if (classInfo && classInfo.CourseCode && classInfo.TermCode && classInfo.Section) {
        classCode = `${classInfo.CourseCode}-${classInfo.TermCode}-${classInfo.Section}`;
      }

      if (meetingType === MeetingType.LIVE_CHAT && meeting.Title) {
        pecEvent.title = meeting.Title;
      }

      if (classCode) {
        pecEvent.title = pecEvent.title ? `${pecEvent.title} : ${classCode}` : classCode;
      }

      if (meeting.Description) {
        pecEvent.description = meeting.Description;
      }

      if (meeting.StartDateTimeUTC) {
        pecEvent.startDtTime = moment.utc(meeting.StartDateTimeUTC).toDate();
      }

      if (meeting.EndDateTime) {
        pecEvent.endDtTime = moment.utc(meeting.StartDateTimeUTC).add(meeting.Duration, 'minutes').toDate();
      }

      if (meetingType === MeetingType.LIVE_CHAT) {
        pecEvent.location = 'Live Chat';
      }

      const locationParts = [];

      if (meeting.BuildingDescription) {
        locationParts.push(meeting.BuildingDescription);
      }

      if (meeting.RoomNumber) {
        locationParts.push(`Room ${meeting.RoomNumber}`);
      }

      for (let i = 0; i < locationParts.length; i++) {
        if (i !== 0) {
          pecEvent.location = pecEvent.location + ',';
        }

        pecEvent.location = pecEvent.location + ` ${locationParts[i]}`;
      }
    }

    return pecEvent;
  }

  public getPECAssignmentEventInfo(
    assignment: ClassAssignment,
    classInfo: ClassSummary,
    assignmentPart?: AssignmentPart
  ) {
    const assignmentDueDate = assignmentPart ? assignmentPart.DueDate : assignment.DueDate;
    const dueDate = moment.utc(assignmentDueDate);
    const endDate = moment.utc(assignmentDueDate).add(24, 'hours');
    const pecEvent = new PecEvent();

    pecEvent.title = assignment.AssignmentName;
    pecEvent.description = '';
    pecEvent.location = '';
    pecEvent.isAllDay = true;

    let classCode = '';
    if (classInfo && classInfo.CourseCode) {
      classCode = `${classInfo.CourseCode}`;
    }

    if (classCode) {
      pecEvent.title = pecEvent.title ? `${classCode}: ${pecEvent.title}` : classCode;
    }

    pecEvent.startDtTime = new Date(dueDate.year(), dueDate.month(), dueDate.date(), 0, 0, 0, 0);
    pecEvent.endDtTime = new Date(endDate.year(), endDate.month(), endDate.date(), 0, 0, 0, 0);

    return pecEvent;
  }
}

export class PecEvent {
  title = '';
  description = '';
  startDtTime: Date = null;
  endDtTime: Date = null;
  location = '';
  isAllDay = false;
}

export enum MeetingType {
  LIVE_CHAT = 1,
  IN_CLASS = 2,
}

export class Meeting implements ClassLiveSession {
  public Active: boolean;
  public AvailableImmediately: boolean;
  public BuildingCode: string;
  public BuildingDescription: string;
  public ClassIds: number[];
  public ContextTypeId: number;
  public CourseTermSectionString: string;
  public CurrentFlag: number;
  public Description: string;
  public Duration: string;
  public EndDateTime: Date;
  public EndDateTimeFormattedString: string;
  public EndDateTimeUTC: Date;
  public GroupId: number;
  public HideMeetingForStudent: boolean;
  public HostFirstName: string;
  public HostLastName: string;
  public HostUserId: number;
  public IsArchive: boolean;
  public IsAssignment: boolean;
  public IsHostUserActive: boolean;
  public IsNextMeetingForInstructor: boolean;
  public IsPostedToMulipleClassSection: boolean;
  public IsRecordingMp4: boolean;
  public IsRecurring: boolean;
  public LCMSCurrentVersion: string;
  public LCMSIdentifier: string;
  public LMSAssignmentId: number;
  public LiveChatUrl: string;
  public LiveSessionId: number;
  public MeetingDescription: string;
  public MeetingType: number;
  public MeetingTypeDetails: MeetingTypeDetails;
  public MeetingTypeId: number;
  public MeetingTypesMapId: number;
  public Mp4Url: string;
  public RecordedSessionId: number;
  public RecordingScoId: number;
  public RecurringIdentifier: string;
  public RoomCode: string;
  public RoomNumber: string;
  public SendEmail: boolean;
  public SessionType: number;
  public ShowMiniLesson: boolean;
  public Ssid: number;
  public StartDateTime: Date;
  public StartDateTimeFormattedString: string;
  public StartDateTimeSchool: Date;
  public StartDateTimeUTC: Date;
  public StartDtDay: number;
  public StartDtHour: number;
  public StartDtMinute: number;
  public StartDtMonth: number;
  public StartDtYear: number;
  public SyCampusId: number;
  public TimeZoneCode: string;
  public Title: string;
  public Topic: string;
  public UnitTypeId: string;
  public Vendor: number;
  public Viewed: boolean;
  public ZoomUrl: string;

  constructor(o?: ClassLiveSession) {
    if (o) {
      for (const key in o) {
        if (o.hasOwnProperty(key)) {
          this[key] = o[key];
        }
      }
    }
  }

  public get startMeetingTime(): Date {
    if (this.StartDtYear > 0 && this.StartDtMonth > 0 && this.StartDtDay > 0) {
      return new Date(this.StartDateTimeUTC);
    }

    return null;
  }

  public get endMeetingTime(): Date {
    if (this.StartDtYear > 0 && this.StartDtMonth > 0 && this.StartDtDay > 0 && this.Duration) {
      const startTime: Date = new Date(this.StartDateTimeUTC);
      return new Date(startTime.getTime() + parseInt(this.Duration, 10) * 60 * 1000);
    }

    return null;
  }
}
