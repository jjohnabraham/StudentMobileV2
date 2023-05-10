import { ChangeDetectorRef, Component } from '@angular/core';
import { BasePageComponent } from '../../../../shared/components/base-page-component/base-page.component';
import { TrackingService } from '../../../../shared/services/tracking.service';
import { GraduateFileService } from '../../../../data/services/graduate-file.service.';
import { ModalController, ViewWillEnter } from '@ionic/angular';
import { ContactService } from '../../../../data/services/contact.service';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { IonRefresher } from '@ionic/angular/directives/proxies';
import { ContactInfo } from '../../../../data/types/contact.type';
import { CampusId } from '../../../../shared/enums/campus-id.enum';

@Component({
  selector: 'pec-graduate-file',
  templateUrl: './graduate-file.component.html',
  styleUrls: ['./graduate-file.component.scss'],
})
export class GraduateFileComponent extends BasePageComponent implements ViewWillEnter {
  public employmentFormValues: any;
  public showError = false;
  public showLoading = true;
  public showContactLoading = true;
  public errorCodeMessage: any;
  public contact: ContactInfo;
  public graduateFileStatus: GraduateFileStatus;

  private refresher: IonRefresher;

  constructor(
    private globalConfigs: GlobalConfigsService,
    private modalCtrl: ModalController,
    private changeDetectorRef: ChangeDetectorRef,
    private contactService: ContactService,
    private trackingService: TrackingService,
    private graduateFileService: GraduateFileService,
  ) {
    super();
  }

  public doRefresh(refresher: IonRefresher) {
    if (this.refresher) {
      return;
    }

    this.refresher = refresher;
    this.clearSubscriptions();
    this.loadData(true);
  }

  public ionViewWillEnter() {
    this.showLoading = true;
    const state = history.state;
    this.graduateFileStatus = state?.status;
    this.employmentFormValues = state?.formValues; // employment form values in case we need to retry submission

    setTimeout(this.loadData.bind(this), 0);
  }

  public onEmploymentFormSubmitRetry() {
    if (!this.employmentFormValues) {
      return;
    }

    const fileStatus = !!this.employmentFormValues.EmployerName; // if there are values for form fields, user answered Yes to Are you currently employed question

    this.showLoading = true;
    this.graduateFileService.submitGraduateFile(this.employmentFormValues, fileStatus).subscribe(
      (response) => {
        if (response.IsSuccessful) {
          this.graduateFileStatus = GraduateFileStatus.SuccessfullySubmitted;
        } else {
          this.graduateFileStatus = GraduateFileStatus.Error;
        }

        this.showLoading = false;
      },
      () => {
        this.graduateFileStatus = GraduateFileStatus.Error;
        this.showLoading = false;
      }
    );
  }

  private loadData(refresh?: boolean) {
    if (!this.subscriptions.allcontacts) {
      this.showContactLoading = true;
      this.subscriptions.allcontacts = this.contactService.allContacts(null, refresh).subscribe(
        (contacts) => {
          if (this.globalConfigs.sycampusid === CampusId.CTU_ONLINE) {
            this.contact = contacts.find((c) => c.ContactGroup === 'Success Coach');
          }

          if (!this.contact) {
            this.contact = contacts.find((c) => c.ContactGroup === 'Student Advising');
          }

          this.showContactLoading = false;
        },
        () => {
          this.showContactLoading = false;
          this.onError('CONTCTINFO');

          this.trackingService.trackEvent({
            view: 'Graduate File View',
            category: 'System Errors',
            action: 'ErrorCode : CONTCTINFO',
            label: 'Graduate File Page',
            value: '',
          });

          setTimeout(() => {
            if (this.subscriptions.allcontacts) {
              this.subscriptions.allcontacts.unsubscribe();
              delete this.subscriptions.allcontacts;
            }
          }, 0);
        }
      );
    }

    if (!this.graduateFileStatus) {
      // if not redirected from Employment View, pull status from api
      if (!this.subscriptions.graduatefilestatus) {
        this.subscriptions.graduatefilestatus = this.graduateFileService.getGraduateFileStatus().subscribe(
          (response) => {
            if (response.IsMobileSubmitted) {
              this.graduateFileStatus = GraduateFileStatus.Submitted;
            } else {
              this.graduateFileStatus = GraduateFileStatus.NotSubmitted;
            }

            this.clearLoading();
          },
          () => {
            this.clearLoading();
            this.onError(null);

            setTimeout(() => {
              if (this.subscriptions.graduatefilestatus) {
                this.subscriptions.graduatefilestatus.unsubscribe();
                delete this.subscriptions.graduatefilestatus;
              }
            }, 0);
          }
        );
      }
    } else {
      setTimeout(() => this.clearLoading(), 100);
    }
  }

  private onError(errorMsg) {
    this.showError = true;
    this.errorCodeMessage = errorMsg;
  }

  private closeRefresher() {
    setTimeout(() => {
      if (this.refresher) {
        this.refresher.complete().then(() => delete this.refresher);
      }
    }, 300);
  }

  private clearLoading() {
    this.showLoading = false;
    this.closeRefresher();
  }
}

export enum GraduateFileStatus {
  NotSubmitted = 0,
  Submitted = 1,
  SuccessfullySubmitted = 2,
  Error = 3,
}
