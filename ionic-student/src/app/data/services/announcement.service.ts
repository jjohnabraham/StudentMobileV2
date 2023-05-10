import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { PecHttpService } from '../../shared/services/pec-http.service';
import { Getcountnotification, NotificationsFilter } from '../types/notification.type';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  public onUnreadAnnouncementsCountChange: Observable<boolean>;

  private _unreadAnnouncementsCount: Subject<boolean> = new Subject<boolean>();

  constructor(private http: PecHttpService) {
    this.onUnreadAnnouncementsCountChange = this._unreadAnnouncementsCount.pipe(share());
  }

  public countUnreadAnnouncements() {
    this._unreadAnnouncementsCount.next(true);
  }

  public announcements(notificationsFilter?: number, refresh?: boolean): Observable<NotificationsFilter> {
    if (!notificationsFilter) {
      notificationsFilter = NOTIFICATIONS_FILTER.None; //The API will actually take "None" and get Current, Active and Dismissed announcements based on its current implementation
    }
    return this.http.request({
      url: `api/lms/announcement?notificationsFilter=${notificationsFilter}`,
      signature: 'api/lms/announcement?notificationsFilter=${notificationsFilter}',
      method: 'Get',
      config: { cache: true, refresh: refresh || false },
    });
  }

  public announcementDescription(announcementId: number, classId: number, ssid: number, sycampusId: number) {
    if (!announcementId || !classId || !ssid || !sycampusId)
      return throwError('announcementId, classId, ssid and sycampusId are required');
    return this.http.request({
      url: `api/announcement/${announcementId}?classId=${classId}&ssid=${ssid}&sycampusid=${sycampusId}`,
      signature: 'api/announcement/${announcementId}?classId=${classId}&ssid=${ssid}&sycampusid=${sycampusId}',
      method: 'Get',
      config: { cache: true },
    });
  }

  public readAnnouncement(announcementId: number, isRead: boolean): Observable<any> {
    if (!announcementId) return throwError('announcementId is required');
    return this.http.request({
      url: `api/lms/announcement/${announcementId}/read`,
      signature: 'api/lms/announcement/${announcementId}/read',
      contentType: 'application/json',
      method: 'Put',
      body: isRead,
    });
  }

  public dismissAnnouncement(announcementId: number, dismiss: boolean): Observable<any> {
    if (!announcementId) return throwError('announcementId is required');
    return this.http.request({
      url: `api/lms/announcement/${announcementId}/dismissed`,
      signature: 'api/lms/announcement/${announcementId}/dismissed',
      contentType: 'application/json',
      method: 'Put',
      body: dismiss,
    });
  }

  public dismissAnnouncements(announcementIds: number[], dismiss: boolean): Observable<any> {
    //if dismiss is true, dismiss the announcementIds, otherwise restore them
    if (!announcementIds || announcementIds.length === 0) return throwError('announcementIds are required');
    const request = { AnnouncementIds: announcementIds, Dismiss: dismiss };
    return this.http.request({
      url: `api/lms/announcement/dismiss`,
      signature: 'api/lms/announcement/dismiss',
      method: 'Put',
      body: request,
    });
  }

  public announcementsCount(
    notificationsFilter?: number,
    refresh?: boolean,
    ignoreTimeoutReset?: boolean
  ): Observable<Getcountnotification> {
    if (!notificationsFilter) {
      notificationsFilter = NOTIFICATIONS_FILTER.None; //The API will actually take "None" and get Current, Active and Dismissed announcements based on its current implementation
    }
    return this.http.request({
      url: `api/NotificationsApi/GetCount?notificationsFilter=${notificationsFilter}`,
      signature: 'api/NotificationsApi/GetCount?notificationsFilter=${notificationsFilter}',
      method: 'Get',
      config: { cache: true, refresh: refresh || false, ignoreTimeoutReset },
    });
  }

  //used for the announcements and announcement detail pages when calling api/lms/announcement?notificationsFilter=${notificationsFilter}
  public getAnnouncementPageNotificationsFilter(): number {
    return (
      NOTIFICATIONS_FILTER.Current +
      NOTIFICATIONS_FILTER.Dismissed +
      NOTIFICATIONS_FILTER.Active +
      NOTIFICATIONS_FILTER.CreatedBy
    );
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum NOTIFICATIONS_FILTER {
  None = 0,
  Current = 1,
  Dismissed = 2,
  Active = 4,
  Deleted = 8,
  Unpublished = 16,
  CreatedBy = 32,
  All = 2147483647,
}
