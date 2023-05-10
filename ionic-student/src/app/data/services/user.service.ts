import { Injectable } from '@angular/core';
import { GaUser, TrackingService } from '../../shared/services/tracking.service';
import { PecHttpService } from '../../shared/services/pec-http.service';
import { GlobalConfigsService } from '../../shared/services/global-configs.service';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, share } from 'rxjs/operators';
import { SltToken, StaffInfo, User } from '../types/user.type';
import { StorageService } from '../../shared/services/storage.service';
import { ChameleonService } from '../../shared/services/chameleon.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public get onProfileImageUploadedDateTimeChange(): Observable<number> {
    return this._onProfileImageUploadedDateTimeChange;
  }
  public readonly defaultImage: string = this.globalConfigs.assetsUrl + '/images/profile-default.png';
  private readonly _onProfileImageUploadedDateTimeChange: Observable<number>;
  private profileImageUploadedDateTime: Subject<number> = new Subject<number>();

  constructor(
    private http: PecHttpService,
    private trackingService: TrackingService,
    private globalConfigs: GlobalConfigsService,
    private storage: StorageService
  ) {
    this._onProfileImageUploadedDateTimeChange = this.profileImageUploadedDateTime.asObservable().pipe(share());
  }

  public info(req?: InfoRequest): Observable<User> {
    return this.http
      .request({
        url: `api/user` + (req && req.slt ? '?slt=' + encodeURIComponent(req.slt) : ''),
        method: 'Get',
        signature: 'api/user',
        config: {
          cache: true,
          refresh: req && req.refresh,
        },
      })
      .pipe(
        map((user: User) => {
          if (user) {
            user.IsStudent = (user.ClassRoomRole & 1) > 0;
            user.IsFaculty = (user.ClassRoomRole & 4) > 0;
            this.globalConfigs.isImpersonatedUser = user.IsImpersonated;
            this.globalConfigs.isDemoUser = user.IsDemo;
            this.globalConfigs.unsupportedPhone = user.UnsupportedStudentPhoneNumber;

            if (user.UserIdExternal) {
              const trackUser: GaUser = {
                userid: user.UserIdExternal,
                ssid: user.SourceSystemId,
                sycampusid: user.SyCampusId,
                demo: user.IsDemo,
                impersonated: user.IsImpersonated,
                sessionid: user.SessionId,
                systudentid: 0,
                systaffid: 0,
              };

              if (user.IsStudent) {
                trackUser.systudentid = user.CVueUserId;
              } else {
                trackUser.systaffid = user.CVueUserId;
              }

              this.trackingService.trackUser(trackUser);
            }

            return user;
          }
        })
      );
  }

  public profileImageUpload(request: ProfileImageFile): Observable<void> {
    return this.http.request({
      url: `user/profile/image`,
      method: 'Post',
      signature: `user/profile/image`,
      config: { cache: false },
      body: request.formData,
      requestType: 2,
    });
  }

  public facultyProfileImage(request: FacultyProfileImageRequest): Observable<string> {
    return this.http
      .request({
        url:
          'user/profile/image?sourceSystemId=' +
          request.SourceSystemId +
          '&syStaffId=' +
          request.SyStaffId +
          '&getThumbnail=true&defaultImage=false',
        method: 'Get',
        signature:
          'user/profile/image?sourceSystemId=${this.contact.SourceSystem}&syStaffId=${this.contact.SyStaffId}&getThumbnail=true&defaultImage=false',
        config: {
          cache: true,
        },
      })
      .pipe(
        map((url) => {
          if (url) {
            return url;
          }
        })
      );
  }

  public studentProfileImage(getThumb: boolean): Observable<string> {
    return this.http
      .request({
        url: 'user/profile/image?' + (getThumb ? 'getThumbnail=true&' : '') + 'defaultImage=false',
        method: 'Get',
        signature: 'user/profile/image?defaultImage=false',
        config: {
          cache: false,
        },
        requestType: 2,
      })
      .pipe(
        catchError((err) => {
          return of(this.defaultImage);
        }),
        map((url) => {
          if (url) {
            return url;
          }
        })
      );
  }

  public contactInfo(sysStaffId: string, sourceSystemId: string, classId?: number): Observable<StaffInfo> {
    return this.http.request({
      url: `api/user/staffinfo/${sysStaffId}?SourceSystemId=${sourceSystemId}&ClassId=${classId}`,
      method: 'Get',
      signature: 'api/user/staffinfo/${sysStaffId}?SourceSystemId={SourceSystemId}&ClassId={ClassId}',
      config: {
        cache: true,
      },
    });
  }

  public sendDocuments(request: DocUploadRequest): Observable<void> {
    return this.http.request({
      url: `api/user/department/senddocument`,
      method: 'Post',
      signature: `api/user/department/senddocument`,
      config: { cache: false },
      body: request.Documents,
      requestType: 2,
    });
  }

  public getSlt(appId: number): Observable<string> {
    return this.http.request({
      url: `api/slt?oa=${appId}`,
      signature: 'api/slt?oa=${appId}',
      method: 'Get',
      config: {
        cache: false,
      },
    });
  }

  public getFacultySlt(appId: number): Observable<SltToken> {
    return this.http.request({
      url: `api/mobile/loginAs?type=${appId}`,
      signature: 'api/mobile/loginAs?type=${appId}',
      method: 'Get',
      config: {
        cache: true,
      },
    });
  }

  public setProfileImageUploadedDateTime() {
    this.storage.setItem<number>('LastProfileImageUploadTime', new Date().getTime(), true);
    this.profileImageUploadedDateTime.next(new Date().getTime());
  }
}

export interface InfoRequest {
  refresh?: boolean;
  slt?: string;
}

export interface ProfileImageFile {
  formData: FormData;
}

export interface DocUploadRequest {
  Documents: FormData;
  Comments: string;
  DocumentName: string;
  CmDocumentId: number;
  CmDocTypeId: number;
}

export interface FacultyProfileImageRequest {
  SourceSystemId: number;
  SyStaffId: number;
}
