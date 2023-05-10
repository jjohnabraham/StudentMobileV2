import { Component } from '@angular/core';
import { FinancialAidService } from 'src/app/data/services/financial-aid.service';
import { BasePageComponent } from 'src/app/shared/components/base-page-component/base-page.component';
import { TrackingService } from 'src/app/shared/services/tracking.service';
import { Router } from '@angular/router';
import { IonRefresher } from '@ionic/angular/directives/proxies';
import { RequiredAction } from '../../data/types/financial-aid.type';
import { forkJoin, of } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'pec-financial-aid',
  templateUrl: './financial-aid.page.html',
  styleUrls: ['./financial-aid.page.scss'],
})
export class FinancialAidPage extends BasePageComponent {
  public errorCodeMessage: string;
  public faStatuses: any = [];
  public notYetPackagedActions: any = [];
  public showError = false;
  public showPageLoading = true;
  public displayOrder: number;
  public IsPackagedMessage: string = null;
  public isPackaged: boolean;
  public requiredActions: RequiredAction[] = [];
  public submittedActions: RequiredAction[] = [];
  public requestedNotRequiredActions: RequiredAction[] = [];

  private financialAidAwardRedirectUrl: string;

  constructor(
    private financialAidService: FinancialAidService,
    private trackingService: TrackingService,
    private router: Router
  ) {
    super();
  }

  public doRefresh(event) {
    this.clearSubscriptions();
    this.loadData();
    setTimeout(() => {
      if (event) event.target.complete();
    }, 2000);
  }

  public navigateToAllAwards() {
    this.router.navigate(['/tabs/financial-aid/award-letters']);
  }

  public clearLoading() {
    this.showPageLoading = false;
  }

  public onError(errorMsg: string) {
    this.showError = true;
    this.errorCodeMessage = errorMsg;
    this.clearLoading();
  }

  protected beginLoadData() {
    this.loadData();
  }

  private loadData() {
    this.showPageLoading = true;

    const obs = forkJoin([
      this.financialAidService.financialAidStatus(2).pipe(first()),
      this.financialAidService.financialAidAction(2).pipe(first()),
    ]);
    obs.subscribe(
      ([faStatus, financialAidAction]) => {
        this.faStatuses = faStatus.FinancialAidStatuses;
        this.financialAidAwardRedirectUrl = faStatus.FinancialAidAwardRedirectUrl;
        this.isPackaged = faStatus.IsPackaged;

        if (faStatus) {
          this.notYetPackagedActions = faStatus.NotYetPackagedActions;
          this.IsPackagedMessage = faStatus.Message;
        }

        if (this.faStatuses) {
          this.displayOrder = this.faStatuses.findIndex((a) => {
            return a.DisplayOrder === 0;
          });
        }

        this.requiredActions = financialAidAction.RequiredActions?.filter((d) => d.DocumentSubmissionDate == null);
        this.submittedActions = financialAidAction.RequiredActions?.filter((d) => d.DocumentSubmissionDate != null);
        this.requestedNotRequiredActions = financialAidAction.RequestedNotRequiredActions;

        this.clearLoading();
      },
      () => {
        this.onError('FASTATUS');
        this.trackingService.trackEvent({
          view: 'Financial Aid View',
          category: 'System Errors',
          action: 'ErrorCode : FASTATUS',
          label: 'Financial Page',
          value: '',
        });

        this.trackingService.trackEvent({
          view: 'Financial Aid View',
          category: 'System Errors',
          action: 'ErrorCode : FADOCS',
          label: 'Financial Page',
          value: '',
        });
      }
    );
  }
}
