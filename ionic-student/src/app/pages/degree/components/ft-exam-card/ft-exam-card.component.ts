import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ClassService } from 'src/app/data/services/class.service';
import { ClassHoldProps, ExamService } from '../../../home/services/exam.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { PecDatePipe } from 'src/app/shared/pipes/date.pipe';
import { CoursePolicyService } from 'src/app/shared/services/course-policy.service';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import { TrackingService } from 'src/app/shared/services/tracking.service';

@Component({
  selector: 'pec-ft-exam-card',
  templateUrl: './ft-exam-card.component.html',
  styleUrls: ['./ft-exam-card.component.scss'],
})
export class FtExamCardComponent extends BaseComponent implements OnDestroy {
  @Input() exam: any;
  class: any;
  isClicked = false;
  // classroomPage = ClassroomPage;
  // holdPopover: Popover;

  constructor(
    private classService: ClassService,
    private globalConfigs: GlobalConfigsService,
    private trackingService: TrackingService,
    private coursePolicyService: CoursePolicyService,
    public popoverCtrl: PopoverController,
    private datePipe: PecDatePipe,
    private examService: ExamService,
    private router: Router
  ) {
    super();
  }

  mapClass(course: any) {
    this.class = {};
    this.class.Credits = course.CreditsPossible;
    this.class.CourseName = course.Description;
    this.class.EndDate = course.EndDate;
    this.class.IsAccelerateAssessmentOpportunityEligibleClass = course.IsAccelerateAssessmentOpportunityEligibleClass;
    this.class.IsFastTrackEligibleClass = course.IsFastTrackEligibleClass;
    this.class.ClassId = course.LmsClassId;
    this.class.Locations = course.Locations;
    this.class.StartDate = course.StartDate;
    this.class.CourseCode = course.CourseCode;
    this.class.TermCode = course.Term.Code;
    this.class.AdcourseId = course.AdcourseId;
    this.class.AdClassSchedId = course.AdClassSchedId;
    if (!this.class.Section && !this.class.CourseSection) {
      this.class.Section = course.Section ? course.Section : course.CourseSection;
    }
    this.class.ShowLDA = course.ShowLDA;
    this.class.LastDateOfAttendance = course.LastDateOfAttendance;

    this.class = course;
  }

  ngOnDestroy() {
    if (this.coursePolicyService.policyModal) {
      this.coursePolicyService.policyModal.dismiss();
      delete this.coursePolicyService.policyModal;
    }
    this.clearSubscriptions();
  }

  public clearSubscriptions() {
    super.clearSubscriptions();

    // if (this.holdPopover) {
    //   this.holdPopover.dismiss();
    //   delete this.holdPopover;
    // }
  }

  accessClass(myEvent) {
    const isFTExamStarted = new Date(this.exam.StartDate) <= new Date();
    if (!isFTExamStarted) {
      let startDate;
      let endDate;
      this.datePipe
        .transform(this.exam.StartDate, 'MMMM d, yyyy')
        .pipe(first())
        .subscribe((date) => {
          startDate = date;
        });
      this.datePipe
        .transform(this.exam.Enddate, 'MMMM d, yyyy')
        .pipe(first())
        .subscribe((date) => {
          endDate = date;
        });
      const hold: ClassHoldProps = {
        Title: 'Exam Not Available Yet',
        Message:
          'Your Fast Track exam will be available from ' +
          startDate +
          ' through ' +
          endDate +
          '. Please contact your Success Coach with any questions.',
      };

      this.presentPopover(hold);
    } else {
      this.classService
        .classList('Current', true)
        .pipe(first())
        .subscribe((list) => {
          const ftExamCouseIndex = list.findIndex((item) => {
            return item.CourseName === this.exam.Description && this.exam.CourseCode === item.CourseCode;
          });
          this.class = ftExamCouseIndex > -1 ? list[ftExamCouseIndex] : null;
          if (!this.class) {
            this.class = { AdClassSchedId: this.exam.AdClassSchedId };
          }
          this.classService
            .status(this.class.ClassId, false, this.globalConfigs.ssid, this.class.AdClassSchedId)
            .pipe(first())
            .subscribe((classStatus) => {
              if (classStatus) {
                if (classStatus.HasAccess) {
                  const viewName = 'Degree Plan View';
                  this.trackingService.trackEvent({
                    view: viewName,
                    category: viewName,
                    action: 'Tapped to Access Course',
                    label: this.class.IsOrientation
                      ? 'Orientation'
                      : this.class.IsAccelerated && this.globalConfigs.themeId === 18
                      ? 'Accelerate'
                      : this.class.IsAccelerated && this.globalConfigs.themeId === 9
                      ? 'Fast Track'
                      : this.class.IsCustomCourse
                      ? 'Custom'
                      : 'Standard',
                    value: '',
                    classId: this.class.ClassId,
                  });

                  if (classStatus.ShowPolicy) {
                    this.coursePolicyService
                      .showPolicyModal(this.class.ClassId, classStatus)
                      .then((isAccept: boolean) => {
                        if (isAccept) {
                          this.router.navigate(['/tabs/home/classroom/' + this.class.ClassId]);
                        }
                      });
                  } else {
                    this.router.navigate(['/tabs/home/classroom/' + this.class.ClassId]);
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
        });
    }
  }

  private presentPopover(classHoldProps: ClassHoldProps) {
    this.examService.presentPopover(classHoldProps);
  }
}
