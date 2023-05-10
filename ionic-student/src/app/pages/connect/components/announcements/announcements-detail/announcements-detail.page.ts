import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BasePageComponent } from 'src/app/shared/components/base-page-component/base-page.component';
import { AnnouncementService } from 'src/app/data/services/announcement.service';
import { GlobalConfigsService } from '../../../../../shared/services/global-configs.service';
import { ClassService } from 'src/app/data/services/class.service';

@Component({
  selector: 'pec-announcements-detail',
  templateUrl: './announcements-detail.page.html',
  styleUrls: ['./announcements-detail.page.scss'],
})
export class AnnouncementsDetailPage extends BasePageComponent implements OnInit {
  public announcementId: number;
  public courseCode: string;
  public classId: number;

  public announcement: any;

  public showError = false;
  public showLoading = false;
  public announcementList: any;

  public schoolLogo = `${
    this.globalConfigs.contentUrl
  }assets/${this.globalConfigs.brandName.toLowerCase()}/images/school-logo-icon.png`;

  private isClicked = false;
  constructor(
    private announcementService: AnnouncementService,
    private globalConfigs: GlobalConfigsService,
    private classService: ClassService,
    private router: Router
  ) {
    super();

    const state = router.getCurrentNavigation().extras.state;
    this.classId = state.classId;
    this.announcementId = state.announcementId;
    this.courseCode = state.courseCode;
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.loadData();
  }

  ionViewDidLeave() {}

  private loadData() {
    this.showLoading = true;
    if (!this.classId) {
      this.getAnnouncement();
    } else {
      this.getAnnouncementDescription();
    }
  }

  private getAnnouncement() {
    this.subscriptions.announcementList = this.announcementService
      .announcements(this.announcementService.getAnnouncementPageNotificationsFilter(), true)
      .subscribe(
        (announcementList) => {
          this.announcementList = announcementList;
          this.announcementList.forEach((a) => {
            a.ClassId = a.ClassIds && a.ClassIds[0] ? a.ClassIds[0] : null;
          });

          const announcement = this.announcementList.find((a) => a.AnnouncementId === this.announcementId);
          if (announcement) {
            this.classId = announcement.ClassId;
            this.getAnnouncementDescription();
          } else {
            this.showLoading = false;
          }
        },
        (error) => {
          this.showError = true;
          this.showLoading = false;

          setTimeout(() => {
            if (this.subscriptions.announcementList) {
              this.subscriptions.announcementList.unsubscribe();
              delete this.subscriptions.announcementList;
            }
          }, 0);
        }
      );
  }

  private getAnnouncementDescription() {
    this.subscriptions.announcementDescription = this.announcementService
      .announcementDescription(
        this.announcementId,
        this.classId,
        this.globalConfigs.ssid,
        this.globalConfigs.sycampusid
      )
      .subscribe(
        (announcementDescription) => {
          this.announcement = announcementDescription;
          if (this.announcement && !this.courseCode) {
            this.getCourseCode(this.announcement.ClassId);
          } else {
            this.showLoading = false;
          }
        },
        (error) => {
          this.showError = true;
          this.showLoading = false;

          setTimeout(() => {
            if (this.subscriptions.announcementDescription) {
              this.subscriptions.announcementDescription.unsubscribe();
              delete this.subscriptions.announcementDescription;
            }
          }, 0);
        }
      );
  }

  private getCourseCode(classId) {
    if (!this.subscriptions.classInfo) {
      this.subscriptions.classInfo = this.classService.summary(classId).subscribe(
        (classInfo) => {
          if (classInfo) {
            this.courseCode = classInfo.CourseCode;
          }

          this.showLoading = false;
        },
        (error) => {
          this.showError = true;
          this.showLoading = false;

          setTimeout(() => {
            if (!this.subscriptions.classInfo) {
              this.subscriptions.classInfo.unsubscribe();
              delete this.subscriptions.classInfo;
            }
          }, 0);
        }
      );
    }
  }
}
