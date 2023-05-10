import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalConfigsService } from '../../../../../shared/services/global-configs.service';
import { AnnouncementService } from 'src/app/data/services/announcement.service';
import { TrackingService } from '../../../../../shared/services/tracking.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { TimePastDatePipe } from '../../../../../shared/pipes/time-past-date.pipe';

@Component({
  selector: 'pec-announcements-list',
  templateUrl: './announcements-list.component.html',
  styleUrls: ['./announcements-list.component.scss'],
})
export class AnnouncementsListComponent extends BaseComponent {
  @Input() isAllList: boolean;
  @Input() announcementsList: any;
  @Input() classDictionary: any;
  @Output() updateLists = new EventEmitter();

  public schoolLogo = `${
    this.globalConfigs.contentUrl
  }assets/${this.globalConfigs.brandName.toLowerCase()}/images/school-logo-icon.png`;

  constructor(
    private globalConfigs: GlobalConfigsService,
    private announcementService: AnnouncementService,
    private trackingService: TrackingService,
    private pecTimePastDate: TimePastDatePipe,
    private router: Router
  ) {
    super();
  }

  public goToAnnouncementDetail(announcement: any, isRead: boolean, announcementClass: any, item) {
    if (announcement) {
      this.router.navigate(['/tabs/connect/annoucements/detail'], {
        state: {
          announcementId: announcement.AnnouncementId,
          courseCode: announcementClass.CourseCode,
          classId: announcementClass.ClassId,
        },
      });
      // if (!this.globalConfigs.IsImpersonatedUser) {
      this.markAnnouncementRead(announcement.AnnouncementId, isRead, item);
      //  }
      this.trackingService.trackEvent({
        view: 'Announcements View',
        category: 'Announcements View',
        action: 'Tapped to View Announcement',
        label: announcementClass.ClassId,
        value: '',
        classId: announcementClass.ClassId,
      });
    }
  }

  public dismissAnnouncement(announcementId: number, dismiss: boolean) {
    const announcement = this.announcementsList.find((a) => a.AnnouncementId === announcementId);
    if (announcement) {
      this.subscriptions.dismissAnnouncement = this.announcementService
        .dismissAnnouncement(announcementId, dismiss)
        .subscribe(
          (successful) => {
            if (successful) {
              announcement.Dismissed = dismiss;
            }
            this.updateLists.emit();
          },
          (error) => {
            setTimeout(() => {
              if (this.subscriptions.dismissAnnouncement) {
                this.subscriptions.dismissAnnouncement.unsubscribe();
                delete this.subscriptions.dismissAnnouncement;
              }
            }, 0);
          }
        );
    }
  }

  public markAnnouncementUnread(announcementId: number, isRead: boolean, item) {
    const announcement = this.announcementsList.find((a) => a.AnnouncementId === announcementId);
    if (announcement) {
      this.subscriptions.readAnnouncement = this.announcementService
        .readAnnouncement(announcementId, !isRead)
        .subscribe(
          (successful) => {
            if (successful) {
              announcement.Read = !isRead;
              this.updateLists.emit();

              this.announcementService.countUnreadAnnouncements();
              this.subscriptions.readAnnouncement.unsubscribe();
              item.close();
            }
          },
          (error) => {
            setTimeout(() => {
              if (this.subscriptions.readAnnouncement) {
                this.subscriptions.readAnnouncement.unsubscribe();
                delete this.subscriptions.readAnnouncement;
              }
            }, 0);
          }
        );
    }
  }

  public markAnnouncementRead(announcementId: number, isRead: boolean, item) {
    //setting announcementId to have its "Read" value as "isRead"
    const announcement = this.announcementsList.find((a) => a.AnnouncementId === announcementId);
    if (announcement && announcement.Read === !isRead) {
      //check that it's not already what we want to change it to

      this.subscriptions.readAnnouncement = this.announcementService.readAnnouncement(announcementId, isRead).subscribe(
        (successful) => {
          if (successful) {
            announcement.Read = isRead;
            this.updateLists.emit();

            this.announcementService.countUnreadAnnouncements();
            item.close();
          }
        },
        (error) => {
          setTimeout(() => {
            if (this.subscriptions.readAnnouncement) {
              this.subscriptions.readAnnouncement.unsubscribe();
              delete this.subscriptions.readAnnouncement;
            }
          }, 0);
        }
      );
    }
  }
}
