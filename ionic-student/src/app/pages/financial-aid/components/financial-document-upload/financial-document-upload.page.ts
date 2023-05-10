import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { ContactService } from 'src/app/data/services/contact.service';
import { DocUploadRequest, UserService } from 'src/app/data/services/user.service';
import { BasePageComponent } from 'src/app/shared/components/base-page-component/base-page.component';
import { MultiFileUploadComponent } from 'src/app/shared/components/multi-file-upload/multi-file-upload.component';
import { PecLoaderService } from 'src/app/shared/services/pec-loader.service';
import { PecNavigationService } from 'src/app/shared/services/pec-navigation.service';
import { TrackingService } from 'src/app/shared/services/tracking.service';
import { ModalController } from '@ionic/angular';
import { FinancialDocumentUploadModalComponent } from '../financial-document-upload-modal/financial-document-upload-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import { ActionSheetController, AlertController } from '@ionic/angular';

@Component({
  selector: 'pec-financial-document-upload',
  templateUrl: './financial-document-upload.page.html',
  styleUrls: ['./financial-document-upload.page.scss'],
})
export class FinancialDocumentUploadPage extends BasePageComponent {
  @ViewChild(MultiFileUploadComponent) fileField: MultiFileUploadComponent;

  public documentId: number;
  public documentUploadName: string;
  public docTypeId: number;
  public showError = false;
  public errorCodeMessage: string;
  public sendDocuments: FormGroup;
  public initFilesList = false;
  public charCount: string;
  public files: File[];
  public previousView: string;
  private comments: string;
  private documentModal: HTMLIonModalElement;
  private alert: HTMLIonAlertElement;

  constructor(
    private router: Router,
    private contactService: ContactService,
    private userService: UserService,
    private trackingService: TrackingService,
    private platform: Platform,
    private loadingCtrl: PecLoaderService,
    private fb: FormBuilder,
    private pecNavService: PecNavigationService,
    private activatedRoute: ActivatedRoute,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    public sanitizer: DomSanitizer,
    public globalConfig: GlobalConfigsService
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

    this.sendDocuments = this.fb.group({
      commentsText: [''],
    });
  }

  ionViewDidEnter() {
    this.previousView = this.pecNavService.getPreviousUrl();
    if (this.previousView.startsWith('/tabs/more')) {
      this.documentId = 0;
      this.docTypeId = 0;
      this.documentUploadName = '';
    }
    if (this.activatedRoute.snapshot.queryParams.tabSelect) {
      if (this.activatedRoute.snapshot.queryParams.tabSelect === '5') {
        this.previousView = 'tabs/more';
      } else if (this.activatedRoute.snapshot.queryParams.tabSelect === '4') {
        this.previousView = 'tabs/financial-aid';
      }
    }
    this.fileField.count = 0;
    if (this.docTypeId) {
      this.fileField.docTypeId = this.docTypeId.toString();
    }

    if (this.initFilesList && !this.documentId) {
      this.fileField.removeFromQueueAll();
      this.sendDocuments.reset();
      this.documentId = null;
      this.documentUploadName = null;
      this.docTypeId = null;
      this.charCount = null;
    } else if (this.initFilesList && this.documentId) {
      this.fileField.removeFromQueueAll();
      this.sendDocuments.reset();
      this.charCount = null;
    }
  }

  public submitSendDocuments() {
    this.showLoadingModal().then(() => {
      this.upload().then(
        () => {
          this.comments = '';
          this.onUploadFinished(true);
        },
        () => {
          this.onUploadFinished(false);
        }
      );
    });
  }

  public onError(errorMsg: string) {
    this.showError = true;
    this.errorCodeMessage = errorMsg;
  }

  public presentUploadModal(itemName) {
    this.modalCtrl
      .create({
        component: FinancialDocumentUploadModalComponent,
        componentProps: {
          fileField: this.fileField,
          goToItem: itemName,
        },
        cssClass: 'financial-document-upload-modal',
        backdropDismiss: true,
        mode: 'md',
      })
      .then((modal) => {
        this.documentModal = modal;
        this.documentModal.present();
      });
  }

  public multiFileUpload() {
    this.fileField.presentActionSheet();
  }

  public showAlert(item) {
    return this.alertCtrl
      .create({
        header: 'Remove Document?',
        message: 'Are you sure you would like to remove this document?  This action cannot be undone.',
        mode: 'md',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Remove',
            role: 'confirm',
            handler: () => {
              this.fileField.removeFromQueue(item);
            },
          },
        ],
      })
      .then((alert) => {
        this.alert = alert;

        this.alert.onDidDismiss().then(() => {
          delete this.alert;
        });

        this.alert.present();

        return alert;
      });
  }

  public onBack() {
    if (this.previousView === this.pecNavService.getCurrentUrl()) {
      this.previousView = 'tabs/financial-aid';
    }
    if (this.previousView) {
      this.router.navigateByUrl(this.previousView);
    } else {
      this.pecNavService.goBack();
    }
  }

  private onUploadFinished(isSuccess: boolean) {
    this.hideLoadingModal().then(() => {
      const originalFiles = this.fileField.getFiles();

      const uploadedFiles = this.fileField.uploadedFiles.map((a) => {
        return { name: a.file.name, size: a.file.size };
      });

      this.router.navigate(['/tabs/financial-aid/document-upload-confirmation'], {
        state: {
          isSuccess,
          docId: this.documentId,
          docTypeId: this.docTypeId,
          docSummary: this.documentUploadName,
          originalFiles,
          uploadedFiles,
          comments: this.comments,
        },
      });
    });
  }

  private showLoadingModal() {
    return this.loadingCtrl.show('Please wait...');
  }

  private hideLoadingModal() {
    return this.loadingCtrl.dismiss();
  }

  private upload(): Promise<boolean> {
    this.trackingService.trackEvent({
      view: 'Upload Document',
      category: 'Upload Document',
      action: 'Tapped to Send Document',
      label: `${this.docTypeId ?? ''}`,
      value: '',
    });

    return new Promise<boolean>((resolve, reject) => {
      this.initFilesList = true;
      this.files = this.fileField.getFiles();

      const docUploadRequest: DocUploadRequest = {} as any;
      const formData = new FormData();
      let count = 0;
      this.files.forEach((file) => {
        formData.append('Documents', file, this.fileField.uploadedFiles[count].file.name);
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

      if (this.sendDocuments.controls.commentsText.value) {
        this.trackingService.trackEvent({
          view: 'Upload Document',
          category: 'Upload Document',
          action: 'Entered Comments on Doc Upload',
          label: '',
          value: '',
        });

        this.comments = this.sendDocuments.controls.commentsText.value;
        docUploadRequest.Comments = this.sendDocuments.controls.commentsText.value;
        formData.append('Comments', this.sendDocuments.controls.commentsText.value);
      }

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
