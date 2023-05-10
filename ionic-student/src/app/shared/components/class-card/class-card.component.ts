import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnDestroy, OnInit, Output } from '@angular/core';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { formatPercent } from '@angular/common';
import { first } from 'rxjs/operators';
import { ThemeId } from '../../enums/theme-id.enum';
import { BaseComponent } from '../base-component/base.component';
import { EnrollmentService } from '../../../data/services/enrollment.service';
import { UserService } from '../../../data/services/user.service';
import { CourseInfo, FastTrackInfo, NextAvailableDate } from '../../../data/types/enrollment.type';
import { ClassHoldProps, ExamService } from '../../../pages/home/services/exam.service';
import { TrackingService } from '../../services/tracking.service';
import { ClassService } from '../../../data/services/class.service';
import { ScheduleFastTrackExamModalComponent } from '../schedule-fast-track-exam-modal/schedule-fast-track-exam-modal.component';
import { PecDatePipe } from '../../pipes/date.pipe';
import { Class, ClassStatus } from '../../../data/types/class.type';
import { GlobalConfigsService } from '../../services/global-configs.service';
import { MobileService } from '../../../data/services/mobile.service';
import { CoursePolicyService } from '../../services/course-policy.service';
import { ChallengeExamService } from '../../services/challenge-exam.service';
import { InfoPopoverComponent } from '../info-popover/info-popover.component';
import { PecPopOverService } from '../../services/pec-popover.service';

