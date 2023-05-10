import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PecHttpService } from '../../shared/services/pec-http.service';
import { ClassLiveSession } from '../types/class.type';

@Injectable({
  providedIn: 'root',
})
export class LiveChatService {
  constructor(private http: PecHttpService) {}

  getLiveSession(classId: number, assignmentId: number): Observable<ClassLiveSession[]> {
    return this.http.request({
      url: `api/LiveChatApi/GetLiveSession?classId=${classId}&assignmentId=${assignmentId}`,
      signature: 'api/LiveChatApi/GetLiveSession?classId=${classId}&assignmentId=${assignmentId}',
      method: 'Get',
      config: {
        cache: true,
      },
    });
  }
}
