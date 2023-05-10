import { Component, ElementRef } from '@angular/core';
import { BasePageComponent } from '../../../../shared/components/base-page-component/base-page.component';
import { UsState, UsStatesService } from '../../../../shared/services/us-states.service';
import { AlertController, Platform } from '@ionic/angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GraduateFileService } from '../../../../data/services/graduate-file.service.';
import { GraduateFileStatus } from '../graduate-file/graduate-file.component';
import { TrackingService } from '../../../../shared/services/tracking.service';
import { ContactService } from '../../../../data/services/contact.service';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { ContactInfo } from '../../../../data/types/contact.type';
import { CampusId } from '../../../../shared/enums/campus-id.enum';
import { first } from 'rxjs/operators';
import { IonRefresher } from '@ionic/angular/directives/proxies';
import { Router } from '@angular/router';
import { PecPopOverService } from '../../../../shared/services/pec-popover.service';
import { GradFileSubmitPopoverComponent } from '../grad-file-submit-popover/grad-file-submit-popover.component';
import { PageLeavePopoverComponent } from '../page-leave-popover/page-leave-popover.component';
import { format, parseISO } from 'date-fns';

@Component({
  selector: 'pec-employment-form',
  templateUrl: './employment-form.component.html',
  styleUrls: ['./employment-form.component.scss'],
})
export class EmploymentFormComponent extends BasePageComponent {
  public showError = false;
  public showLoading = true;
  public showContactLoading = false;
  public errorCodeMessage: any;
  public contact: ContactInfo;
  public employmentStatus: string;
  public usStates: UsState[] = [];
  public employmentDetailsForm: FormGroup;
  public formattedJobStartDate = '__/__/____';

  private refresher: IonRefresher;
  private closePromptPromise: Promise<boolean>;
  private closePromptAlert: HTMLIonPopoverElement;

  constructor(
    public globalConfigs: GlobalConfigsService,
    private popoverCtrl: PecPopOverService,
    private fb: FormBuilder,
    private el: ElementRef,
    private contactService: ContactService,
    private trackingService: TrackingService,
    private usStatesService: UsStatesService,
    private graduateFileService: GraduateFileService,
    private alertCtrl: AlertController,
    private router: Router,
    private platform: Platform
  ) {
    super();

    this.usStates = usStatesService.getAll();
    this.employmentDetailsForm = fb.group({
      EmployerName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      EmployerStreetAddress: new FormControl('', [Validators.required, Validators.maxLength(250)]),
      EmployerCity: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      SystateId: new FormControl('', [Validators.required]),
      EmployerZip: new FormControl('', [Validators.required, Validators.pattern(/^([0-9]{5})$/g)]),
      WorkPhone: new FormControl('', [Validators.required, Validators.pattern(/^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/g)]),
      WorkPhoneExtn: new FormControl('', [Validators.maxLength(4), Validators.pattern('^[0-9]*$')]),
      JobTitle: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      JobStartDate: new FormControl('', [Validators.required]),
      HoursWorkedPerWeek: new FormControl('', [Validators.required, Validators.min(0), Validators.max(168)]),
      DailyDuties: new FormControl('', [Validators.required, Validators.maxLength(500)]),
    });
  }

  public hasError(control: string, error: string = null) {
    const field = this.employmentDetailsForm.controls[control];
    return error ? field.hasError(error) && field.touched : field.invalid;
  }

