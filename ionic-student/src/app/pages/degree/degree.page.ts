import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { EnrollmentService } from 'src/app/data/services/enrollment.service';
import { MobileService } from 'src/app/data/services/mobile.service';
import {
  CourseInfo,
  Enrollment,
  EnrollmentClassesInfo,
  TransferPendingClass,
} from 'src/app/data/types/enrollment.type';
import { BasePageComponent } from 'src/app/shared/components/base-page-component/base-page.component';
import { DegreeCardComponent } from 'src/app/shared/components/degree-card/degree-card.component';
import { ThemeId } from 'src/app/shared/enums/theme-id.enum';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import { PecPopOverService } from 'src/app/shared/services/pec-popover.service';
import { TrackingService } from 'src/app/shared/services/tracking.service';
import { StorageService } from '../../shared/services/storage.service';
import { NoAssignmentPopoverComponent } from './components/no-assignment-popover/no-assignment-popover.component';

@Component({
  selector: 'pec-degree',
  templateUrl: './degree.page.html',
  styleUrls: ['./degree.page.scss'],
})
export class DegreePage extends BasePageComponent implements OnDestroy {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(DegreeCardComponent) degreeCard: DegreeCardComponent;

  public errorCodeMessage: string;
  public upcomingCourseList: Array<any>;
  public completedCourseList: Array<any>;
  public futureCourseList: Array<any>;
  public otherCourseList: Array<any>;
  public fastTrackActionMessage: string;
  public accelerateAssessmentActionMessage: string;
  public showLoading = true;
  public fastTrackState = false;
  public degreeLoaded: boolean;
  public transferCourses: TransferPendingClass;
  public showError = false;
  public state = false;
  public otherCourseState = false;
  public upcomingOrcomplete = 'upcoming';
  public fastTrackScheduledExamsList: Array<any>;
  public enrollment: Enrollment;
  public adEnrollId: number;
  public previousView: string;

