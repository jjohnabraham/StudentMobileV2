import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PecHttpService } from '../../shared/services/pec-http.service';
import { EnrollmentDegreeInfo, EnrollmentClassesInfo, FastTrackInfo, Enrollment } from '../types/enrollment.type';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  constructor(private http: PecHttpService) {}

  public info(refresh?: boolean): Observable<EnrollmentDegreeInfo> {
    return this.http.request({
      url: `api/enrollment/current`,
      method: 'Get',
      signature: 'api/enrollment/current',
      config: {
        cache: true,
        refresh,
      },
    });
  }

  public getEnrollment(refresh?: boolean): Observable<Enrollment> {
    return this.http.request({
      url: 'api/enrollment',
      method: 'Get',
      signature: 'api/enrollment',
      config: {
        cache: false,
        refresh,
      },
    });
  }

  public list(refresh?: boolean): Observable<EnrollmentClassesInfo> {
    return this.http.request({
      url: `api/enrollment/current/class`,
      method: 'Get',
      signature: 'api/enrollment/current/class',
      config: {
        cache: true,
        refresh,
      },
    });
  }

  public getFastTrackDates(
    syStudentId: number,
    ssid: number,
    syCampusId: number,
    courseCode: string,
    termCode: string
  ): Observable<FastTrackInfo> {
    return this.http.request({
      url: `api/enrollment/fasttrackInfo?model=%7B%22Ssid%22%3A${ssid}%2C%22SyCampusId%22%3A${syCampusId}%2C%22SyStudentId%22%3A${syStudentId}%2C%22MainCourseCode%22%3A%22${courseCode}%22%2C%22MainTermCode%22%3A%22${termCode}%22%7D`,
      signature:
        'api/enrollment/fasttrackInfo?model={"Ssid":${ssid},"SyCampusId":${syCampusId},"SyStudentId":${syStudentId},"MainCourseCode":"${courseCode}","MainTermCode":"${termCode}"}',
      method: 'Get',
      config: {
        cache: false,
        refresh: true,
      },
    });
  }

  public scheduleFastTrack(request: any): Observable<any> {
    return this.http.request({
      url: 'api/enrollment/fasttrack/schedule',
      method: 'POST',
      signature: 'api/enrollment/fasttrack/schedule',
      body: request,
    });
  }
}
