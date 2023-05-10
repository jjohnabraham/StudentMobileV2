import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonItemSliding, Platform, PopoverController } from '@ionic/angular';
import * as moment from 'moment-timezone';
import { first } from 'rxjs/operators';
import { AssignmentService } from 'src/app/data/services/assignment.service';
import { ClassService } from 'src/app/data/services/class.service';
import { Meeting, MeetingService } from 'src/app/data/services/meeting.service';
import { MobileService } from 'src/app/data/services/mobile.service';
import { SchoolService } from 'src/app/data/services/school.service';
import { UserService } from 'src/app/data/services/user.service';
import { ExamService } from 'src/app/pages/home/services/exam.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import { GaEvent, TrackingService } from 'src/app/shared/services/tracking.service';
import { PecLoaderService } from 'src/app/shared/services/pec-loader.service';
import { AssignmentIconsService } from 'src/app/shared/services/assignment-icons.service';
import { PecZoomService } from 'src/app/shared/services/zoom.service';
import { AssignmentPart, ClassAssignment } from 'src/app/data/types/assignment.type';
import { ClassSummary } from 'src/app/data/types/class.type';
import { ActivatedRoute, Router } from '@angular/router';
import { Unit } from '../../../data/types/unit.type';
import { ThemeId } from '../../enums/theme-id.enum';

@Component({
  selector: 'pec-assignment-card',
  templateUrl: './assignment-card.component.html',
  styleUrls: ['./assignment-card.component.scss'],
})
export class AssignmentCardComponent extends BaseComponent implements OnInit {
  @ViewChild(IonItemSliding) ionSlidingItem: IonItemSliding;
  @Input() assignment: ClassAssignmentViewModel;
  @Input() classInfo: ClassSummary;
  @Input() courseCode: string;
  @Input() isOrientation: boolean;
  @Input() isCustom: boolean;
  @Input() isNewCustomCourse: boolean;
  @Input() assignmentPart: AssignmentPart;
  @Input() unit: Unit;
  @Input() isCTU: boolean;

  public timeZoneCode: string;
  public launchMeeting = false;
  public meetingEnded = false;
  public afterLiveStart = false;
  public beforeLiveEnd = false;
  public isAssignmentDismissed = false;
  public startDateTimeChat: any;
  public assignmentActions: Array<AssignmentAction>;
  public gradeMasked = false;
  public isHybrid: boolean;

  private iconName: string;
  private assignmentDetailUrl: string;
  private eventLabel: string;
  private isStandard = true;
  private assignmentFeatureId: any;
  private assignmentFeatureUrl: any;
  private monitored = false;
  private encodedTrackingUrl: string;
  private tabSelect = 1;

  private zone = {
    online: 'US/Central',
    huston: 'US/Central',
    atlanta: 'US/Eastern',
    colorado: 'US/Mountain',
  };

  constructor(
    private classService: ClassService,
    private userService: UserService,
    private meetingService: MeetingService,
    private schoolService: SchoolService,
    private mobileService: MobileService,
    private assignmentService: AssignmentService,
    public globalConfigs: GlobalConfigsService,
    public platform: Platform,
    public popoverCtrl: PopoverController,
    private trackingService: TrackingService,
    private examService: ExamService,
    private loaderService: PecLoaderService,
    private assignmentIconsService: AssignmentIconsService,
    private zoomService: PecZoomService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
    if (this.route.snapshot.queryParams.tabSelect && this.route.snapshot.queryParams.tabSelect === '2') {
      this.tabSelect = 2;
    }
  }

  public ngOnInit() {
    setTimeout(this.loadData.bind(this), 0);
  }

  public launchLiveChat() {
    if (this.classInfo.ClassId && this.assignment.LiveSessionId && this.assignment.LiveSessionId !== '0') {
      this.showLoadingModal().then(() => {
        this.mobileService
          .campusSettings()
          .pipe(first())
          .subscribe((o) => {
            if (!o || !o.Settings || !o.Settings.LmsUrl) {
              this.hideLoadingModal();
              return;
            }

            const lmsUrl = o.Settings.LmsUrl;
            this.classService
              .liveMeetingUrl(lmsUrl, this.classInfo.ClassId, +this.assignment.LiveSessionId)
              .pipe(first())
              .subscribe((meeting) => {
                this.hideLoadingModal().then(() => {
                  if (meeting.error) {
                    this.trackingService.trackEvent({
                      view: 'Classroom View',
                      category: 'Classroom View',
                      action: 'Zoom API Error',
                      label: meeting.error.ErrorCode,
                      value: '',
                    });
                    this.zoomService.presentZoomErrorPopOver(meeting.error);
                  } else {
                    this.launchChat(meeting.Uri);
                  }
                });
              });
          });
      });
    }
  }

