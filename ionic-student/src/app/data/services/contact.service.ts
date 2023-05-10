import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PecHttpService } from 'src/app/shared/services/pec-http.service';
import { ContactInfo } from '../types/contact.type';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  constructor(private http: PecHttpService) {}

  contacts(refresh?: boolean): Observable<ContactInfo[]> {
    return this.http.request({
      url: `api/contact`,
      signature: 'api/contact',
      method: 'Get',
      config: {
        cache: true,
        refresh,
      },
    });
  }

  allContacts(contactDisplayFilter?: number, refresh?: boolean): Observable<ContactInfo[]> {
    return this.http.request({
      url: `api/lms/contact?contactDisplayFilter=${contactDisplayFilter}`,
      signature: 'api/lms/contact?contactDisplayFilter=${contactDisplayFilter}',
      method: 'Get',
      config: {
        cache: true,
        refresh,
      },
    });
  }
}
