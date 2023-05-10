import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../shared/components/base-component/base.component';
import { LevelOfUrgency, RequiredAction, TimeToComplete } from '../../../../data/types/financial-aid.type';
import * as moment from 'moment';
import { ModalController } from '@ionic/angular';
import { FinancialAidDocumentSlideupComponent } from '../financial-aid-document-slideup/financial-aid-document-slideup.component';

@Component({
  selector: 'pec-financial-aid-document-item',
  templateUrl: './financial-aid-document-item.component.html',
  styleUrls: ['./financial-aid-document-item.component.scss'],
})
export class FinancialAidDocumentItemComponent extends BaseComponent implements OnInit {
  @Input() document: RequiredAction;

  public isUrgent: boolean;
  public timeToComplete: string;

  private detailsSlideupModal: HTMLIonModalElement;

  constructor(private modalCtrl: ModalController) {
    super();
  }

  public ngOnInit() {
    switch (this.document.TimeToComplete) {
      case TimeToComplete.OneMinute:
        this.timeToComplete = '1 min to complete';
        break;
      case TimeToComplete.FiveMinutes:
        this.timeToComplete = '5-10 mins to complete';
        break;
      case TimeToComplete.FifteenMinutes:
        this.timeToComplete = '15-20 mins to complete';
        break;
      case TimeToComplete.ThirtyMinutes:
        this.timeToComplete = '30 mins to complete';
        break;
    }

    if (!this.document.DateDue) {
      return;
    }

    const momentDueDate = moment(this.document.DateDue);
    const momentToday = moment(new Date());
    let urgentDays = 0;

    switch (this.document.LevelOfUrgency) {
      case LevelOfUrgency.Always:
        this.isUrgent = true;
        break;
      case LevelOfUrgency.ThreeDays:
        urgentDays = 3;
        break;
      case LevelOfUrgency.Week:
        urgentDays = 7;
        break;
      case LevelOfUrgency.TwoWeeks:
        urgentDays = 14;
        break;
      case LevelOfUrgency.ThreeWeeks:
        urgentDays = 21;
        break;
    }

    if (urgentDays > 0) {
      const diffDate = momentDueDate.subtract(urgentDays, 'days').set({ hour: 0, minute: 1 });
      if (diffDate <= momentToday) {
        this.isUrgent = true;
      }
    }
  }

  public openDetailsSlideup() {
    this.modalCtrl
      .create({
        component: FinancialAidDocumentSlideupComponent,
        componentProps: { document: this.document },
        cssClass: 'document-details-slideup',
      })
      .then((modal) => {
        this.detailsSlideupModal = modal;
        this.detailsSlideupModal.present();
      });
  }
}
