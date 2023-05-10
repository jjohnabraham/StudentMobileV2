import { Injectable } from '@angular/core';
import { PecHttpService } from 'src/app/shared/services/pec-http.service';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import * as moment from 'moment';
import { catchError, concatMap, map } from 'rxjs/operators';
import { DepartmentContactInfo, SchoolInfo } from '../types/school.type';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { CampusId } from 'src/app/shared/enums/campus-id.enum';

@Injectable({
  providedIn: 'root',
})
export class SchoolService {
  constructor(
    private http: PecHttpService,
    private globalConfigs: GlobalConfigsService,
    private userService: UserService
  ) {}

  public info(ssid?: number, sycampusid?: CampusId) {
    if (ssid && sycampusid) {
      return this.getSchool(ssid, sycampusid);
    } else if (this.globalConfigs.ssid && this.globalConfigs.sycampusid) {
      return this.getSchool(this.globalConfigs.ssid, this.globalConfigs.sycampusid);
    } else {
      return this.userService.info().pipe(concatMap((user) => this.getSchool(user.SourceSystemId, user.SyCampusId)));
    }
  }

  public techSupportContact(): Observable<
    | DepartmentContactInfo
    | {
        DisplayName: string;
        Phone: string;
      }
  > {
    return this.getDepartments().pipe(
      map((departments) => {
        if (departments) {
          return departments.find((o) => {
            return (o.Department === 'Technical Support' || o.Department === 'Tech Support') && o.IsDepartment;
          });
        }

        return null;
      }),
      catchError(() => {
        const techSupportName = 'Technical Support';
        let phoneNumber: string = null;

        if (
          this.globalConfigs.sycampusid === CampusId.AIU_ATLANTA ||
          this.globalConfigs.sycampusid === CampusId.AIU_HOUSTON
        ) {
          phoneNumber = this.globalConfigs.aiuGroundTechSupportPhone;
        } else if (
          this.globalConfigs.sycampusid === CampusId.CTU_COLORADO ||
          this.globalConfigs.sycampusid === CampusId.CTU_DENVER ||
          this.globalConfigs.sycampusid === CampusId.CTU_ONLINE
        ) {
          phoneNumber = this.globalConfigs.ctuTechSupportPhone;
        } else if (this.globalConfigs.sycampusid === CampusId.AIU_ONLINE) {
          phoneNumber = this.globalConfigs.aiuOnlineTechSupportPhone;
        }

        if (phoneNumber != null) {
          return new Observable<{
            DisplayName: string;
            Phone: string;
          }>((observer) => {
            observer.next({
              DisplayName: techSupportName,
              Phone: phoneNumber,
            });
            observer.complete();
          });
        }

        return null;
      })
    );
  }

  private getSchool(ssid: number, sycampusid: CampusId) {
    return this.http
      .request({
        url: `api/school/${ssid}/${sycampusid}/schoolinfo`,
        method: 'Get',
        signature: 'api/school/${ssid}/${sycampusid}/schoolinfo',
        config: {
          cache: true,
        },
      })
      .pipe(
        map((school: SchoolInfo) => {
          if (school) {
            if (!school.DateDeltaInit) {
              school.DateDeltaInit = true;

              const schoolTimeString = school.SchoolTime;
              const schoolTime = moment(schoolTimeString);

              school.DateDelta = schoolTime.toDate().getTime() - new Date().getTime();
              school.DateDelta = school.DateDelta - (school.DateDelta % 1000);
            }

            school.schoolToLocalDate = (date: Date) => {
              return new Date(date.getTime() - school.DateDelta);
            };

            return school;
          }
        })
      );
  }

  private getDepartments(): Observable<DepartmentContactInfo[]> {
    return this.http.request({
      url: `api/lms/contact?contactDisplayFilter=${null}`,
      signature: 'api/lms/contact?contactDisplayFilter=${contactDisplayFilter}',
      method: 'Get',
      config: {
        cache: true,
      },
    });
  }
}
