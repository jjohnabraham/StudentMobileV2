import { Injectable } from '@angular/core';
import { PecHttpService, RequestType } from '../../shared/services/pec-http.service';
import { Observable } from 'rxjs';
import {
  AcceptPolicyResponse,
  Class,
  ClassInfo,
  ClassSettings,
  ClassStatus,
  ClassSummary,
  LiveChatUri,
  SaveSettingResponse,
  TodoEntry,
} from '../types/class.type';

@Injectable({
  providedIn: 'root',
})
export class ClassService {
  constructor(private http: PecHttpService) {}

  public classList(classFilter: string = 'Current', refresh?: boolean): Observable<Class[]> {
    return this.http.request({
      url: `api/lms/class?classListType=${classFilter}`,
      signature: 'api/lms/class?classListType=${classFilter}',
      method: 'Get',
      config: {
        cache: true,
        refresh,
      },
    });
  }

  public status(classId: number = 0, cache: boolean = true, ssid: number = 0, sisClassId: number = 0): Observable<ClassStatus> {
    return this.http.request({
      url: `api/lms/class/${classId}/status?ssid=${ssid}&adClassSchedId=${sisClassId}`,
      signature: 'api/lms/class/${classId}/status?ssid=${ssid}&adClassSchedId=${sisClassId}',
      method: 'Get',
      config: {
        cache,
      },
    });
  }

  public saveAcceptPolicy(classId: number, classStatus: ClassStatus, value: boolean): Observable<AcceptPolicyResponse> {
    return this.http.request({
      url: `api/lms/class/${classId}/AcceptPolicy?acceptClassPolicy=${classStatus.ShowClassPolicy}&acceptUserPolicy=${classStatus.ShowUserPolicy}`,
      signature:
        'api/lms/class/${classId}/AcceptPolicy?acceptClassPolicy=${classStatus.ShowClassPolicy}&acceptUserPolicy=${classStatus.ShowUserPolicy}',
      method: 'Post',
      body: value,
    });
  }

  public info(classId: number): Observable<ClassInfo> {
    return this.http.request({
      url: `api/lms/class/${classId}/classinfo`,
      signature: 'api/lms/class/${classId}/classinfo',
      method: 'Get',
      config: {
        cache: false,
      },
    });
  }

  public summary(classId: number): Observable<ClassSummary> {
    return this.http.request({
      url: `api/lms/class/${classId}/summary`,
      signature: 'api/lms/class/${classId}/summary',
      method: 'Get',
      config: {
        cache: false,
      },
    });
  }

  public objectives(classId: number): Observable<string[]> {
    return this.http.request({
      url: `api/lms/class/${classId}/objectives`,
      signature: 'api/lms/class/${classId}/objectives',
      method: 'Get',
      config: {
        cache: true,
      },
    });
  }

  public classSettings(classId: number): Observable<ClassSettings> {
    return this.http.request({
      url: `api/lms/class/${classId}/settings`,
      signature: 'api/lms/class/${classId}/settings',
      method: 'Get',
      config: {
        cache: false,
      },
    });
  }

  public saveVisitedCourseOverview(classId: number): Observable<SaveSettingResponse> {
    return this.http.request({
      url: `api/lms/class/${classId}/settings/visitedCourseOverview`,
      signature: 'api/lms/class/${classId}/settings/visitedCourseOverview',
      method: 'Post',
      body: '"' + JSON.stringify(true).replace(/"/g, '\\"') + '"',
    });
  }

  public saveClassSetting(classId: number, key: string, value: string): Observable<SaveSettingResponse> {
    return this.http.request({
      url: `api/lms/class/${classId}/settings/${key}`,
      signature: 'api/lms/class/${classId}/settings/${key}',
      method: 'Post',
      body: value,
    });
  }

  public liveMeetingUrl(lmsUrl: string, classId: number, sessionId: number): Observable<LiveChatUri> {
    if (classId && sessionId && sessionId !== 0) {
      return this.http.request({
        url: `${lmsUrl}/Vendor/api/lms/class/${classId}/livechat/${sessionId}/mobileuri`,
        method: 'Post',
        apiSource: 3,
        signature: '${lmsUrl}/Vendor/api/lms/class/${classId}/livechat/${sessionId}/mobileuri',
        config: {
          cache: true,
        },
      });
    }
  }

  public todos(): Observable<TodoEntry[]> {
    return this.http.request({
      url: 'api/lms/todo',
      method: 'Get',
      signature: 'api/lms/todo',
      config: {
        cache: true,
      },
    });
  }

  challengeExamPolicy(): Observable<string> {
    return this.http.request({
      url: `Vendor/lms/qm/challengeExamPolicy`,
      method: 'Get',
      signature: 'vendor/lms/qm/challengeExamPolicy',
      config: {
        cache: true,
      },
    });
  }
}
