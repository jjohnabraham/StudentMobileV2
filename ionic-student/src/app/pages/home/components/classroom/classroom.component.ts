import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { MobileService } from '../../../../data/services/mobile.service';
import { ActivatedRoute } from '@angular/router';
import { TrackingService } from '../../../../shared/services/tracking.service';
import { StorageService } from '../../../../shared/services/storage.service';
import { Class, ClassInfo, ClassLiveSession, ClassStatus, ClassSummary } from '../../../../data/types/class.type';
import {
  ClassroomFilterModalComponent,
  ClassroomView,
} from '../classroom-filter-modal/classroom-filter-modal.component';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { ClassService } from '../../../../data/services/class.service';
import { MeetingService } from '../../../../data/services/meeting.service';
import { UnitService } from '../../../../data/services/unit.service';
import { ZoomConcludedChats, ZoomRecording } from '../../../../data/types/meeting.type';
import { Unit } from '../../../../data/types/unit.type';
import { BasePageComponent } from '../../../../shared/components/base-page-component/base-page.component';
import { AssignmentService } from '../../../../data/services/assignment.service';
import { AssignmentSummary } from '../../../../data/types/assignment.type';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'pec-classroom',
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.scss'],
})
export class ClassroomComponent extends BasePageComponent implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  public classData: Class;
  public classId: number;
  public isOrientation = false;
  public isAccelerated = false;
  public isPilotedCourse = false;
  public visibleState = true;
  public showViewSelectIcon = false;
  public classRoomView: ClassroomView = 'unitview';
  public isStandardClass = true;
  public classStatus: ClassStatus;
  public zoomConcludedChatList: ZoomConcludedChats;
  public classSummary: ClassSummary;
  public unitsInfo: Unit[];
  public showError = false;
  public showLoading = true;
  public errorCodeMessage: string;
  public showOverview = true;
  public classInfo: ClassInfo;
  public assignmentList: any[];
  public visitedCourseOverview = false;
  public previousView = 'tabs/home';
  public isNewCustomCourse: boolean;

  private classroomFilterModal: HTMLIonModalElement;

  constructor(
    public globalConfigs: GlobalConfigsService,
    private mobileService: MobileService,
    private activatedRoute: ActivatedRoute,
    private modalCtrl: ModalController,
    private storage: StorageService,
    private trackingService: TrackingService,
    private classService: ClassService,
    private meetingService: MeetingService,
    private unitService: UnitService,
    private assignmentService: AssignmentService,
    private router: Router
  ) {
    super();
    this.classId = +this.activatedRoute.snapshot.params.classId;
    this.classData = this.activatedRoute.snapshot.params.class;
    if (
      this.activatedRoute.snapshot.queryParams.tabSelect &&
      this.activatedRoute.snapshot.queryParams.tabSelect === '2'
    ) {
      this.previousView = 'tabs/degree';
    }
    const state = router.getCurrentNavigation().extras.state;

    if (state && state.previousurl) {
      this.previousView = state.previousurl;
    }
  }

  public ngOnInit() {
    this.loadData(true);
  }

  public presentClassFilterModal() {
    this.modalCtrl
      .create({
        component: ClassroomFilterModalComponent,
        componentProps: {
          classId: this.classId,
          classroomView: this.classRoomView,
        },
        cssClass: 'classroom-filter-modal',
        backdropDismiss: true,
        mode: 'md',
      })
      .then((modal) => {
        this.classroomFilterModal = modal;

        this.classroomFilterModal.onDidDismiss().then((data) => {
          if (data.data) {
            switch (data.data.classView) {
              case 'unitview':
                this.classRoomView = 'unitview';
                this.trackingService.trackEvent({
                  category: 'Classroom View',
                  action: 'Tapped Class Display Toggle',
                  label: 'Unit View',
                  value: '',
                });
                break;
              case 'alllist':
                this.classRoomView = 'alllist';
                this.trackingService.trackEvent({
                  category: 'Classroom View',
                  action: 'Tapped Class Display Toggle',
                  label: 'List View',
                  value: '',
                });
                break;
              default:
                break;
            }
          }
        });

        this.classroomFilterModal.present();
      });
  }

  public trackContentScroll(ev) {
    const scrollTop = ev.detail.scrollTop;
    const vs = scrollTop <= 138;
    if (vs !== this.visibleState) {
      this.visibleState = scrollTop <= 138;
    }
  }

  public postVisitedCourseOverview(visited: boolean) {
    if (!this.visitedCourseOverview && visited) {
      this.visitedCourseOverview = true;
      this.classService.saveVisitedCourseOverview(this.classId).pipe(first()).subscribe();
    }
  }

  public doRefresh(event) {
    this.clearSubscriptions();
    this.loadData(true);
    setTimeout(() => {
      if (event) event.target.complete();
    }, 2000);
  }

  private getMobileSettings() {
    this.mobileService
      .settings()
      .pipe(first())
      .subscribe(
        (settingInfo) => {
          this.showViewSelectIcon = settingInfo.CampusSettings[0].Settings.AlternateClassViewIcon === 'true';
          this.getSelectListView();
        },
        () => this.apiError()
      );
  }

  private getClass(refresh?: boolean) {
    if (this.classId) {
      this.classService
        .classList('Current', refresh)
        .pipe(first())
        .subscribe(
          (classList) => {
            if (classList && classList.length) {
              this.classData = classList.find((o) => {
                return o.ClassId === this.classId;
              });
            }

            if (!this.classData) {
              this.apiError();
            } else {
              this.isOrientation = this.classData.IsOrientation;
              this.isAccelerated = this.classData.IsAccelerated;

              if (this.isStandardClass && this.isAccelerated) {
                this.showOverview = false;
              }
            }
          },
          () => this.apiError()
        );
    }
  }

  private getClassSettings() {
    this.classService
      .classSettings(this.classId)
      .pipe(first())
      .subscribe(
        (settings) => {
          if (settings && settings.Settings) {
            const classSettings = JSON.parse(settings.Settings);

            if (classSettings.visitedCourseOverview) {
              this.visitedCourseOverview = true;
            }
          }
        },
        (error) => {
          if (error?.response?.body === null) return;

          this.apiError();
        }
      );
  }

  private getZoomMeetings() {
    this.meetingService
      .zoomConcludedChats(this.classId)
      .pipe(first())
      .subscribe(
        (meeting) => {
          this.zoomConcludedChatList = meeting;

          if (this.classInfo) {
            this.getAssignments();
          }
        },
        (error) => {
          this.apiError();

          this.trackingService.trackEvent({
            view: 'Classroom View',
            category: 'Classroom View',
            action: '	Zoom API Error',
            label: error,
            value: '',
          });
        }
      );
  }

  private getClassSummary() {
    return new Promise((resolve, reject) => {
      this.classService
        .summary(this.classId)
        .pipe(first())
        .subscribe(
          (classInfo) => {
            this.classSummary = classInfo;

            resolve(true);
          },
          () => {
            this.apiError();

            reject();
          }
        );
    });
  }

  private getClassInfo() {
    return new Promise((resolve, reject) => {
      this.classService
        .info(this.classId)
        .pipe(first())
        .subscribe(
          (classInfo) => {
            this.classInfo = classInfo;

            resolve(true);
          },
          () => {
            this.apiError();

            reject();
          }
        );
    });
  }

  private getUnitsInfo() {
    this.unitService
      .list(this.classId)
      .pipe(first())
      .subscribe(
        (unitsInfo) => {
          unitsInfo.forEach((u) => (u.HasAssignments = null));

          this.unitsInfo = unitsInfo;

          if (!(this.unitsInfo && this.unitsInfo.length)) {
            //if we can't get Unit Info, lets give up because we won't have anything to show
            this.apiError();
          }

          this.clearLoading();
        },
        () => {
          this.apiError();

          this.clearLoading();
        }
      );
  }

  private getAssignments() {
    this.assignmentService
      .summaryList(this.classId)
      .pipe(first())
      .subscribe(
        (assignmentList) => {
          this.assignmentList = this.groupAssignmentsAndMeetings(
            assignmentList,
            this.classInfo.LiveSessionList,
            this.zoomConcludedChatList?.Recordings || []
          );
        },
        () => this.apiError()
      );
  }

  private loadData(refresh?: boolean) {
    this.showLoading = true;

    this.classService
      .status(this.classId, false, 0, 0)
      .pipe(first())
      .subscribe((classStatus) => {
        this.classStatus = classStatus;
        this.isPilotedCourse = this.classStatus.HadronV3;
        this.getZoomMeetings();
        if (classStatus && classStatus.HasAccess) {
          combineLatest([this.getClassInfo(), this.getClassSummary()])
            .pipe(first())
            .subscribe(() => {
              this.isNewCustomCourse = this.classInfo.IsCustomCourse && this.classInfo.UnitList.length > 1;
              this.isStandardClass = classStatus.IsStandard || this.isNewCustomCourse;

              this.getClass(refresh);
              this.getMobileSettings();
              this.getClassSettings();
              this.getZoomMeetings();
              this.getUnitsInfo();
            });
        }
      });
  }

  private getSelectListView() {
    if (!this.subscriptions.classroomView) {
      this.subscriptions.classroomView = this.storage
        .getItem(this.classId + 'classroomview')
        .subscribe((value: ClassroomView) => {
          if (value) {
            this.classRoomView =
              value === 'alllist' && this.showViewSelectIcon && this.isStandardClass ? 'alllist' : 'unitview';
          } else {
            this.classRoomView = 'unitview';
          }
        });
    }
  }

  private groupAssignmentsAndMeetings(
    assignmentList: AssignmentSummary[],
    liveSessionList: ClassLiveSession[],
    zoomConcludedChatsList: ZoomRecording[]
  ) {
    const list = [];
    if (liveSessionList && liveSessionList.length) {
      liveSessionList.map((o) => {
        o.IsAssignment = false;
        o.IsArchive = false;

        if (!o.HideMeetingForStudent) {
          list.push(o);
        }
      });
    }

    if (zoomConcludedChatsList && zoomConcludedChatsList.length) {
      zoomConcludedChatsList.map((o) => {
        o.IsAssignment = false;
        o.IsArchive = true;

        list.push(o);
      });
    }

    if (assignmentList && assignmentList.length) {
      assignmentList.map((o) => {
        o.IsAssignment = true;
        list.push(o);
      });
    }

    return list.sort(this.sortList);
  }

  private sortList(a, b) {
    if (a && !b) return -1;
    if (!a && b) return 1;
    if (!a && !b) return 0;

    const dateA = a.DueDate || a.StartDateTime;
    const dateB = b.DueDate || b.StartDateTime;

    if (dateA && !dateB) return -1;
    if (!dateA && dateB) return 1;

    let r = 0;

    if (dateA && dateB) {
      r = new Date(dateA).getTime() - new Date(dateB).getTime();
    }

    if (r) return r;

    r = (a.AssignmentName || '').toLowerCase().localeCompare((b.AssignmentName || '').toLowerCase());

    if (r) return r;

    return 0;
  }

  private clearLoading() {
    if (
      this.showLoading &&
      this.classStatus &&
      ((this.classSummary && this.unitsInfo) || this.classInfo) &&
      this.classData
    ) {
      this.showLoading = false;
    }
  }

  private apiError() {
    this.showError = true;
    this.showLoading = false;
  }
}
