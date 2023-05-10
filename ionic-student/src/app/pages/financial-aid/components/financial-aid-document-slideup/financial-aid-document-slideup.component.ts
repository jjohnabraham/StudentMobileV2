import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RequiredAction, TimeToComplete } from '../../../../data/types/financial-aid.type';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';

@Component({
  selector: 'pec-financial-aid-document-slideup',
  templateUrl: './financial-aid-document-slideup.component.html',
  styleUrls: ['./financial-aid-document-slideup.component.scss'],
})
export class FinancialAidDocumentSlideupComponent implements OnInit {
  @Input() document: RequiredAction;

  public documentLink: string;
  public isEsign = false;
  public isComplete = false;
  public isUpload = false;
  public isAccessDoc = false;
  public timeToComplete: string;

  constructor(private modalController: ModalController, public globalConfigs: GlobalConfigsService) {}

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

    if (this.document.DocumentLink) {
      this.documentLink = this.document.DocumentLink.replace('access_token={ssotoken}', 'slt={{token}}'); //changing the link to a form that cecRedirect (directive in html file) will be happy with
    }

    this.getSubmissionMethods(this.document);
  }

  public dismissModal() {
    this.modalController.dismiss();
  }

  private getSubmissionMethods(document) {
    const submissionMethod: number = document.SubmissionMethod;
    if ((SubmissionMethod.Complete & submissionMethod) === SubmissionMethod.Complete) {
      this.isComplete = true;
    }
    if ((SubmissionMethod.Esign & submissionMethod) === SubmissionMethod.Esign) {
      this.isEsign = true;
    }
    if ((SubmissionMethod.Upload & submissionMethod) === SubmissionMethod.Upload) {
      this.isUpload = true;
    }
    if ((SubmissionMethod.AccessDoc & submissionMethod) === SubmissionMethod.AccessDoc) {
      this.isAccessDoc = true;
    }
  }
}

export enum SubmissionMethod {
  Esign = 64,
  Complete = 128,
  AccessDoc = 256,
  Upload = 512,
}
