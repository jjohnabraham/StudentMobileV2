import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { UserService, DocUploadRequest } from 'src/app/data/services/user.service';
import { BasePageComponent } from 'src/app/shared/components/base-page-component/base-page.component';
import { MultiFileUploadComponent } from 'src/app/shared/components/multi-file-upload/multi-file-upload.component';
import { PecLoaderService } from 'src/app/shared/services/pec-loader.service';
import { TrackingService } from 'src/app/shared/services/tracking.service';

@Component({
  selector: 'pec-financial-document-upload-confirmation',
  templateUrl: './financial-document-upload-confirmation.page.html',
  styleUrls: ['./financial-document-upload-confirmation.page.scss'],
})
export class FinancialDocumentUploadConfirmationPage extends BasePageComponent {
  @ViewChild(MultiFileUploadComponent) fileField: MultiFileUploadComponent;

  public documentId: number;
  public documentUploadName: string;
  public docTypeId: number;
  public isSubmitSuccess = false;
  public uploadedFiles: { name: string; size: any }[];
  public originalFiles: File[];
  public queue: any;
  public showError = false;
  public errorCodeMessage: string;

  private comments: string;

  constructor(
    private router: Router,
    private userService: UserService,
    private trackingService: TrackingService,
    public navCtrl: NavController,
    private loadingCtrl: PecLoaderService
  ) {
    super();
    const state = router.getCurrentNavigation().extras.state;
    if (state && state.docId) {
      this.documentId = +state.docId;
    }

    if (state && state.docSummary) {
      this.documentUploadName = state.docSummary;
    }

    if (state && state.docTypeId) {
      this.docTypeId = +state.docTypeId;
    }

    if (state && state.originalFiles) {
      this.originalFiles = state.originalFiles;
    }

    if (state && state.uploadedFiles) {
      this.uploadedFiles = state.uploadedFiles;
    }

    if (state && state.isSuccess) {
      this.isSubmitSuccess = state.isSuccess;
    }

    if (state && state.comments) {
      this.comments = state.comments;
    }
  }

  public sendToFA() {
    this.navCtrl.navigateRoot('/tabs/financial-aid');
  }

  public submitSendDocuments() {
    this.showLoadingModal().then(() => {
      this.upload().then(
        () => this.hideLoadingModal().then(() => (this.isSubmitSuccess = true)),
        () => this.hideLoadingModal().then(() => (this.isSubmitSuccess = false))
      );
    });
  }

  private showLoadingModal() {
    return this.loadingCtrl.show('Please wait...');
  }

  private hideLoadingModal() {
    return this.loadingCtrl.dismiss();
  }

  private upload(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const docUploadRequest: DocUploadRequest = {} as any;
      const formData = new FormData();
      let count = 0;
      this.originalFiles.forEach((file) => {
        formData.append('Documents', file, file.name);
        count++;
      });
      docUploadRequest.Documents = formData;

      if (this.documentId) {
        docUploadRequest.CmDocumentId = this.documentId;
        formData.append('CmDocumentId', `${this.documentId}`);
      }

      if (this.documentUploadName) {
        docUploadRequest.DocumentName = this.documentUploadName;
        formData.append('DocumentName', this.documentUploadName);
      }

      if (this.docTypeId) {
        docUploadRequest.CmDocTypeId = this.docTypeId;
        formData.append('CmDocTypeId', `${this.docTypeId}`);
      }

      if (this.comments) {
        docUploadRequest.Comments = this.comments;
        formData.append('Comments', this.comments);

        this.trackingService.trackEvent({
          view: 'Upload Document',
          category: 'Upload Document',
          action: 'Entered Comments on Doc Upload',
          label: '',
          value: '',
        });
      }

      this.trackingService.trackEvent({
        view: 'Upload Document',
        category: 'Upload Document',
        action: 'Tapped to Send Document',
        label: `${this.docTypeId}`,
        value: '',
      });

      this.userService
        .sendDocuments(docUploadRequest)
        .pipe(first())
        .subscribe(
          (result) => {
            resolve(true);
            return;
          },
          (error) => {
            reject(error);
            return;
          }
        );
    });
  }
}
