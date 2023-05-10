import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { PecHttpService } from '../../shared/services/pec-http.service';
import { UnitAssignment, UnitLearningMaterials, Unit, UnitInfo, UnitObjectives, UnitSteps } from '../types/unit.type';
import { ClassService } from './class.service';

@Injectable({
  providedIn: 'root',
})
export class UnitService {
  constructor(private http: PecHttpService, private classService: ClassService) {}

  public list(classId: number): Observable<Unit[]> {
    return this.classService.status(classId, false).pipe(
      concatMap((status) =>
        status && status.HasAccess
          ? this.http.request({
              url: `api/lms/class/${classId}/unit`,
              signature: 'api/lms/class/${classId}/unit',
              method: 'Get',
              config: { cache: true },
            })
          : throwError('No Access to class')
      )
    );
  }

  public assignments(classId: number, unitNumber: number): Observable<UnitAssignment> {
    if (!unitNumber) return throwError('unitNumber is required');

    return this.http.request({
      url: `api/lms/class/${classId}/unit/${unitNumber}/assignments`,
      signature: 'api/lms/class/${classId}/unit/${unitNumber}/assignments',
      method: 'Get',
      config: { cache: true },
    });
  }

  public unitInfo(classId: number, unitNumber: number): Observable<UnitInfo> {
    if (!unitNumber) return throwError('unitNumber is required');

    return this.http.request({
      url: `api/lms/class/${classId}/unit/${unitNumber}`,
      signature: 'api/lms/class/${classId}/unit/${unitNumber}',
      method: 'Get',
      config: { cache: true },
    });
  }

  public unitObjectives(classId: number, unitNumber: number): Observable<UnitObjectives[]> {
    if (!unitNumber) return throwError('unitNumber is required');

    return this.http.request({
      url: `api/lms/class/${classId}/Unit/${unitNumber}/objectives`,
      signature: 'api/lms/class/${classId}/Unit/${unitNumber}/objectives',
      method: 'Get',
      config: { cache: true },
    });
  }

  public learningMaterials(classId: number): Observable<UnitLearningMaterials[]> {
    return this.http.request({
      url: `api/ResourcesApi/GetLearningMaterialsV2?classId=${classId}`,
      signature: 'api/ResourcesApi/GetLearningMaterialsV2?classId=${classId}',
      method: 'Get',
      config: { cache: true },
    });
  }

  public unitLearningMaterials(classId: number): Observable<UnitLearningMaterials[]> {
    return this.http.request({
      url: `api/ResourcesApi/GetLearningMaterials?classId=${classId}`,
      signature: 'api/ResourcesApi/GetLearningMaterials?classId=${classId}',
      method: 'Get',
      config: { cache: true },
    });
  }

  public steps(classId: number, unitNumber: number): Observable<UnitSteps[]> {
    if (!unitNumber) return throwError('unitNumber is required');

    return this.http.request({
      url: `api/lms/class/${classId}/steps?unitSequenceNumber=${unitNumber}`,
      signature: 'api/lms/class/${classId}/steps?unitSequenceNumber=${unitNumber}',
      method: 'Get',
      config: { cache: true },
    });
  }
}