  public launchChat(chatUrl: string) {
    this.zoomService.launchChat(this.assignment.Vendor, this.assignment.LmsLiveSessionId, chatUrl, false);
  }

  public launchZoomArchiveChat() {
    this.zoomService.launchZoomArchiveChat(this.assignment.IsArchive, this.assignment.Url);
  }

  public goToOverviewPage() {
    this.router.navigate(
      ['/tabs/home/classroom', this.classInfo.ClassId, 'assignment-overview', this.assignment.AssignmentId],
      {
        state: { assignment: this.assignment, isNewCustomCourse: this.isNewCustomCourse },
      }
    );
  }

  public goToGradedAssignmentPage() {
    if (this.assignment.IsGraded) {
      this.router.navigate(['/tabs/degree/graded-assignments/detail'], {
        state: {
          classId: this.classInfo.ClassId,
          assignmentId: this.assignment.AssignmentId,
          pageTrackTitle: 'Classroom View',
        },
        queryParams: { tabSelect: this.tabSelect },
      });
    }
  }

  public getAssignmentCalendarEvent() {
    //this.ionSlidingItem.close();
    if (this.assignment && this.classInfo) {
      if (this.assignment.IsAssignment) {
        return this.meetingService.getPECAssignmentEventInfo(this.assignment, this.classInfo, this.assignmentPart);
      } else {
        return this.meetingService.getPECEventInfo(new Meeting(this.assignment as any), this.classInfo);
      }
    }

    return;
  }

  public closeSlidingItem() {
    this.ionSlidingItem.close();
  }

  public markAsFinished(markedAsFinished: boolean) {
    this.closeSlidingItem();
    this.assignmentService.markAsFinished(
      this.classInfo.ClassId.toString(),
      this.assignment.AssignmentId,
      markedAsFinished,
      this.assignmentPart == null ? 0 : this.assignmentPart.AssignmentPartId
    );
    if (this.assignmentPart) {
      this.assignmentPart.IsDismissed = markedAsFinished;
    } else {
      this.assignment.IsDismissed = markedAsFinished;
    }

    this.isAssignmentDismissed = markedAsFinished;
  }

  private loadData() {
    if (!this.assignment) {
      return;
    }

    this.encodedTrackingUrl = encodeURIComponent(this.globalConfigs.trackingUrl);
    this.userService
      .info()
      .pipe(first())
      .subscribe((user) => {
        this.isHybrid = user.IsHybridStudent;
      });

    this.schoolService
      .info()
      .pipe(first())
      .subscribe((data) => {
        if (this.isHybrid && (this.classInfo.SyCampusId === 5 || this.classInfo.SyCampusId === 6)) {
          this.timeZoneCode = 'CT';
        } else {
          this.timeZoneCode = data.TimeZoneCode;
        }

        if (this.assignment) {
          let zoneFilter: string;
          zoneFilter = this.timeZoneCode.slice(0, 1);
          switch (zoneFilter) {
            case 'E': {
              zoneFilter = this.zone.atlanta;
              break;
            }
            case 'C': {
              zoneFilter = this.zone.huston;
              break;
            }
            case 'M': {
              zoneFilter = this.zone.colorado;
              break;
            }
            default: {
              zoneFilter = this.zone.online;
              break;
            }
          }
          if (this.assignment.StartDateTimeUTC) {
            this.startDateTimeChat = moment(this.assignment.StartDateTimeUTC).tz(zoneFilter).format('h:mmA');
          } else {
            this.startDateTimeChat = moment(this.assignment.StartDateTime).format('h:mmA');
          }

          if (this.assignment.HasGradeMaskedAssignment) {
            this.gradeMasked = this.assignment.HasGradeMaskedAssignment;
          }

          if (this.assignment.Features) {
            this.assignmentFeatureId = this.assignment.Features[0].AssignmentFeatureId;
          }

          if (this.assignment.Features && this.assignment.Features[0].QmProperties) {
            this.monitored = this.assignment.Features[0].QmProperties.Monitored;
          }

          if (this.assignment.Features) {
            this.assignmentFeatureUrl = this.assignment.Features[0].url;
          }
          this.isAssignmentDismissed = this.assignmentPart
            ? this.assignmentPart.IsDismissed
            : this.assignment.IsDismissed;
        }

        if (this.assignment && this.assignment.IsAssignment && this.assignment.AssignmentTypeId) {
          const iconDetail = this.assignmentIconsService.getIcon(
            this.assignment.AssignmentTypeId,
            this.assignment.HasInClassAssessmentFeature
          );
          this.iconName = iconDetail.iconName;
          this.eventLabel = iconDetail.eventLabel;
          this.getAssignmentDetail();
        } else {
          this.iconName = 'live-meeting';
          if (this.assignment.MeetingTypeId) {
            if (this.assignment.MeetingTypeId === 3) {
              this.assignment.liveMeetingType = 'OFFICE HOURS';
            } else if (this.assignment.MeetingTypeId === 1) {
              this.assignment.liveMeetingType = 'LIVE CHAT';
            } else if (this.assignment.MeetingTypeId === 2) {
              if (this.globalConfigs.themeId === ThemeId.CTU) {
                this.assignment.liveMeetingType = 'MINI-LESSON';
              } else {
                this.assignment.liveMeetingType = 'LECTURE';
              }
            }
          } else {
            this.assignment.liveMeetingType = 'LIVE CHAT';
          }
          this.assignment.gaMeetingType = this.assignment.liveMeetingType.toLowerCase();
          this.getLiveMeetingButtons();
        }
        this.loadButtons();
        this.isStandard = !this.isCustom;
      });
  }

