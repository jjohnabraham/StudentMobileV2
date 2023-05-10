import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { BasePageComponent } from 'src/app/shared/components/base-page-component/base-page.component';
import { GlobalConfigsService } from '../../../../../shared/services/global-configs.service';
import { PecNavigationService } from '../../../../../shared/services/pec-navigation.service';
import { AnnouncementService } from 'src/app/data/services/announcement.service';
import { ClassService } from 'src/app/data/services/class.service';
import { first } from 'rxjs/operators';
import { AnnouncementsFilterComponent } from 'src/app/pages/connect/components/announcements/announcements-filter/announcements-filter.component';

@Component({
  selector: 'pec-announcements',
  templateUrl: './announcements.page.html',
  styleUrls: ['./announcements.page.scss'],
})
export class AnnouncementsPage extends BasePageComponent {
  public showError = false;
  public showLoading = false;

  public isCurrent = true;
  public announcementList: any;
  public unreadCount: number;
  public allCount: number;

  public allList: any = [];
  public unreadList: any = [];
  public classDictionary: any;
  public hasAnnouncements = false;
  public errCode = '';

  public courseList: any;
  public filterOptions: any;
  public allOrUnread = 'all';
  public previousView: string;
  private announcementsModal: HTMLIonModalElement;

  constructor(
    private announcementService: AnnouncementService,
    private classService: ClassService,
    private pecNavService: PecNavigationService,
    private modalController: ModalController,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super();
    const state = router.getCurrentNavigation().extras.state;
    if (state && state.previousurl) {
      this.previousView = state.previousurl;
    }
  }

  public ionViewDidEnter(): void {
    if (!this.previousView && this.activatedRoute.snapshot.queryParams.deepLink) {
      this.previousView = this.pecNavService.getPreviousUrl();
    } else if (!this.activatedRoute.snapshot.queryParams.deepLink) {
      this.previousView = null;
    }
  }

  public ionViewWillEnter(): void {
    this.loadData();
  }

  public refreshPage(event) {
    this.clearSubscriptions();
    this.loadData(true);
    setTimeout(() => {
      if (event) event.target.complete();
    }, 2000);
  }

  public clearSelectedFilters() {
    if (!this.filterOptions) {
      this.filterOptions = {};
    }

    this.filterOptions.filterCount = 0;

    this.filterOptions.read = false;
    this.filterOptions.unread = false;
    if (this.courseList && this.courseList.length > 0) {
      this.filterOptions.courses = [];
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < this.courseList.length; i++) {
        this.filterOptions.courses.push({
          courseCode: this.courseList[i].courseCode,
          classId: this.courseList[i].classId,
          selected: false,
        });
      }
    }
  }

  public goBack() {
    this.router.navigate(['/' + this.previousView]);
  }

  public openFilterSlider() {
    this.modalController
      .create({
        component: AnnouncementsFilterComponent,
        cssClass: 'announcements-filter',
        componentProps: {
          filterOptions: this.filterOptions,
          clearSelectedFilters: this.clearSelectedFilters.bind(this),
        },
      })
      .then((modal) => {
        this.announcementsModal = modal;
        this.announcementsModal.onDidDismiss().then(() => {
          this.updateLists();
        });

        this.announcementsModal.present();
      });
  }

  protected beginLoadData(): void {
    // throw new Error('Method not implemented.');
  }

  private loadData(forceAnnouncementRefresh?: boolean) {
    this.getAnnouncementList(forceAnnouncementRefresh);
    this.getClassList();
  }

  private getAnnouncementList(forceAnnouncementRefresh?: boolean) {
    if (forceAnnouncementRefresh || this.announcementList) {
      this.announcementListServiceRequest(true);
    } else if (!this.subscriptions.announcementList) {
      this.showLoading = true;
      this.announcementListServiceRequest(true);
    }
  }

  private announcementListServiceRequest(forceAnnouncementRefresh?: boolean) {
    this.subscriptions.announcementList = this.announcementService
      .announcements(this.announcementService.getAnnouncementPageNotificationsFilter(), forceAnnouncementRefresh)
      .subscribe(
        (announcementList) => {
          this.announcementList = announcementList;
          if (this.announcementList && this.announcementList.length > 0) {
            this.hasAnnouncements = true;
          } else {
            this.hasAnnouncements = false;
          }
          this.announcementList.forEach((a) => {
            a.ClassId = a.ClassIds && a.ClassIds[0] ? a.ClassIds[0] : null;
          });

          if (announcementList) {
            this.updateLists();
          }

          this.announcementService.countUnreadAnnouncements();

          this.clearLoading();
        },
        (error) => {
          this.showError = true;
          this.errCode = error.status;
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

  private getClassList() {
    if (!this.subscriptions.classList) {
      this.showLoading = true;

      this.subscriptions.classList = this.classService
        .classList('Current')
        .pipe(first())
        .subscribe(
          (classList) => {
            if (classList) {
              this.classDictionary = classList.reduce((result, obj) => {
                result[obj.ClassId] = obj;
                return result;
              }, {});

              this.courseList = classList.map((c) => ({ courseCode: c.CourseCode, classId: c.ClassId }));
              if (!this.filterOptions) {
                this.clearSelectedFilters(); //instantiate all as unselected
              }
            }
            this.clearLoading();
          },
          (error) => {
            this.showError = true;
            this.showLoading = false;
            this.errCode = error.status;
            setTimeout(() => {
              if (this.subscriptions.classList) {
                this.subscriptions.classList.unsubscribe();
                delete this.subscriptions.classList;
              }
            }, 0);
          }
        );
    }
  }

  private updateLists() {
    //used on initial load and also to refresh when values are changed on announcementList
    this.allList = this.announcementList;
    this.unreadList = this.announcementList.filter((o) => {
      return !o.Read;
    });

    this.allList = this.filterList(this.allList);
    this.unreadList = this.filterList(this.unreadList);

    this.allList.sort(this.sortList.bind(this));
    this.unreadList.sort(this.sortList.bind(this));

    this.allCount = this.allList.length;

    this.unreadCount = this.allList.reduce((count, announcement) => {
      return count + (announcement.Read === false);
    }, 0);
  }

  private filterList(list: any[]): any[] {
    if (this.filterOptions) {
      if (this.filterOptions.courses) {
        const filteredCoursesList = this.filterOptions.courses.filter((c) => {
          return !c.selected;
        });

        if (filteredCoursesList.length > 0 && this.filterOptions.courses.length > filteredCoursesList.length) {
          //if not all of the courses are selected, filter out the unselected
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let i = 0; i < filteredCoursesList.length; i++) {
            list = list.filter((x) => {
              return x.ClassIds[0] !== filteredCoursesList[i].classId;
            });
          }
        }
      }
    }

    return list;
  }

  private sortList(a: any, b: any) {
    if (a && !b) return -1;
    if (!a && b) return 1;

    if (a.PublishDate && !b.PublishDate) return -1;
    if (!a.PublishDate && b.PublishDate) return 1;
    let r = new Date(b.PublishDate).getTime() - new Date(a.PublishDate).getTime();
    if (r) return r;

    r = (a.Title || '').toLowerCase().localeCompare((b.Title || '').toLowerCase());
    if (r) return r;

    return 0;
  }

  private clearLoading() {
    if (this.showLoading) {
      this.showLoading = false;
    }
  }
}
