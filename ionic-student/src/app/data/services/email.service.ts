import { Injectable } from '@angular/core';
import { PecHttpService } from '../../shared/services/pec-http.service';
import { ClassService } from './class.service';
import { Observable, throwError } from 'rxjs';
import { concatMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  constructor(private http: PecHttpService, private classService: ClassService) {}

  public sendEmail(request: CreateEmailRequest): Observable<boolean> {
    const emailDetails = request.EmailDetails;

    const validationErrors = [];
    if (!(emailDetails.toAddress && emailDetails.toAddress.length >= 5)) {
      validationErrors.push('To Address is required');
    }

    if (!(emailDetails.subject && emailDetails.subject.length >= 1)) {
      validationErrors.push('Subject is required');
    }

    if (!(emailDetails.message && emailDetails.message.length >= 1)) {
      validationErrors.push('Body is required');
    }

    if (validationErrors.length > 0) {
      return throwError({ message: 'Invalid email', validationErrors });
    }

    const apiRequest = () => {
      return this.http.request({
        url: `api/email/send`,
        signature: 'api/email/send',
        method: 'Post',
        body: emailDetails,
      });
    };

    if (request.ClassId && request.ClassId > 0) {
      return this.classService
        .status(request.ClassId, false)
        .pipe(concatMap((status) => (status && status.HasAccess ? apiRequest() : throwError('No Access to class'))));
    } else {
      return apiRequest();
    }
  }
}

export class Email {
  toAddress = '';
  ccAddress = '';
  bccAddress = '';
  subject = '';
  copyMe = false;
  message = '';
}

export interface CreateEmailRequest {
  ClassId: number;
  EmailDetails: Email;
}