  private loadButtons() {
    this.assignmentActions = [];
    if (this.assignment.IsAssignment) {
      this.assignmentActions.push({
        label: 'OVERVIEW',
        pecTrackEvent: {
          category: 'Classroom View',
          action: 'Tapped Assignment Overview',
          label: this.eventLabel,
          value: '',
          classId: this.classInfo.ClassId,
        },
        click: () => {
          this.router.navigate(['assignment-overview', this.assignment.AssignmentId], {
            relativeTo: this.route,
            state: { assignment: this.assignment, isNewCustomCourse: this.isNewCustomCourse },
          });
        },
      });
      if (this.isCustom && this.assignment.AssignmentTypeId !== 14) {
        this.assignmentActions.push({
          label: this.isCTU ? 'BOOKS & RESOURCES' : 'LEARNING MATERIALS',
          pecTrackEvent: {
            category: 'Classroom View',
            action: this.isCTU ? 'Tapped to View Books and Resources' : 'Tapped Learning Activities',
            label: '',
            value: '',
            classId: this.classInfo.ClassId,
          },
          click: () => {
            this.router.navigate(['ground-learning-activities', this.assignment.UnitNumber], {
              relativeTo: this.route,
              state: {
                classId: this.classInfo.ClassId,
                groundLearningActivitiesView: true,
                assignment: this.assignment,
                isStandard: this.isStandard,
                unitNumber: this.assignment.UnitNumber,
              },
            });
          },
        });
      }
      if (this.assignment.AssignmentTypeId === 4) {
        this.assignmentActions.push({
          label: 'DISCUSSION BOARD',
          pecTrackEvent: {
            category: 'Classroom View',
            action: 'Tapped Assignment Work Area',
            label: 'Discussion Board',
            value: '',
            classId: this.classInfo.ClassId,
          },
          click: () =>
            this.router.navigate(['/tabs/home/discussion-board', this.classInfo.ClassId, this.assignment.AssignmentId]),
        });
      }
      if (this.assignment.AssignmentTypeId === 14) {
        this.assignmentActions.push({
          label: 'LAUNCH INTELLIPATH',
          pecTrackEvent: {
            category: 'Classroom View',
            action: 'Tapped Assignment Work Area',
            label: 'IntelliPath',
            value: '',
            classId: this.classInfo.ClassId,
          },
          pecLmsRedirect: true,
          pecOpenIn: 'browser',
          pecUrl: `vendor/lms/class/${this.classInfo.ClassId}/intellipath`,
        });
      }
      if (this.assignment.AssignmentTypeId === 19) {
        this.assignmentActions.push({
          label: 'LAUNCH SIMULATION',
          pecTrackEvent: {
            category: 'Classroom View',
            action: 'Tapped Assignment Work Area',
            label: 'Lab',
            value: '',
            classId: this.classInfo.ClassId,
          },
          pecLmsRedirect: true,
          pecOpenIn: 'browser',
          pecUrl: `lti/2/Launch?classId=${this.classInfo.ClassId}&contextId=${this.assignment.AssignmentId}&refModule=Assignment&refUrl=${this.encodedTrackingUrl}`,
        });
      }
      if (this.assignment.AssignmentTypeId === 21) {
        this.assignmentActions.push({
          label: 'LAUNCH ZYBOOK',
          pecTrackEvent: {
            category: 'Classroom View',
            action: 'Tapped Assignment Work Area',
            label: 'Lab',
            value: '',
            classId: this.classInfo.ClassId,
          },
          pecLmsRedirect: true,
          pecOpenIn: 'browser',
          pecUrl: this.assignmentFeatureUrl,
        });
      }
      if (
        (this.assignment.AssignmentTypeId === 2 ||
          this.assignment.AssignmentTypeId === 3 ||
          this.assignment.AssignmentTypeId === 6) &&
        this.assignment.HasSubmissionFeature
      ) {
        this.assignmentActions.push({
          label: 'SUBMIT',
          pecTrackEvent: {
            category: 'Classroom View',
            action: 'Tapped Assignment Work Area',
            label: this.eventLabel,
            value: '',
            classId: this.classInfo.ClassId,
          },
          pecLmsRedirect: true,
          pecOpenIn: this.unit && !this.unit.IsSubmissionsPilot ? 'browser' : 'inapp',
          pecUrl: `lms/class/${this.classInfo.ClassId}/assignment/${this.assignment.AssignmentId}/submission`,
        });
      }

      if (this.assignment.AssignmentTypeId === 7 || this.assignment.AssignmentTypeId === 12) {
        this.assignmentActions.push({
          label: 'COMPLETE',
          pecTrackEvent: {
            category: 'Classroom View',
            action: 'Tapped Assignment Work Area',
            label: this.eventLabel,
            value: '',
            classId: this.classInfo.ClassId,
          },
          pecLmsRedirect: true,
          pecOpenIn: 'inapp',
          pecHash: `/class/${this.classInfo.ClassId}/assignment/${this.assignment.AssignmentId}/assessment`,
        });
      }
      if (
        (this.assignment.AssignmentTypeId === 20 && !this.monitored) ||
        (this.assignment.AssignmentTypeId === 20 && this.monitored && this.globalConfigs.isImpersonatedUser)
      ) {
        this.assignmentActions.push({
          label: 'COMPLETE',
          pecTrackEvent: {
            category: 'Classroom View',
            action: 'Tapped Assignment Work Area',
            label: this.eventLabel,
            value: '',
            classId: this.classInfo.ClassId,
          },
          pecLmsRedirect: true,
          pecOpenIn: 'browser',
          pecUrl: `vendor/lms/class/${this.classInfo.ClassId}/assignment/${this.assignment.AssignmentId}/feature/${this.assignmentFeatureId}`,
        });
      }
      if (this.assignment.AssignmentTypeId === 20 && this.monitored && !this.globalConfigs.isImpersonatedUser) {
        this.assignmentActions.push({
          label: 'COMPLETE',
          pecTrackEvent: {
            category: 'Classroom View',
            action: 'Tapped Assignment Work Area',
            label: this.eventLabel,
            value: '',
            classId: this.classInfo.ClassId,
          },
          click: () => this.showQuestionMarkAlert(),
        });
      }
    } else if (!this.assignment.IsAssignment && !this.assignment.IsArchive && !this.meetingEnded) {
      this.assignmentActions.push({
        label: 'OVERVIEW',
        pecTrackEvent: {
          category: 'Classroom View',
          action:
            this.assignment.liveMeetingType === 'LIVE CHAT'
              ? 'Tapped LiveChat Overview'
              : 'Tapped ' + this.assignment.gaMeetingType + ' Overview',
          label: this.assignment.LiveSessionId || this.assignment.LmsLiveSessionId,
          value: '',
          classId: this.classInfo.ClassId,
        },
        click: () => {
          this.router.navigate(['meeting-overview'], {
            relativeTo: this.route,
            state: { title: this.assignment.Title, description: this.assignment.Description },
          });
        },
      });

      if (this.launchMeeting || this.beforeLiveEnd) {
        this.assignmentActions.push({
          label: 'LAUNCH MEETING',
          pecTrackEvent: {
            category: 'Classroom View',
            action:
              this.assignment.liveMeetingType === 'LIVE CHAT'
                ? 'Tapped to Access Live Chat'
                : 'Tapped to Access ' + this.assignment.gaMeetingType + ' live meeting',
            label: this.assignment.LiveSessionId || this.assignment.LmsLiveSessionId,
            classId: this.classInfo.ClassId,
          },
          click: () => this.launchLiveChat(),
        });
      }
    } else if (!this.assignment.IsAssignment && this.assignment.IsArchive) {
      if (this.assignment.MeetingRecordedStatusId === 5) {
        this.assignmentActions.push({
          label: 'OVERVIEW',
          click: () => {
            this.router.navigate(['meeting-overview'], {
              relativeTo: this.route,
              state: { title: this.assignment.Title, description: this.assignment.Description },
            });
          },
          pecTrackEvent: {
            category: 'Classroom View',
            action:
              this.assignment.liveMeetingType === 'LIVE CHAT'
                ? 'Tapped LiveChat Overview'
                : 'Tapped ' + this.assignment.gaMeetingType + ' Overview',
            label: this.assignment.LiveSessionId || this.assignment.LmsLiveSessionId,
            value: '',
            classId: this.classInfo.ClassId,
          },
        });

        this.assignmentActions.push({
          label: 'LAUNCH RECORDING',
          pecTrackEvent: {
            category: 'Classroom View',
            action:
              this.assignment.liveMeetingType === 'LIVE CHAT'
                ? 'Tapped to Access Archived Chat'
                : 'Tapped to Access ' + this.assignment.gaMeetingType + ' archived chat',
            label: this.assignment.LiveSessionId || this.assignment.LmsLiveSessionId,
            value: '',
            classId: this.classInfo.ClassId,
          },
          click: () => this.launchZoomArchiveChat(),
        });
      }
    }
  }

