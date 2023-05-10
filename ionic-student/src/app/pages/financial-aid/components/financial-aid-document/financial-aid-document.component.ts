import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FinancialAidService } from 'src/app/data/services/financial-aid.service';
import { ActionViewType, RequiredAction } from 'src/app/data/types/financial-aid.type';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import { TrackingService } from 'src/app/shared/services/tracking.service';
import * as moment from 'moment';

@Component({
  selector: 'pec-financial-aid-document',
  templateUrl: './financial-aid-document.component.html',
  styleUrls: ['./financial-aid-document.component.scss'],
})
export class FinancialAidDocumentComponent extends BaseComponent implements OnInit {
  @Input() isPackaged: boolean;
  @Input() refresh: boolean;
  @Input() requiredActions: RequiredAction[] = [];
  @Input() submittedActions: RequiredAction[] = [];

  public documentsCount: number;
  public overviewDescription: string;
  public filteredActions: RequiredAction[] = [];

  constructor(public globalConfigs: GlobalConfigsService) {
    super();
  }

  public ngOnInit() {
    this.instantiateValues();
  }

  private instantiateValues() {
    if (this.requiredActions && this.requiredActions.length > 0) {
      this.documentsCount = this.requiredActions.length;
      this.requiredActions.sort(this.sortByDueDate);

      if (this.requiredActions.length > 3) {
        this.filteredActions = this.requiredActions.slice(0, 3);
      } else {
        this.filteredActions = this.requiredActions;
      }

      this.overviewDescription =
        'Below are the outstanding docs that can be completed on the student app. A full list of documents can be found on your student portal.';
    } else {
      this.documentsCount = 0;
      this.overviewDescription =
        'Great news, you have no required actions that can be completed on the student app at this time. Please check back as new documents can be added throughout the school year. A full list of documents can be found on your student portal.';
    }
  }

  private sortByDueDate(a, b) {
    if (a.DateDue === null && b.DateDue === null) {
      if (a.Summary < b.Summary) {
        return -1;
      } else if (a.Summary > b.Summary) {
        return 1;
      }
    }

    if (a.DateDue === null) {
      return 1;
    }

    if (b.DateDue === null) {
      return -1;
    }

    const adate = moment(a.DateDue).hour(0).minute(0).second(0).millisecond(0).toDate();
    const bdate = moment(b.DateDue).hour(0).minute(0).second(0).millisecond(0).toDate();

    if (adate > bdate) {
      return 1;
    } else if (adate < bdate) {
      return -1;
    }

    if (a.Summary < b.Summary) {
      return -1;
    } else if (a.Summary > b.Summary) {
      return 1;
    }

    return 0;
  }
}
