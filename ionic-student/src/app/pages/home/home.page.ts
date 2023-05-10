import { Component, Input, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PopoverController, ViewDidEnter } from '@ionic/angular';
import { Router } from '@angular/router';
import { Class } from 'src/app/data/types/class.type';
import { ClassService } from '../../data/services/class.service';
import { ContactService } from '../../data/services/contact.service';
import { UserService } from '../../data/services/user.service';
import { EnrollmentService } from '../../data/services/enrollment.service';
import { GlobalConfigsService } from '../../shared/services/global-configs.service';
import { StorageService } from '../../shared/services/storage.service';
import { first } from 'rxjs/operators';
import { ContactInfo } from 'src/app/data/types/contact.type';
import { User } from 'src/app/data/types/user.type';
import { EnrollmentDegreeInfo, Enrollment } from 'src/app/data/types/enrollment.type';
import { BasePageComponent } from 'src/app/shared/components/base-page-component/base-page.component';
import { SapAppealComponent } from './components/sap-appeal/sap-appeal.component';
import { ThemeId } from '../../shared/enums/theme-id.enum';
import { BiometricsService } from '../../shared/services/biometrics.service';
import { AuthService } from '../../data/services/auth.service';
import { TrackingService } from '../../shared/services/tracking.service';

@Component({
  selector: 'pec-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage extends BasePageComponent implements ViewDidEnter, OnDestroy {
  public adEnrollId: number;
  public enrollment: Enrollment;
  public classList: Class[];
  public contactList: ContactInfo[];
  public user: User;
  public degree: EnrollmentDegreeInfo;
  public noClassesMessage: string;
  public showLoading = true;

  private sapAppealPopover: HTMLIonPopoverElement;
  private sapAppealShowDate: string;
  private gpaNA = false;
  private isCtu = false;

  constructor(
    private storage: StorageService,
    private datePipe: DatePipe,
    private popOverController: PopoverController,
    private classService: ClassService,
    private contactService: ContactService,
    private userService: UserService,
    private enrollmentService: EnrollmentService,
    private router: Router,
    private globalConfigs: GlobalConfigsService,
    private biometricsService: BiometricsService,
    private authService: AuthService,
    private trackingService: TrackingService
  ) {
    super();
  }

  public ionViewDidEnter() {
    this.loadEnrollment(true);
  }

  public clearSubscriptions() {
    super.clearSubscriptions();
    if (this.sapAppealPopover) {
      this.sapAppealPopover.dismiss();
      delete this.sapAppealPopover;
    }
  }

  public refreshPage(event) {
    this.clearSubscriptions();
    this.loadEnrollment(true);
    setTimeout(() => {
      if (event) event.target.complete();
    }, 2000);
  }

  public navigateToContacts() {
    this.router.navigate(['/tabs/more/contacts'], { queryParams: { tabSelect: '1' } });
  }

  private presentSapAppealPopOver() {
    this.popOverController
      .create({
        component: SapAppealComponent,
        componentProps: {
          sapAppeal: this.user.SapAppeal,
        },
        cssClass: 'presentSap-popover',
      })
      .then((popOver) => {
        this.sapAppealPopover = popOver;
        this.sapAppealPopover.present();
      });
  }

  private loadEnrollment(refresh: boolean) {
    this.enrollmentService
      .getEnrollment(refresh)
      .pipe(first())
      .subscribe((enrollment) => {
        this.enrollment = enrollment;
        const length = enrollment.length;
        for (let i = 0; i < length; i++) {
          if (enrollment[i].IsCurrent) {
            this.adEnrollId = enrollment[i].AdEnrollId;
            this.loadData(true);
          }
        }
      });
  }

  private loadData(refresh: boolean) {
    this.trackingService.trackView({ view: 'App Home' });
    this.enrollmentService
      .info(refresh)
      .pipe(first())
      .subscribe(
        (degree) => {
          this.degree = degree;
          this.isCtu = this.globalConfigs.themeId === ThemeId.CTU;
          if (this.isCtu && degree.IsMinCreditsCompleted) {
          }
          if (!this.isCtu && degree.CreditsEarned > 0) {
          }
          if (!this.isCtu && degree.CreditsEarned === 0 && degree.GPA === 0) {
            this.degree.IsMinCreditsCompleted = false;
          }

          if (degree.GPA === 0 && degree.DegreeCompletion >= 15) {
            if (degree.GPACalc === 0) {
              this.gpaNA = true;
              //No earned GPA
            } else {
              //Earned GPA
              this.gpaNA = false;
            }
          } else {
            this.gpaNA = false;
          }
        },
        (error) => {
          this.navigatetoErrorPage('DEGINFO');
        }
      );

    this.userService
      .info({ refresh })
      .pipe(first())
      .subscribe(
        (user) => {
          this.user = user;

          this.classService
            .classList('Current', refresh)
            .pipe(first())
            .subscribe(
              (list) => {
                this.classList = list;
                if (this.classList) {
                  this.classList.sort(this.sortList);
                }
                this.showLoading = false;
                if (!this.classList || this.classList.length === 0) {
                  this.getNoClassMessage(this.user);
                }
              },
              (error) => {
                this.navigatetoErrorPage('CLASSLISTINFO');
              }
            );

          this.contactService
            .contacts(refresh)
            .pipe(first())
            .subscribe(
              (list) => {
                this.contactList = list;

                if (this.contactList) {
                  if (this.user.StudentStatusId === 91 || this.user.StudentStatusId === 93) {
                    this.contactList.sort(this.sortContactListAsc);
                  } else {
                    this.contactList.sort(this.sortContactListDesc);
                  }
                }
              },
              (error) => {
                this.navigatetoErrorPage('CONTCTINFO');
              }
            );

          if (!this.subscriptions.sapAppealShowDate) {
            this.subscriptions.sapAppealShowDate = this.storage
              .getItem<string>('sapAppealShowDate')
              .subscribe((value) => {
                if (value) {
                  this.sapAppealShowDate = value;
                }
              });
          }
          if (this.user) {
            //SapAppeal testing is next sprint, I couldn't get test data so created my own will remove later
            //this.user.SapAppeal = { DueDate : new Date(), Message: 'You are currently on probation and your SAP appeal letter has not yet been submitted.  You must submit your appeal letter by {dueDate} or you will be withdrawn.',AdditionalInformationLink: 'http://careered.libguides.com/ctu/sap' };

            if (this.user.SapAppeal) {
              const now: Date = new Date();
              const today = this.datePipe.transform(now.toString(), 'yyyy-dd-MM');

              if (this.sapAppealShowDate !== today) {
                this.presentSapAppealPopOver();
                this.storage.setItem('sapAppealShowDate', this.datePipe.transform(now.toString(), 'yyyy-dd-MM'), true);
              }
            }
          }
        },
        (error) => {
          this.navigatetoErrorPage('USRINFO');
        }
      );
  }

  private sortContactListDesc(a: ContactInfo, b: ContactInfo) {
    const r = (a.DisplayName || '').toLowerCase().localeCompare((b.DisplayName || '').toLowerCase());
    if (r) return r;
    return 0;
  }

  private sortContactListAsc(a: ContactInfo, b: ContactInfo) {
    const r = (a.DisplayName || '').toLowerCase().localeCompare((b.DisplayName || '').toLowerCase());
    if (!r) return r;
    return 0;
  }

  private sortList(a: Class, b: Class) {
    if (a && !b) return -1;
    if (!a && b) return 1;

    if (a.StartDate && !b.StartDate) return -1;
    if (!a.StartDate && b.StartDate) return 1;

    let r = new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime();
    if (r) return r;

    r = (a.CourseName || '').toLowerCase().localeCompare((b.CourseName || '').toLowerCase());
    if (r) return r;

    return 0;
  }

  private getNoClassMessage(user: User) {
    switch (user.StudentStatusId) {
      case 15:
      case 16: {
        this.noClassesMessage =
          'Welcome back! We hope you were able to accomplish your goals during your time away and we are excited to see you in class soon. You can access your new courses here as soon as Early Access opens. Reach out to your Success Coach now to set up a plan for success.';
        break;
      }
      case 91:
      case 93: {
        this.noClassesMessage = `Congratulations on earning your degree from ${this.globalConfigs.brandName}! Graduating from college is a notable educational milestone and a major life accomplishment. It’s time to celebrate and show the world what you’re capable of achieving!`;
        break;
      }
      case 5: {
        this.noClassesMessage = `Welcome to ${this.globalConfigs.brandName}! Your courses will be available here soon. Remember to join GetSet to get to know your classmates, and reach out to your Success Coach to build a plan for success!`;
        break;
      }
      default: {
        this.noClassesMessage =
          this.globalConfigs.themeId === 9
            ? ' You do not have active classes at this time. Class(es) will load on the first day of early access, which is the Friday before your session begins.'
            : ' You do not have active classes at this time. Class(es) will load on the first day of early access, which is the Monday before your session begins.';
        break;
      }
    }
  }

  private navigatetoErrorPage(errorMsg: string, errData?) {
    this.router.navigate(['/error/technical-difficulties/' + errorMsg], {
      state: { errorData: errData ? errData : '' },
    });
  }
}
