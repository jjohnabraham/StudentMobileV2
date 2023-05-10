import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PecHttpService } from '../../shared/services/pec-http.service';
import { Office365Token } from '../types/office365.type';

@Injectable({
  providedIn: 'root',
})
export class Office365Service {
  constructor(private http: PecHttpService) {}

  outlookToken(): Observable<Office365Token> {
    return this.http.request({
      url: 'api/user/profile/o365token',
      method: 'Get',
      signature: 'api/user/profile/o365token',
      config: {
        cache: true,
      },
    });
  }

  getProfileImageCec(accessToken: string, userEmail: string): Observable<string> {
    return this.http.request({
      url: `https://graph.microsoft.com/v1.0/users/${userEmail}/photo/$value`,
      method: 'Get',
      signature: 'https://graph.microsoft.com/v1.0/users/${userEmail}/photo/$value',
      requestType: 2,
      apiSource: 3,
      config: {
        cache: true,
      },
      bearer: accessToken,
    });
  }
}
