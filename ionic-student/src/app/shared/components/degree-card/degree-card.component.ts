import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { EnrollmentService } from 'src/app/data/services/enrollment.service';
import { MobileService } from 'src/app/data/services/mobile.service';
import { EnrollmentDegreeInfo, TransferPendingClass } from 'src/app/data/types/enrollment.type';
import { MobileSettings } from 'src/app/data/types/mobile-settings.type';
import { GlobalConfigsService } from '../../services/global-configs.service';
import { TrackingService } from '../../services/tracking.service';
import { BaseComponent } from '../base-component/base.component';
import { UserService } from 'src/app/data/services/user.service';
import { ThemeId } from '../../enums/theme-id.enum';

@Component({
  selector: 'pec-degree-card',
  templateUrl: './degree-card.component.html',
  styleUrls: ['./degree-card.component.scss'],
})
export class DegreeCardComponent extends BaseComponent implements OnInit {
  @Output() loadedChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() errorOnLoad: EventEmitter<string> = new EventEmitter<string>();
  @Input() transferCourses: TransferPendingClass;
  @Input() isDegreePage: boolean;

  public showDegreeMessageCard = false;
  public degree: EnrollmentDegreeInfo;
  public degreeCard: EnrollmentDegreeInfo;
  public gpaNA: boolean;
  public lda: Date;
  public isCtu = false;
  public showDegreeProgressBar = false;

  private fastTrackSchedulingOn: boolean;

  constructor(
    private numberPipe: DecimalPipe,
    private enrollmentService: EnrollmentService,
    private mobileService: MobileService,
    private trackingService: TrackingService,
    private userService: UserService,
    private globalConfigs: GlobalConfigsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super();
  }
  ngOnInit(): void {
    this.loadData();
    this.loadDegreeCard();
  }

  public get degreeMessageCardContent() {
    return this.fastTrackSchedulingOn ? this.degree.Degree.FastTrackSchedulingMessage : this.degree.Degree.Message;
  }
  public get gpaDisplayText(): string {
    if (this.degree?.GPA !== 0) {
      return this.numberPipe.transform(this.degree?.GPA, '1.2');
    } else {
      return this.gpaNA ? 'N/A' : '0.0';
    }
  }

  public navigateToTransferCreditsPage() {
    this.trackingService.trackEvent({
      view: 'Degree Plan',
      category: 'Degree Plan View',
      action: 'Tapped Pending Transfer Credits',
      label: '',
      value: '',
    });

    this.router.navigate(['/tabs/degree/unoffical-transfer-credit']);
  }

  public gotoDegreeView() {
    this.router.navigate(['/tabs/degree'], { state: { previousurl: '/tabs/home' } });
  }

  private loadDegreeCard(refresh?: boolean) {
    this.subscriptions.degreeInfoDegPlan = this.enrollmentService.info(refresh).subscribe((degreeCard) => {
      this.degreeCard = degreeCard;
      this.loadedChanged.emit(true);

      if (!this.isDegreePage) {
        this.isCtu = this.globalConfigs.themeId === ThemeId.CTU;
        if (this.isCtu && degreeCard.IsMinCreditsCompleted) {
          this.showDegreeProgressBar = true;
        }
        if (!this.isCtu && degreeCard.CreditsEarned > 0) {
          this.showDegreeProgressBar = true;
        }
        if (!this.isCtu && degreeCard.CreditsEarned === 0 && degreeCard.GPA === 0) {
          this.degreeCard.IsMinCreditsCompleted = false;
        }
      }

      if (degreeCard.GPA === 0 && degreeCard.DegreeCompletion >= 15) {
        if (degreeCard.GPACalc === 0) {
          this.gpaNA = true;
          //No earned GPA
        } else {
          //Earned GPA
          this.gpaNA = false;
        }
      } else {
        this.gpaNA = false;
      }
    });
  }

  private loadData(refresh?: boolean) {
    this.userService
      .info({ refresh })
      .pipe(first())
      .subscribe((user: any) => {
        if (user.LDA && user.LDA !== '0001-01-01T00:00:00') {
          this.lda = user.LDA;
        } else {
          this.lda = null;
        }
      });

    if (!this.subscriptions.degreeInfoDegPlan) {
      this.subscriptions.degreeInfoDegPlan = this.enrollmentService.list(refresh).subscribe(
        (degree) => {
          this.degree = degree;
          this.loadedChanged.emit(true);
          if (this.degree.Degree.MessageType !== 0 && !this.degree.IsDegreeMessageExcluded) {
            this.showDegreeMessageCard = true;
          }
          if (this.degree.Degree.MessageType === 2) {
            this.checkIfFastTrackSchedulingOn();
          }

          this.loadDegreeCard(refresh);
        },
        (error) => {
          this.degree = {} as any;
          this.errorOnLoad.emit('DEGINFO');
          this.loadedChanged.emit(true);
          this.trackingService.trackEvent({
            view: this.isDegreePage ? 'App Home' : 'Degree Plan View',
            category: 'System Errors',
            action: 'ErrorCode : DEGINFO',
            label: 'Degree Page',
            value: '',
          });

          setTimeout(() => {
            if (this.subscriptions.degreeInfoDegPlan) {
              this.subscriptions.degreeInfoDegPlan.unsubscribe();
              delete this.subscriptions.degreeInfoDegPlan;
            }
          }, 0);
        }
      );
    }
  }
  private checkIfFastTrackSchedulingOn() {
    if (!this.subscriptions.fastTrackSchedulingOn) {
      this.subscriptions.fastTrackSchedulingOn = this.mobileService
        .settings()
        .pipe(first())
        .subscribe((settings: MobileSettings) => {
          const campusPointziSetting = settings.CampusSettings.find((o) => {
            return o.Campus && o.Campus.CampusId === this.globalConfigs.sycampusid;
          }, this);

          this.fastTrackSchedulingOn =
            campusPointziSetting.Settings.ShowFastTrackScheduling.toLowerCase() === 'true' ? true : false;
        });
    }
  }
}
