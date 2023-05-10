import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PecHttpService } from '../../shared/services/pec-http.service';
import { Tips, StatusViewType, Payment, ActionViewType, AwardLetter } from '../types/financial-aid.type';

@Injectable({
  providedIn: 'root',
})
export class FinancialAidService {
  constructor(private http: PecHttpService) {}

  public financialAidAction(viewType: number, refresh?: boolean): Observable<ActionViewType> {
    return this.http.request({
      url: `api/fa/action?viewType=${viewType}`,
      method: 'Get',
      signature: `api/fa/action?viewType=${viewType}`,
      config: {
        cache: false,
        refresh,
      },
    });
  }

  public financialAidPayment(refresh?: boolean): Observable<Payment> {
    return this.http.request({
      url: 'api/fa/payment',
      method: 'Get',
      signature: 'api/fa/payment',
      config: {
        cache: true,
        refresh,
      },
    });
  }

  public financialAidStatus(viewType: number, refresh?: boolean): Observable<StatusViewType> {
    return this.http.request({
      url: `api/fa/status/v2?viewType=${viewType}`,
      method: 'Get',
      signature: 'api/fa/status/v2?viewType=${viewType}',
      config: {
        cache: true,
        refresh,
      },
    });
  }

  public financialAidTips(sourceSystemId: number, syCampusId: number, refresh?: boolean): Observable<Tips> {
    return this.http.request({
      url: `api/fa/tips?sourceSystemId=${sourceSystemId}&syCampusId=${syCampusId}`,
      method: 'Get',
      signature: `api/fa/tips?sourceSystemId={sourceSystemId}&syCampusId={syCampusId}`,
      config: {
        cache: true,
        refresh,
      },
    });
  }

  public myDocuments(syModuleId: number): Observable<AwardLetter[]> {
    return this.http.request({
      url: `api/mydocuments?syModuleId=${syModuleId}`,
      method: 'Get',
      signature: `api/mydocuments?syModuleId={syModuleId}`,
      config: {
        cache: true,
      },
    });
  }
}