  private terms: Array<number>;
  private classList: Array<CourseInfo>;
  private sourceSystemId: number;
  private noAssignmentMessagePopOVer: any;
  private refresher: any;
  private alert: any;
  private contactsModal: any;
  private messageModal: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public globalConfigs: GlobalConfigsService,
    private enrollmentService: EnrollmentService,
    public popoverService: PecPopOverService,
    private trackingService: TrackingService,
    private mobileService: MobileService,
    private storage: StorageService
  ) {
    super();

    this.route.queryParams.subscribe((params) => {
      if (params.displaytab !== undefined) {
        this.upcomingOrcomplete = params.displaytab;
        if (this.upcomingOrcomplete.toLowerCase() === 'completed') {
          this.upcomingOrcomplete = 'complete';
        }
      }
    });
  }

  public doRefresh(event) {
    this.clearSubscriptions();
    this.beginLoadData(true);
    setTimeout(() => {
      if (event) event.target.complete();
    }, 2000);
  }

  public clearSubscriptions() {
    super.clearSubscriptions();
    if (this.alert) {
      this.alert.dismiss();
      delete this.alert;
    }

    if (this.contactsModal) {
      this.contactsModal.dismiss();
      delete this.contactsModal;
    }
    if (this.messageModal) {
      this.messageModal.dismiss();
      delete this.messageModal;
    }

    if (this.noAssignmentMessagePopOVer) {
      this.noAssignmentMessagePopOVer.dismiss();
      delete this.noAssignmentMessagePopOVer;
    }
  }

  public get hasNoScheduledClassesToShow() {
    return (
      this.upcomingCourseList &&
      !this.upcomingCourseList.length &&
      this.futureCourseList &&
      !this.futureCourseList.length
    );
  }

  public get hasNoCompletedClassesForThisEnrollment() {
    return (
      this.completedCourseList &&
      !this.completedCourseList.length &&
      this.otherCourseList &&
      !this.otherCourseList.length
    );
  }

  public onFTExamScheduled(exam: any) {
    setTimeout(() => {
      if (this.subscriptions.degreeCourses) {
        this.subscriptions.degreeCourses.unsubscribe();
        delete this.subscriptions.degreeCourses;
      }
      this.loadFTExams(true, exam.CourseName);
    }, 500);
  }

  public toggleSection(i?) {
    this.upcomingCourseList[i].open = !this.upcomingCourseList[i].open;
  }

  public toggleCompletedSection(i) {
    this.completedCourseList[i].open = !this.completedCourseList[i].open;
  }

  public toggleFutureSection() {
    this.trackingService.trackEvent({
      view: 'Degree Plan View',
      category: 'Degree Plan View',
      action: this.state === false ? '	Tapped to Expand Courses ' : 'Tapped to Collapse Courses',
      label: 'Future',
      value: '',
    });
    this.state = !this.state;
  }

  public toggleFastTrackSection() {
    this.fastTrackState = !this.fastTrackState;
  }

  public toggleOtherCourseSection() {
    this.trackingService.trackEvent({
      view: 'Degree Plan View',
      category: 'Degree Plan View',
      action: this.otherCourseState === false ? '	Tapped to Expand Courses ' : 'Tapped to Collapse Courses',
      label: 'Other Credit',
      value: '',
    });
    this.otherCourseState = !this.otherCourseState;
  }

  public getHonorIconText(studentHonorsType: number, icon: boolean = true) {
    //TODO: Using a placeholder icon, until the actual icon is avaliable to use
    if (studentHonorsType === 4) {
      return icon ? 'honors' : "Dean's List";
    } else if (studentHonorsType === 1 || studentHonorsType === 2) {
      return icon ? 'honors' : "President's List";
    } else if (studentHonorsType === 6) {
      return icon ? 'honors' : "President's & Dean's List";
    }
  }

  public degreeCardLoadedChanged(loaded: boolean) {
    this.degreeLoaded = loaded;
    this.clearLoading();
  }

  public degreeCardLoadedError(error: string) {
    this.showError = true;
    this.errorCodeMessage = error;
    this.clearLoading();
  }

  public tapOnNotAccessibleFastTrackOrAccelerate(course: CourseInfo) {
    let displayHelpText = true;
    if (this.degreeCard.degree.Degree.MessageType) {
      if ((this.degreeCard.degree.Degree.MessageType & 2) > 0 || (this.degreeCard.degree.Degree.MessageType & 4) > 0) {
        displayHelpText = false;
      }
    }

    this.trackingService.trackEvent({
      category: 'Degree Plan View',
      action: this.globalConfigs.themeId === ThemeId.AIU ? 'Tapped Accelerate Icon' : 'Tapped FastTrack Icon',
      label: displayHelpText ? 'Actionable' : 'Not Actionable',
      value: '',
      courseId: course.AdcourseId,
    });
  }

  public accessGrades(myEvent, currentCourse) {
    if (currentCourse.NoAssignmentMessage) {
      this.popoverService.show({
        component: NoAssignmentPopoverComponent,
        componentProps: {
          noAssignmentMessage: currentCourse.NoAssignmentMessage,
        },
      });
      //TO DO << IS THIS NECESSARY? >>
      this.presentPopover(myEvent, currentCourse.NoAssignmentMessage);
    } else {
      this.trackingService.trackEvent({
        view: 'Degree Plan View',
        category: 'Degree Plan View',
        action: 'Tapped to Access Course',
        label: currentCourse.IsOrientation
          ? 'Orientation'
          : currentCourse.IsAccellerated && this.globalConfigs.themeId === 18
          ? 'Accelerate'
          : currentCourse.IsAccelerated && this.globalConfigs.themeId === 9
          ? 'Fast Track'
          : currentCourse.IsEarlyAccess
          ? 'Early Access'
          : currentCourse.IsCustomCourse
          ? 'Custom'
          : 'Standard',
        value: '',
      });

      this.router.navigate(['/tabs/degree/graded-assignments'], {
        queryParams: { tabSelect: '2', classId: currentCourse.LmsClassId, description: currentCourse.Description },
      });
    }
  }

  public upcomingOrcompleteChanged() {
    this.content.scrollToPoint(0, 0, 0);
  }

  protected beginLoadData(refresh?: boolean) {
    if (!this.subscriptions.campusSettings) {
      this.showLoading = true;

      this.mobileService
        .campusSettings()
        .pipe(first())
        .subscribe((settings) => {
          if (settings && settings.Campus) {
            this.sourceSystemId = settings.Campus.SourceSystemId;
          }
        });
    }

    const state = history.state;
    if (state && state.previousurl) {
      this.previousView = state.previousurl;
    } else {
      this.previousView = null;
    }

    this.loadEnrollment(refresh);
  }

  private classroomfilter(itemList: Array<any>): Array<any> {
    const result: Array<any> = [];
    const time: Array<any> = [];
    const building: Array<any> = [];
    const room: Array<any> = [];

    //your filter logic here
    if (itemList) {
      for (const item of itemList) {
        const buildingIndex = building.toString().indexOf(item.BuildingDescrip);
        const roomIndex = room.toString().indexOf(item.RoomNumber);
        const tmp: Array<any> = item.StartTimeFormattedString.split(',');
        const timeIndex = time.toString().indexOf(tmp[1].trim());
        if (buildingIndex === 0 && roomIndex === 0 && timeIndex === 0) {
          for (const resultItem of result) {
            if (item.RoomNumber === resultItem.RoomNumber && item.BuildingDescrip === resultItem.BuildingDescrip) {
              resultItem.StartTimeFormattedString =
                resultItem.StartTimeFormattedString + ' & ' + item.StartTimeFormattedString;
            }
          }
        } else {
          building.push(item.BuildingDescrip);
          room.push(item.RoomNumber);
          time.push(tmp[1].trim());
          result.push(item);
        }
      }
    }
    return result;
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
    if (this.showLoading && this.degreeLoaded && this.classList) {
      this.showLoading = false;
    }
    this.closeRefresher();
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
            this.loadFTExams(refresh);
          }
        }
      });
  }

  private loadFTExams(refresh: boolean, courseName: string = null) {
    if (!this.subscriptions.degreeCourses) {
      this.showLoading = true;
      this.subscriptions.degreeCourses = this.enrollmentService.list(refresh).subscribe(
        (list: EnrollmentClassesInfo) => {
          if (list) {
            this.fastTrackActionMessage = list.FastTrackActionMessage;
            this.accelerateAssessmentActionMessage = list.AccelerateAssessmentOpportunityActionMessage;
          }
          this.classList = list.ClassList;
          this.transferCourses = list.transferPendingClass;
          if (this.transferCourses?.TransferClassList?.length > 0) {
            this.storage.setItem('transferCourses', this.transferCourses, true);
          }
          this.classList.reverse();
          this.filterCourses();
          this.fastTrackScheduledExamsList = list.FastTrackScheduledExamsList
            ? list.FastTrackScheduledExamsList.sort(this.sortFTExamItem)
            : [];
          this.fastTrackScheduledExamsList.forEach((exam) => {
            const ftExamCouseIndex = this.classList.findIndex((item) => {
              return item.Description === exam.Description && exam.CourseCode.startsWith(item.CourseCode);
            });
            if (ftExamCouseIndex > -1) {
              exam.AdClassSchedId = this.classList[ftExamCouseIndex].AdClassSchedId;
            }
          });
          this.clearLoading();
          if (this.upcomingCourseList.length > 0) {
            this.upcomingCourseList.forEach((a) => {
              a.open = true;
            });
          } else {
            this.state = true;
          }
          if (this.completedCourseList.length > 0) {
            this.completedCourseList[0].open = true;
          } else {
            this.otherCourseState = true;
          }
          if (courseName) {
            this.scrollToScheduledFTCourse(courseName);
          }
        },
        (error) => {
          this.classList = [];
          this.showError = true;
          this.errorCodeMessage = 'DEGREECOURSESINFO';
          this.clearLoading();
          this.trackingService.trackEvent({
            view: 'Degree Plan View',
            category: 'System Errors',
            action: 'ErrorCode : DEGREECOURSESINFO',
            label: 'Degree Page',
            value: '',
          });
          setTimeout(() => {
            if (this.subscriptions.degreeCourses) {
              this.subscriptions.degreeCourses.unsubscribe();
              delete this.subscriptions.degreeCourses;
            }
          }, 0);
        }
      );
    }
  }

  private sortFTExamItem(a: any, b: any) {
    if (a.StartDate === b.StartDate) {
      return a.Description <= b.Description ? -1 : 1;
    }
    return a.StartDate <= b.StartDate ? -1 : 1;
  }

  private sortList(a: any, b: any) {
    if (a && !b) return -1;
    if (!a && b) return 1;

    if (a.StartDate && !b.StartDate) return -1;
    if (!a.StartDate && b.StartDate) return 1;

    const r = new Date(a.StartDate).getTime() - new Date(b.StartDate).getTime();
    if (r) return r;

    return 0;
  }

  private sortListByDesc(a: any, b: any) {
    if (a && !b) return -1;
    if (!a && b) return 1;

    const r = (a.Description || '').toLowerCase().localeCompare((b.Description || '').toLowerCase());
    if (r) return r;

    return 0;
  }

  private filterQuarters(classes: CourseInfo[]): CourseInfo[] {
    if (classes) {
      const list = new Array<CourseInfo>();
      const filteredList = classes.reduce((groups, item) => {
        const val = item.Term.AdTermId;
        groups[val] = groups[val] || [];
        if (!groups[val].Classes) {
          groups[val].Classes = Array<any>();
        }
        if (item) {
          if (item.Locations) {
            item.Locations = this.classroomfilter(item.Locations);
          }
          groups[val].AdTermId = item.Term.AdTermId;
          groups[val].Code = item.Term.Code;
          groups[val].Description = item.Term.Description;
          groups[val].StartDate = item.Term.StartDate;
          groups[val].EndDate = item.Term.EndDate;
          groups[val].StudentHonorsType = item.Term.StudentHonorsType;
          groups[val].Classes.push(item);
          return groups;
        }
      }, {});

      for (const termItem of this.terms) {
        const term = filteredList[termItem];
        if (term) {
          term.Classes.sort(this.sortListByDesc);
          list.push(term);
        }
      }
      return list;
    }
  }

  private filterCourses() {
    if (this.classList) {
      this.terms = Array.from<any>(new Set(this.classList.map((item: CourseInfo) => item.Term.AdTermId)));

      const completedlist = this.classList.filter((course) => (course.ScheduleType & 2) > 0);
      this.completedCourseList = this.filterQuarters(completedlist);
      this.completedCourseList.sort((a, b) => (a.StartDate >= b.StartDate ? -1 : 1));
      this.completedCourseList.sort((a, b) => (a.EndDate >= b.EndDate ? -1 : 1));

      const upcomingList = this.classList.filter(
        (course) => course.ScheduleType === 73 || course.ScheduleType === 129 || course.ScheduleType === 193
      );
      this.upcomingCourseList = this.filterQuarters(upcomingList);
      this.upcomingCourseList.sort((a, b) => (a.StartDate <= b.StartDate ? -1 : 1));

      const otherList = this.classList.filter((course) => course.Term.Code === 'Other Credit Sources');
      otherList.sort((a, b) => (a.Description <= b.Description ? -1 : 1));
      this.otherCourseList = otherList;

      const futurelist = this.classList.filter((course) => (course.ScheduleType & 4) > 0);
      this.futureCourseList = this.filterQuarters(futurelist);
      this.futureCourseList.sort(this.sortList);
      // this.futureCourseList.sort((a, b) => a.StartDate <= b.StartDate ? -1 : 1);
    }
  }

  private presentPopover(myEvent, noAssignmentMessage) {
    //TODO: part of launching grading assignment page
    // this.noAssignmentMessagePopOVer = this.popoverCtrl.create(
    //   DegreeAlert,
    //   {
    //     noAssignmentsMessage: noAssignmentMessage,
    //   },
    //   { cssClass: 'onHold-popover' }
    // );
    // this.noAssignmentMessagePopOVer.onDidDismiss((data: any, role: string) => {
    //   delete this.noAssignmentMessagePopOVer;
    // });
    // this.noAssignmentMessagePopOVer.present({
    //   ev: myEvent,
    // });
  }

  private scrollToScheduledFTCourse(courseName: string) {
    if (!this.fastTrackState) {
      this.fastTrackState = true;
    }
    setTimeout(() => {
      const element = document.getElementById(`ftcard-${courseName}`);
      if (element) {
        const scrollPosition = element.getBoundingClientRect().top;
        this.content.scrollToPoint(0, scrollPosition, 20);
      }
    }, 0);
  }
}