  private getLiveMeetingButtons() {
    if (this.assignment && this.assignment.StartDateTimeUTC) {
      const dateTimeToday = moment().local().valueOf();
      const meetingStartDateTime = moment.parseZone(this.assignment.StartDateTimeUTC).local().valueOf();
      const meetingEndDateTime = meetingStartDateTime + this.assignment.Duration * 60000;

      this.launchMeeting = dateTimeToday < meetingStartDateTime;
      this.meetingEnded = dateTimeToday > meetingEndDateTime;
      this.afterLiveStart = dateTimeToday > meetingStartDateTime;
      this.beforeLiveEnd = dateTimeToday < meetingEndDateTime;
    }
  }

  private getAssignmentDetail() {
    if (!this.subscriptions.todos) {
      this.subscriptions.todos = this.classService.todos().subscribe(
        (todos) => {
          const classAssignments = todos.filter((item) => item.ClassId === this.classInfo.ClassId);
          if (classAssignments) {
            const detail = classAssignments.filter(
              (item) =>
                item.AssignmentFooter != null && item.AssignmentFooter.AssignmentId === this.assignment.AssignmentId
            );
            if (detail && detail.length > 0 && detail[0].AssignmentFooter.AssignmentUrl) {
              this.assignmentDetailUrl = detail[0].AssignmentFooter.AssignmentUrl;
            }
          }
        },
        () => {
          setTimeout(() => {
            if (this.subscriptions.todos) {
              this.subscriptions.todos.unsubscribe();
              delete this.subscriptions.todos;
            }
          }, 0);
        }
      );
    }
  }

