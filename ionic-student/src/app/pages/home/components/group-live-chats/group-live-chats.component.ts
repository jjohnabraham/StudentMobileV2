import { Component } from '@angular/core';
import { BasePageComponent } from '../../../../shared/components/base-page-component/base-page.component';
import { SchoolService } from '../../../../data/services/school.service';
import { first } from 'rxjs/operators';
import { LiveChatService } from '../../../../data/services/live-chat.service';
import { ClassLiveSession } from '../../../../data/types/class.type';
import { MeetingService } from '../../../../data/services/meeting.service';
import { ClassAssignment } from '../../../../data/types/assignment.type';
import { ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { ZoomRecording } from '../../../../data/types/meeting.type';
import { TrackingService } from '../../../../shared/services/tracking.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitInfo } from '../../../../data/types/unit.type';
import { MobileService } from 'src/app/data/services/mobile.service';
import { ClassService } from '../../../../data/services/class.service';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { PecLoaderService } from '../../../../shared/services/pec-loader.service';
import { PecAlertService } from '../../../../shared/services/pec-alert.service';
import { PecPopOverService } from '../../../../shared/services/pec-popover.service';
import { AppAvailability } from '@ionic-native/app-availability/ngx';
import { UserService } from '../../../../data/services/user.service';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { PecZoomService } from '../../../../shared/services/zoom.service';

@Component({
  selector: 'pec-group-live-chats',
  templateUrl: './group-live-chats.component.html',
  styleUrls: ['./group-live-chats.component.scss'],
})
export class GroupLiveChatsComponent extends BasePageComponent implements ViewDidEnter, ViewDidLeave {
  public showLoading: boolean;
  public timeZoneCode: string;
  public classId: number;
  public liveSession: ClassLiveSession[];
  public assignment: ClassAssignment;
  public zoomConcludedChatList: ZoomRecording[];
  public isHybrid;

  private loading: boolean;

  constructor(
    private schoolService: SchoolService,
    private liveChatService: LiveChatService,
    private meetingService: MeetingService,
    private trackingService: TrackingService,
    private mobileService: MobileService,
    private classService: ClassService,
    private globalConfigs: GlobalConfigsService,
    private loaderService: PecLoaderService,
    private alertService: PecAlertService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private popoverCtrl: PecPopOverService,
    private appAvailability: AppAvailability,
    private userService: UserService,
    private browserTab: BrowserTab,
    private zoomService: PecZoomService
  ) {
    super();

    const state = router.getCurrentNavigation().extras.state;
    this.classId = activatedRoute.snapshot.params.classId;

    this.assignment = state.assignment;
  }

  public ionViewDidEnter() {
    this.loadData();
  }

  public ionViewDidLeave() {
    this.popoverCtrl.dismiss();
  }

  public launchLiveChat(session: ClassLiveSession) {
    if (this.classId && session.LiveSessionId && session.LiveSessionId !== 0) {
      this.showLoadingModal();

      this.mobileService
        .campusSettings()
        .pipe(first())
        .subscribe((o) => {
          if (!o || !o.Settings || !o.Settings.LmsUrl) {
            return;
          }

          const lmsUrl = o.Settings.LmsUrl;
          this.subscriptions.url = this.classService
            .liveMeetingUrl(lmsUrl, this.classId, session.LiveSessionId)
            .subscribe((meeting) => {
              this.hideLoadingModal();

              if (meeting.error) {
                this.trackingService.trackEvent({
                  view: 'Group Live Chats',
                  category: 'Group Live Chats',
                  action: '	Zoom API Error',
                  label: meeting.error.ErrorCode,
                  value: '',
                });

                this.zoomService.presentZoomErrorPopOver(meeting.error);
              } else {
                this.launchChat(session, meeting.Uri);
              }
            });
        });
    }
  }

  public launchZoomArchiveChat(chat: ZoomRecording) {
    this.zoomService.launchZoomArchiveChat(true, chat.Url);
  }

  public launchChat(meeting: ClassLiveSession, url: string) {
    this.zoomService.launchChat(meeting.Vendor, null, url, true);
  }

  private loadData() {
    this.showLoading = true;

    this.schoolService
      .info()
      .pipe(first())
      .subscribe((data) => {
        this.timeZoneCode = data.TimeZoneCode;
      });

    this.getLiveSession();
    this.getZoomConcludedChats();
  }

  private getLiveSession() {
    if (this.classId && this.assignment) {
      this.showLoading = true;
      this.liveChatService.getLiveSession(this.classId, this.assignment.AssignmentId).subscribe(
        (liveSession) => {
          this.liveSession = liveSession;
          this.clearLoading();
        },
        () => {
          this.clearLoading();
        }
      );
    }
  }

  private getZoomConcludedChats() {
    this.meetingService
      .zoomConcludedChats(this.classId, this.assignment.AssignmentId, this.assignment.GroupId)
      .subscribe(
        (meeting) => {
          this.zoomConcludedChatList = [];

          const groupZoomConcludedList: ZoomRecording[] = [];

          if (meeting && meeting.error) {
            this.trackingService.trackEvent({
              view: 'Group Live Chats',
              category: 'Group Live Chats',
              action: '	Zoom API Error',
              label: meeting.error.ErrorCode,
              value: '',
            });
          } else if (meeting) {
            meeting.Recordings.forEach((element) => {
              if (element.MeetingRecordedStatusId === 5) {
                groupZoomConcludedList.push(element);
              }
            });

            if (groupZoomConcludedList) {
              groupZoomConcludedList.forEach((element) => {
                element.DurationTotal = element.RecordingDurationMinutes + element.RecordingDurationSeconds;
                this.zoomConcludedChatList.push(element);
                this.timeZoneCode = element.TimeZoneCode;
              });
            }

            this.zoomConcludedChatList.sort((a, b) => (a.RecordingStartDate <= b.RecordingStartDate ? 1 : -1));
          }

          this.clearLoading();
        },
        () => {
          this.clearLoading();
        }
      );
  }

  private showLoadingModal() {
    if (this.loading) {
      return;
    }

    this.loaderService.show('Please wait...');
  }

  private hideLoadingModal() {
    this.loaderService.dismiss();
  }

  private clearLoading() {
    if (this.showLoading) {
      this.showLoading = false;
    }
  }
}
