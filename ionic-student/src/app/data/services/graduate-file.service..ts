import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PecHttpService } from '../../shared/services/pec-http.service';
import { GraduateFileInfo, GraduateFileSubmitResponse } from '../types/graduate-file.type';

@Injectable({
  providedIn: 'root',
})
export class GraduateFileService {
  constructor(private http: PecHttpService) {}

  public getGraduateFileStatus(): Observable<GraduateFileInfo> {
    return this.http.request({
      url: `api/user/getgraduatefileinfo`,
      method: 'GET',
      signature: 'api/user/getgraduatefileinfo',
      config: {
        cache: false,
      },
    });
  }

  public submitGraduateFile(formValues, employmentStatus: boolean): Observable<GraduateFileSubmitResponse> {
    const workPhone = formValues.WorkPhone ? `${formValues.WorkPhone} ${formValues.WorkPhoneExtn}` : '';

    const body = {
      currentlyEmployed: employmentStatus,
      graduationEmploymentDetail: {
        ...formValues,
        WorkPhone: workPhone,
      },
    };

    return this.http.request({
      url: `api/user/updategraduatefileinfo`,
      signature: `api/user/updategraduatefileinfo`,
      method: 'POST',
      body,
    });
  }
}