  private showLoadingModal() {
    return this.loaderService.show('Please wait...');
  }

  private hideLoadingModal() {
    return this.loaderService.dismiss();
  }

  private showQuestionMarkAlert() {
    //if proctored track event
    if (this.monitored) {
      this.trackingService.trackEvent({
        category: 'Classroom View',
        action: 'Error Displayed_Accessing Assessment',
        label: 'Proctor exam on mobile',
        value: '',
        classId: this.classInfo.ClassId,
      });
    }
    this.examService.showQuestionMarkAlert();
  }
}

export interface AssignmentAction {
  label: string;
  pecLmsRedirect?: boolean;
  pecOpenIn?: string;
  pecUrl?: string;
  pecHash?: string;
  pecTrackEvent?: GaEvent;
  click?: () => void;
}

interface ClassAssignmentViewModel extends ClassAssignment {
  IsAssignment: boolean;
  LmsLiveSessionId: string;
  LiveSessionId: string;
  MeetingTypeId: number;
  liveMeetingType: string;
  IsArchive: boolean;
  Url: string;
  Vendor: number;
  EndDateTimeUTC: string;
  EndDateTime: string;
  StartDateTimeUTC: string;
  StartDateTime: string;
  gradeMasked: boolean;
  gaMeetingType: string;
  Duration: number;
  MeetingRecordedStatusId: number;
  Title: string;
}