  public submitEmploymentDetails() {
    if (this.employmentStatus === 'no') {
      this.presentSubmitConfirmation();
      return;
    }

    if (this.employmentDetailsForm.invalid) {
      Object.keys(this.employmentDetailsForm.controls).forEach((field) => {
        const control = this.employmentDetailsForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
      setTimeout(() => this.scrollToFirstInvalidControl(), 0);
      return;
    }

    this.presentSubmitConfirmation();
  }

  public setFormattedJobStartDate(value) {
    this.formattedJobStartDate = format(parseISO(value), 'MM/dd/yyyy');
  }

  public doRefresh(refresher) {
    if (this.refresher) {
      return;
    }

    this.refresher = refresher;
    this.clearSubscriptions();
    this.loadData(true);
  }

  public ionViewWillEnter() {
    setTimeout(this.loadData.bind(this), 0);
  }

  public ionViewDidLeave() {
    this.clearSubscriptions();
    this.popoverCtrl.dismiss();
    this.alertCtrl.getTop().then((p) => {
      if (p) p.dismiss();
    });
  }

  public canPageLeave(): Promise<boolean> {
    if (!this.globalConfigs.requireNavigationConfirmation) {
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    }

    if (this.closePromptPromise) {
      return this.closePromptPromise;
    }

    const unregister = this.platform.backButton.subscribeWithPriority(200, () => {
      this.alertCtrl.dismiss();
    });

    this.closePromptPromise = new Promise((resolve, reject) => {
      this.popoverCtrl
        .show({
          component: PageLeavePopoverComponent,
          componentProps: {
            buttons: [
              {
                label: 'Yes',
                action: () => {
                  this.popoverCtrl.dismiss().then(() => {
                    delete this.closePromptPromise;
                    delete this.closePromptAlert;

                    this.globalConfigs.requireNavigationConfirmation = false;
                    unregister.unsubscribe();
                    resolve(true);
                  });
                },
              },
              {
                label: 'No',
                action: () => {
                  this.popoverCtrl.dismiss().then(() => {
                    delete this.closePromptPromise;
                    delete this.closePromptAlert;

                    this.globalConfigs.requireNavigationConfirmation = true;
                    resolve(false);
                  });
                },
              },
            ],
          },
        })
        .then((alert) => {
          this.globalConfigs.requireNavigationConfirmation = false;
          this.closePromptAlert = alert;
        });
    });

    return this.closePromptPromise;
  }

  private scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector('.invalid-scroll-anchor');
    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

      setTimeout(() => {
        const input = firstInvalidControl.querySelector('input');
        if (input) {
          input.focus();
        }
      }, 300);
    }
  }

  private loadData(refresh?: boolean) {
    this.contactService
      .allContacts(null, refresh)
      .pipe(first())
      .subscribe(
        (contacts) => {
          if (this.globalConfigs.sycampusid === CampusId.CTU_ONLINE) {
            this.contact = contacts.find((c) => c.ContactGroup === 'Success Coach');
          }

          if (!this.contact) {
            this.contact = contacts.find((c) => c.ContactGroup === 'Student Advising');
          }

          this.showContactLoading = false;
          this.clearLoading();
        },
        (error) => {
          this.onError('CONTCTINFO');

          this.trackingService.trackEvent({
            view: 'Graduate File View',
            category: 'System Errors',
            action: 'ErrorCode : CONTCTINFO',
            label: 'Graduate File Page',
            value: '',
          });
        }
      );
  }

  private onError(errorMsg) {
    this.showError = true;
    this.errorCodeMessage = errorMsg;
    this.showLoading = false;
  }

  private closeRefresher() {
    setTimeout(() => {
      if (this.refresher) {
        this.refresher.complete();
        delete this.refresher;
      }
    }, 300);
  }

  private clearLoading() {
    this.showLoading = false;
    this.closeRefresher();
  }

  private redirectToGradFilePage(status: GraduateFileStatus, formValues: any = null, fileStatus: boolean = true) {
    this.router.navigate(['/tabs/more/graduate-file'], { state: { status, formValues, fileStatus } });
  }

  private presentSubmitConfirmation() {
    this.popoverCtrl.show({
      component: GradFileSubmitPopoverComponent,
      componentProps: {
        buttons: [
          {
            label: 'Yes',
            action: () => {
              this.popoverCtrl.dismiss();
              this.globalConfigs.requireNavigationConfirmation = false;

              const employmentStatus = this.employmentStatus === 'yes';
              const formValues = this.employmentDetailsForm.value;
              this.showLoading = true;
              this.graduateFileService.submitGraduateFile(formValues, employmentStatus).subscribe(
                () => {
                  this.showLoading = false;
                  this.redirectToGradFilePage(GraduateFileStatus.SuccessfullySubmitted);
                },
                (error) => {
                  this.showLoading = false;
                  this.redirectToGradFilePage(GraduateFileStatus.Error, formValues, employmentStatus);
                }
              );
            },
          },
          {
            label: 'No',
            action: () => {
              this.popoverCtrl.dismiss();
            },
          },
        ],
      },
    });
  }
}
