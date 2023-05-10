import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { PecHttpService } from '../../shared/services/pec-http.service';
import { ClassService } from './class.service';
import {
  AssignmentDetails,
  AssignmentSummary,
  ClassAssignment,
  CourseBook,
  DetailsOfAssignment,
} from '../types/assignment.type';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AssignmentService {
  constructor(private http: PecHttpService) {}

  public list(classId: number): Observable<AssignmentDetails> {
    return this.http.request({
      url: `api/lms/class/${classId}/assignment`,
      signature: 'api/lms/class/${classId}/assignment',
      method: 'Get',
      config: {
        cache: true,
      },
    });
  }

  public detail(classId: number, assignmentId: number, studentId: number): Observable<DetailsOfAssignment> {
    return this.http.request({
      url: `api/lms/class/${classId}/gradebook/studentassignment?assignmentId=${assignmentId}&studentId=${studentId}`,
      signature: 'api/lms/class/${classId}/assignment',
      method: 'Get',
      config: {
        cache: true,
      },
    });
  }

  public assignmentOverview(classId: number, assignmentId: number): Observable<AssignmentDetails> {
    return this.http.request({
      url: `api/lms/class/${classId}/assignment?IncludeDescription=true&assignmentId=${assignmentId}`,
      signature: 'api/lms/class/${classId}/assignment?IncludeDescription=true&assignmentId=${assignmentId}',
      method: 'Get',
      config: {
        cache: true,
      },
    });
  }

  public assignmentModelOverview(classId: number, assignmentId: number): Observable<AssignmentDetails> {
    return this.http.request({
      url: `api/lms/class/${classId}/assignment?IncludeDescription=true&IncludeModelAnswers=true&assignmentId=${assignmentId}`,
      signature:
        'api/lms/class/${classId}/assignment?IncludeDescription=true&IncludeModelAnswers=true&assignmentId=${assignmentId}',
      method: 'Get',
      config: {
        cache: true,
      },
    });
  }

  public listWithDescription(classId: number): Observable<AssignmentDetails> {
    return this.http.request({
      url: `api/lms/class/${classId}/assignment?IncludeDescription=true`,
      signature: 'api/lms/class/${classId}/assignment?IncludeDescription=true',
      method: 'Get',
      config: {
        cache: true,
      },
    });
  }

  public summaryList(classId: number): Observable<AssignmentSummary[]> {
    return this.http
      .request({
        url: `api/lms/class/${classId}/assignmentsummary`,
        signature: 'api/lms/class/${classId}/assignmentsummary',
        method: 'Get',
        config: {
          cache: true,
        },
      })
      .pipe(
        map((assignments: AssignmentSummary[]) => {
          if (assignments && assignments.length) {
            assignments.sort((a, b) => {
              let r = new Date(a.DueDate).getTime() - new Date(b.DueDate).getTime();
              if (r) return r;

              r = (a.AssignmentName || '').toLowerCase().localeCompare((b.AssignmentName || '').toLowerCase());
              if (r) return r;

              return 0;
            });
          }

          return assignments;
        })
      );
  }

  public info(classId: number, assignmentId: number): Observable<ClassAssignment> {
    if (!assignmentId) return throwError('AssignmentId is required');

    return this.http
      .request({
        url: `api/lms/class/${classId}/assignment?assignmentId=${assignmentId}&IncludeDescription=true&IncludeModelAnswers=true`,
        signature:
          'api/lms/class/${classId}/assignment?assignmentId=${assignmentId}&IncludeDescription=true&IncludeModelAnswers=true',
        method: 'Get',
        config: {
          cache: true,
        },
      })
      .pipe(
        map((assignmentsDetail: AssignmentDetails) => {
          if (assignmentsDetail && assignmentsDetail.AssignmentDetails && assignmentsDetail.AssignmentDetails.length) {
            return assignmentsDetail.AssignmentDetails[0];
          }

          return null;
        })
      );
  }

  public markAsFinished(classId: string, assignmentId, markAsFinished: boolean, assignmentPartId): Observable<boolean> {
    return this.http.request({
      url: `api/lms/class/${classId}/assignment/${assignmentId}/markfinished?markedasfinished=${markAsFinished}&assignmentPartId=${assignmentPartId}`,
      signature:
        'api/lms/class/${classId}/assignment/${assignmentId}/markfinished?markedasfinished=${markedasfinished}&assignmentPartId=${assignmentPartId}',
      method: 'Get',
      config: {
        cache: false,
      },
    });
  }

  public bookshelf(classId: number): Observable<CourseBook[]> {
    return this.http.request({
      url: `api/lms/bookshelf?currentClassId=${classId}`,
      signature: 'api/lms/bookshelf?currentClassId=${classId}',
      method: 'Get',
      config: {
        cache: true,
      },
    });
  }

  public overallBookshelf(refresh?: boolean): Observable<CourseBook[]> {
    return this.http.request({
      url: `api/lms/bookshelf`,
      signature: 'api/lms/bookshelf',
      method: 'Get',
      config: {
        cache: true,
        refresh,
      },
    });
  }
}