@Component({
  selector: 'pec-class-card',
  templateUrl: './class-card.component.html',
  styleUrls: ['./class-card.component.scss'],
})
export class ClassCardComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() classInfo: Class;
  @Input() course: CourseInfo;
  @Input() isHomePage = false;
  @Input() isDegreePage = false;
  @Input() accessGradesOnClick = false;
  @Input() showContactAndGrades = false;
  @Input() isClassroomPage = false;
  @Input() isFutureCourse = false;
  @Input() isCompletedCourse = false;
  @Input() isOtherCourse = false;
  @Output() accessGrades = new EventEmitter<void>();
  @Output() examScheduled = new EventEmitter<Class>();
  @Output() tapOnNotAccessibleFastTrackOrAccelerate = new EventEmitter<void>();

  public fastTrackSchedulingOn: boolean;
  public cardHeader: string;
  public currentYear = new Date().getFullYear();
  public classStatus: ClassStatus;
  public isCtu: boolean;
  public gradeValue: string;
  public gradeLetterSmall = false;
  public gradeLetter: string;
  public pageTrackTitle: string;

  private scheduleFastTrackExamModal: HTMLIonModalElement;
  private loading: HTMLIonLoadingElement;
  private tabSelect = 1;

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    public globalConfigs: GlobalConfigsService,
    private classService: ClassService,
    private modalCtrl: ModalController,
    private trackingService: TrackingService,
    private mobileService: MobileService,
    private coursePolicyService: CoursePolicyService,
    private challengeExamService: ChallengeExamService,
    private enrollmentService: EnrollmentService,
    private userService: UserService,
    private examService: ExamService,
    private datePipe: PecDatePipe,
    private loadingCtrl: LoadingController,
    public popoverService: PecPopOverService,
    private navCtrl: NavController,
    private router: Router
  ) {
    super();

    this.isCtu = globalConfigs.themeId === ThemeId.CTU;
  }

  public ngOnDestroy() {
    if (this.coursePolicyService.policyModal) {
      this.coursePolicyService.policyModal.dismiss().then(() => delete this.coursePolicyService.policyModal);
    }

    if (this.loading) {
      this.loading.dismiss();
      delete this.loading;
    }

    this.clearSubscriptions();
  }

  public ngOnInit() {
    this.loadData();
  }

  public get showAccelerateOrFastTrackIcon() {
    return this.course.IsFastTrackEligibleClass || this.course.IsAccelerateAssessmentOpportunityEligibleClass;
  }

  public beginPresentScheduleFastTrackExamModal() {
    if (this.globalConfigs.themeId === ThemeId.AIU || !this.fastTrackSchedulingOn) {
      this.tapOnNotAccessibleFastTrackOrAccelerate.emit();
      this.accessClass();
    } else {
      this.showScheduleFastTrackExamModal();
    }
  }

  public accessClass() {
    if (this.isOtherCourse) {
      return;
    }
    if (this.isFutureCourse) {
      const hold: ClassHoldProps = {
        Title: 'Future Class Not Accessible',
        Message: "This class hasn't started yet! Please try again on or after the class start date.",
      };

      this.presentPopover(hold);
    } else {
      let coursePolicyAgree: boolean;
      const adClassSchedId = this.course?.AdClassSchedId || 0;

      if (this.classInfo.IsBypassClassroom) {
        if (this.classInfo.IsAccelerated && this.globalConfigs.themeId === ThemeId.AIU) {
          this.trackClassAccess();
          this.challengeExamService.showExamModal(this.classInfo);
        }
      } else {
        this.classService
          .status(this.classInfo.ClassId, false, this.globalConfigs.ssid, adClassSchedId)
          .pipe(first())
          .subscribe((classStatus) => {
            if (classStatus) {
              if (classStatus.HasAccess) {
                this.trackClassAccess();

                if (classStatus.ShowPolicy) {
                  this.coursePolicyService
                    .showPolicyModal(this.classInfo.ClassId, classStatus)
                    .then((isAccept: boolean) => {
                      if (isAccept) {
                        this.navCtrl.navigateForward(['/tabs/home/classroom/' + this.classInfo.ClassId], {
                          queryParams: { tabSelect: this.tabSelect },
                        });
                      }
                    });
                } else {
                  this.navCtrl.navigateForward(['/tabs/home/classroom/' + this.classInfo.ClassId], {
                    queryParams: { tabSelect: this.tabSelect },
                  });
                }
              } else {
                const hold: ClassHoldProps = {
                  Title: 'Class Not Accessible',
                  Message: classStatus.Message,
                };
                this.presentPopover(hold);
              }
            }
          });
      }
    }
  }

  private trackClassAccess() {
    this.trackingService.trackEvent({
      view: this.pageTrackTitle,
      category: this.pageTrackTitle,
      action: 'Tapped to Access Course',
      label: this.classInfo.IsOrientation
        ? 'Orientation'
        : this.classInfo.IsAccelerated && this.globalConfigs.themeId === ThemeId.AIU
        ? 'Accelerate'
        : this.classInfo.IsAccelerated && this.globalConfigs.themeId === ThemeId.CTU
        ? 'Fast Track'
        : this.classInfo.IsCustomCourse
        ? 'Custom'
        : 'Standard',
      value: '',
      classId: this.classInfo.ClassId,
    });
  }

  private showScheduleFastTrackExamModal(selectedDate: NextAvailableDate = null) {
    this.showLoadingModal();

    this.trackingService.trackEvent({
      view: 'Degree Plan View',
      category: 'Degree Plan View',
      action: 'Tapped FastTrack Icon',
      label: 'Actionable',
      value: '',
    });

    this.userService
      .info()
      .pipe(first())
      .subscribe(
        (user) => {
          const ssid = this.globalConfigs.ssid;
          const syCampusId = this.globalConfigs.sycampusid;
          const termCode = this.classInfo.TermCode;
          const courseCode = this.classInfo.CourseCode;
          const syStudentId = user.CVueUserId;

          this.enrollmentService
            .getFastTrackDates(syStudentId, ssid, syCampusId, courseCode, termCode)
            .pipe(first())
            .subscribe(
              (fastTrackInfo) => {
                this.hideLoadingModal();

                if (
                  !fastTrackInfo ||
                  !fastTrackInfo.IsSuccess ||
                  fastTrackInfo.NextAvailableDates == null ||
                  fastTrackInfo.NextAvailableDates.length === 0
                ) {
                  if (fastTrackInfo && fastTrackInfo.ResultCode === 9) {
                    this.presentScheduleFastTrackExamModal(syStudentId, fastTrackInfo, selectedDate);
                  } else {
                    if (fastTrackInfo && fastTrackInfo.ResultCode === 1) {
                      this.datePipe
                        .transform(fastTrackInfo.Message, 'MMMM d, yyyy')
                        .pipe(first())
                        .subscribe((date) => {
                          this.onScheduleFastTrackExamModalError(fastTrackInfo ? fastTrackInfo.ResultCode : null, date);
                        });
                    } else {
                      this.onScheduleFastTrackExamModalError(fastTrackInfo ? fastTrackInfo.ResultCode : null, null);
                    }
                  }
                } else {
                  this.presentScheduleFastTrackExamModal(syStudentId, fastTrackInfo, selectedDate);
                }
              },
              () => {
                this.presentScheduleFastTrackExamModal(syStudentId, null);

                this.hideLoadingModal();
              }
            );
        },
        () => {
          this.hideLoadingModal();
        }
      );
  }

  private loadData() {
    this.pageTrackTitle = 'App Home';

    if (this.isDegreePage) {
      this.pageTrackTitle = 'Degree Plan View';
    } else if (this.isClassroomPage) {
      this.pageTrackTitle = 'Classroom View';
    }

    // If coming from the degree page, map course to class
    if (!this.classInfo && this.course) {
      this.mapCourseToClass();
    } else {
      this.classInfo.StartDate = new Date(this.classInfo.StartDate);
      this.classInfo.EndDate = new Date(this.classInfo.EndDate);
    }

    if (this.isFutureCourse) {
      this.checkIfFastTrackSchedulingOn();
    }

    this.getCardHeader();
    this.setGradeVal();
    this.setGradeLetter();

    if (this.router.url.indexOf('degree') > 0) {
      this.tabSelect = 2;
    }
  }

  private mapCourseToClass() {
    this.classInfo = {
      Credits: this.course.CreditsPossible,
      CourseName: this.course.Description,
      EndDate: new Date(this.course.EndDate),
      ClassId: this.course.LmsClassId,
      Locations: this.course.Locations,
      StartDate: this.course.StartDate ? new Date(this.course.StartDate) : null,
      CourseCode: this.course.CourseCode,
      TermCode: this.course.Term.Code,
      CourseSection: this.course.Section,
      PrimaryInstructor: this.course.InstructorName,
      PrimaryInstructorEmail: this.course.InstructorEmail,
      PrimaryInstructorIsActive: this.course.InstructorIsActive,
      PrimaryInstructorIsPlaceHolder: this.course.InstructorIsPlaceHolder,
      CurrentGradeLetter: this.course.LetterGrade,
      CurrentGradePercentage: this.course.NumericGrade,
      NumOfGradedAssignments: 1, //TODO: only setting this shows the grade percentage, maybe another flag needed
      StaffId: this.course.InstructorSyStaffId,
      SourceSystemId: this.course.SourceSystemId,
    } as Class;
    this.checkIfFastTrackSchedulingOn();
  }

  private getCardHeader() {
    if (
      this.isHomePage &&
      !this.classInfo.IsOrientation &&
      !this.classInfo.IsAccelerated &&
      !this.classInfo.IsEarlyAccess &&
      this.classInfo.IsCurrent &&
      this.classInfo.DaysLeft < 14 &&
      this.classInfo.DaysLeft !== 0
    ) {
      this.cardHeader =
        this.classInfo.DaysLeft > 1
          ? `${this.classInfo.DaysLeft} days Left in Class`
          : `${this.classInfo.DaysLeft} day Left in Class`;
    } else if (this.isHomePage && this.classInfo.IsOrientation) {
      this.cardHeader = 'ORIENTATION';
    } else if (this.isHomePage && this.classInfo.IsAccelerated) {
      if (this.globalConfigs.themeId === ThemeId.AIU) {
        this.cardHeader = 'ACCELERATE';
      } else {
        this.cardHeader = 'FAST TRACK';
      }
    } else if (this.isHomePage && this.classInfo.IsEarlyAccess) {
      this.cardHeader = 'EARLY ACCESS';
    }
  }

  private checkIfFastTrackSchedulingOn() {
    if (this.course?.IsFastTrackEligibleClass) {
      this.mobileService
        .settings()
        .pipe(first())
        .subscribe((settings) => {
          const campusPointziSetting = settings.CampusSettings.find((o) => {
            return o.Campus && o.Campus.CampusId === this.globalConfigs.sycampusid;
          }, this);

          this.fastTrackSchedulingOn = campusPointziSetting.Settings.ShowFastTrackScheduling.toLowerCase() === 'true';
        });
    }
  }

  private presentScheduleFastTrackExamModal(
    syStudentId: number,
    datesResponse: FastTrackInfo,
    selectedDate: NextAvailableDate = null
  ) {
    this.modalCtrl
      .create({
        component: ScheduleFastTrackExamModalComponent,
        componentProps: {
          syStudentId,
          ssid: this.globalConfigs.ssid,
          syCampusId: this.globalConfigs.sycampusid,
          termCode: this.classInfo.TermCode,
          courseCode: this.classInfo.CourseCode,
          dateResponse: datesResponse,
          selectedDate,
          showError: false,
          error: '',
        },
        cssClass: 'contacts-modal',
      })
      .then((modal) => {
        this.scheduleFastTrackExamModal = modal;

        this.scheduleFastTrackExamModal.onDidDismiss().then((data) => {
          if (data) {
            selectedDate = data.data.selectedDate;
            if (data.data.retry) {
              this.showScheduleFastTrackExamModal(selectedDate);
            } else {
              this.onScheduleFastTrackExamModalError(data.data.code, data.data.params);
            }
          }
        });

        this.scheduleFastTrackExamModal.present();
      });
  }

  private onScheduleFastTrackExamModalError(code: number, date: string = null) {
    let isSuccess = false;
    const hold: ClassHoldProps = {
      Title: 'Sorry!',
      Message:
        "We're having technical difficulties and could not schedule your exam. Please try again. If this problem persists, please contact tech support at <br/><a href='tel:8477838937'>847-783-8937</a>.",
    };

    if (code) {
      if (this.globalConfigs.themeId === ThemeId.CTU) {
        switch (code) {
          case 1: //AlreadyScheduled = 1
            hold.Title = 'Fast Track Exam Already Scheduled';
            hold.Message = `You have already scheduled an exam for this course on ${date}. If you have any questions or wish to make changes, please contact your Success Coach.`;
            break;
          case 2: //FailedExam = 2
            hold.Title = 'Exam Cannot Be Scheduled';
            hold.Message = 'You have already attempted this exam. Please contact your Success Coach with questions.';
            break;
          case 3: //TermTooSoon = 3
            hold.Title = 'Exam Cannot Be Scheduled';
            hold.Message = 'This course is scheduled to begin soon. Please contact your Success Coach with questions.';
            break;
          case 5: //NoPreReq = 5
            hold.Title = 'Exam Cannot Be Scheduled';
            hold.Message =
              'This course has a prerequisite that must be completed prior to taking the Fast Track exam. Please contact your Success Coach with questions.';
            break;
          case 6: //NoResidency = 6
            hold.Title = 'Exam Cannot Be Scheduled';
            hold.Message =
              'You have reached the limit for the number of Fast Track exams that can be taken in your degree program. Please contact your Success Coach with questions.';
            break;
          case 7: //NoExams = 7,
            hold.Title = 'Exam Cannot Be Scheduled';
            hold.Message =
              'There are currently no available exam dates for this course. Please contact your Success Coach with questions.';
            break;
          case 8: //ExamScheduled  = 8,
            isSuccess = true;
            hold.Title = 'Fast Track Exam Scheduled';
            hold.Message = `You have successfully scheduled your exam for this course on ${date}. If you have any questions, please contact your Success Coach.`;
            break;
          case 10: //The Student may not meet SAP
            hold.Title = 'Exam Cannot Be Scheduled';
            hold.Message = 'You may not be eligible for this exam. Please reach out to your Success Coach.';
            break;
        }
      } else {
        switch (code) {
          case 1: //AlreadyScheduled = 1
            hold.Title = 'Fast Track Exam Already Scheduled';
            hold.Message = `You have already scheduled an exam for this course on ${date}. If you have any questions or wish to make changes, please contact your Success Coach.`;
            break;
          case 2: //FailedExam = 2
          case 3: //TermTooSoon = 3
          case 5: //NoPreReq = 5
          case 6: //NoResidency = 6
          case 10: //SAP not fulfilled = 10
          case 7: //NoExams = 7,
            hold.Title = 'Exam Cannot Be Scheduled';
            hold.Message =
              'Your exam cannot be scheduled at this time. Please contact your Success Coach with any questions.';
            break;
          case 8: //ExamScheduled  = 8,
            isSuccess = true;
            hold.Title = 'Fast Track Exam Scheduled';
            hold.Message = `You have successfully scheduled your exam for this course on ${date}. If you have any questions, please contact your Success Coach.`;
            break;
        }
      }
    }

    this.trackFTError(code);
    this.popoverService
      .show({
        component: InfoPopoverComponent,
        componentProps: {
          ...hold,
        },
        cssClass: 'fast-track-error',
      })
      .then(() => {
        if (isSuccess) {
          this.examScheduled.emit(this.classInfo);
        }
      });
  }

  private trackFTError(code: number) {
    let eventLabel = 'Error encountered';
    switch (code) {
      case 1: //AlreadyScheduled = 1
        eventLabel = 'Exam already scheduled';
        break;
      case 2: //FailedExam = 2
        eventLabel = 'Already attempted and failed';
        break;
      case 3: //TermTooSoon = 3
        eventLabel = 'Course Starting within 14 days';
        break;
      case 5: //NoPreReq = 5
        eventLabel = 'Prereqs not fulfilled';
        break;
      case 6: //NoResidency = 6
        eventLabel = 'Residency not met';
        break;
      case 10: //SAP not fulfilled = 10
        eventLabel = 'May not meet SAP';
        break;
      case 7: //NoExams = 7,
        eventLabel = 'No Exams Available';
        break;
      case 8: //ExamScheduled  = 8,
        eventLabel = 'Exam successfully scheduled';
        break;
    }
    this.trackingService.trackEvent({
      view: 'Degree Plan View',
      category: 'Degree Plan View',
      action: 'Tapped FastTrack Icon',
      label: eventLabel,
      value: '',
    });
  }

  private setGradeLetter() {
    if (this.classInfo.HasGradeMaskedAssignment) {
      this.gradeLetterSmall = true;
      this.gradeLetter = 'N/A';
    } else if (
      !this.classInfo.HasGradeMaskedAssignment &&
      this.classInfo.CurrentGradeLetter &&
      !this.classInfo.FinalGradeLetter
    ) {
      this.gradeLetterSmall = this.classInfo.CurrentGradeLetter === 'n/a';
      this.gradeLetter = this.classInfo.CurrentGradeLetter.toUpperCase();
    } else if (
      (!this.classInfo.HasGradeMaskedAssignment && this.classInfo.FinalGradeLetter === 'INC') ||
      this.classInfo.FinalGradeLetter === 'I' ||
      this.classInfo.FinalGradeLetter === 'P'
    ) {
      this.gradeLetterSmall = false;
      this.gradeLetter = this.classInfo.FinalGradeLetter.toUpperCase();
    }
  }

  private setGradeVal() {
    if (!this.isOtherCourse) {
      if (
        (this.classInfo.NumOfGradedAssignments > 0 && !this.classInfo.FinalGradeLetter) ||
        this.classInfo.FinalGradeLetter === 'P' ||
        this.classInfo.FinalGradeLetter === 'INC' ||
        this.classInfo.FinalGradeLetter === 'I'
      ) {
        if (!this.classInfo.CurrentGradePercentage && this.classInfo.CurrentGradeLetter !== 'n/a') {
          this.gradeValue = '--';
        } else {
          this.gradeValue = formatPercent(
            this.cutoffDigits(this.classInfo.CurrentGradePercentage) / 100,
            this.locale,
            '1.0-1'
          );
        }
      } else if (
        this.classInfo.NumOfGradedAssignments === 0 &&
        !(
          this.classInfo.FinalGradeLetter === 'P' ||
          this.classInfo.FinalGradeLetter === 'INC' ||
          this.classInfo.FinalGradeLetter === 'I'
        )
      ) {
        this.gradeValue = '--';
      }
    } else {
      this.gradeValue = 'N/A';
    }
  }

  private showLoadingModal() {
    if (this.loading) {
      return;
    }

    this.loadingCtrl
      .create({
        message: 'Please wait...',
      })
      .then((loading) => {
        this.loading = loading;
        this.loading.present();
      });
  }

  private hideLoadingModal() {
    if (this.loading) {
      this.loading.dismiss().then(() => delete this.loading);
    }
  }

  private presentPopover(classHoldProps: ClassHoldProps) {
    this.examService.presentPopover(classHoldProps);
  }

  private cutoffDigits(value: number, digits?: number) {
    if (value) {
      if (!digits) {
        digits = 1;
      }

      let cutoffIndex = value.toString().indexOf('.');
      if (cutoffIndex > 0) {
        if (digits > 0) cutoffIndex = cutoffIndex + digits + 1;
        return +value.toString().substring(0, cutoffIndex);
      }
    }

    return value;
  }
}
