import { ChangeDetectorRef, Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { filter, first, retry } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IonTabButton, IonTabs, ModalController } from '@ionic/angular';
import { ConnectMenuComponent } from '../connect-menu/connect-menu.component';
import { BaseComponent } from '../base-component/base.component';
import { MessengerService } from '../../../data/services/messenger.service';
import { GlobalConfigsService } from '../../services/global-configs.service';
import { AnnouncementService } from '../../../data/services/announcement.service';
import { PushNotificationsService } from '../../services/push-notifications.service';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../../data/services/auth.service';
import { DynamicLinksService } from '../../services/dynamic-links.service';
import { TrackingService } from '../../services/tracking.service';
import { UrbanAirShip } from '@ionic-native/urbanairship/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { ChameleonService } from '../../services/chameleon.service';
import { AirshipService } from '../../services/airship.service';
import { from } from 'rxjs';

@Component({
  selector: 'pec-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent extends BaseComponent implements OnInit {
  @ViewChild('pecTabs') tabRef: IonTabs;
  @ViewChild('tab1') homeTab: IonTabButton;
  @ViewChild('tab2') degreeTab: IonTabButton;
  @ViewChild('tab3') communicationsTab: IonTabButton;
  @ViewChild('tab4') financialTab: IonTabButton;
  @ViewChild('tab5') moreTab: IonTabButton;

  public currentSelection: string;
  public showTabs = false;
  public tabMessagesShowBadge = false;
  public tabAnnouncementsShowBadge = false;
  public tabNotificationsShowBadge = false;
  public showTabChat = false;
  public isHomeTab = false;
  public isDegreeTab = false;
  public isConnectTab = false;
  public isFinTab = false;
  public isMoreTab = false;

  private isQueryParm = false;
  private urlsWithoutTabs = [
    '/login',
    '/login-help',
    '/error/force-update',
    '/error/alumni',
    '/error/timeout',
    '/error/technical-difficulties',
    '/error/faculty',
    '/home/id/student',
    '/tabs/home/id/student',
    '/home/id/alumni',
    '/tabs/home/id/alumni',
    '/tabs/home/alumni/alumni',
  ];
  private connectMenuModal: HTMLIonModalElement;
  private connectMenuClick = new EventEmitter();

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private messengerService: MessengerService,
    private globalConfigs: GlobalConfigsService,
    private pushNotificationsService: PushNotificationsService,
    private announcementService: AnnouncementService,
    private authService: AuthService,
    private storage: StorageService,
    private route: ActivatedRoute,
    private dynamicLinksService: DynamicLinksService,
    private changeDetectorRef: ChangeDetectorRef,
    private trackingService: TrackingService,
    private urbanAirShip: UrbanAirShip,
    private firebaseX: FirebaseX,
    private chameleonService: ChameleonService,
    private airshipService: AirshipService
  ) {
    super();
  }

  public ngOnInit() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      this.showTabs = !this.urlsWithoutTabs.find((url) => event.urlAfterRedirects.startsWith(url));
      this.chameleonService.identifyUser();
    });

    this.isQueryParm = this.isHomeTab = this.isDegreeTab = this.isFinTab = this.isConnectTab = this.isMoreTab = false;
    this.route.queryParams.subscribe((params) => {
      if (params.tabSelect) {
        this.isQueryParm = true;
        this.tabSelection(Number(params.tabSelect));
      }
    });

    this.connectMenuClick.subscribe((res) => {
      this.tabSelection(3);
    });

    this.initializeAndSubscribeEvents();

    this.chameleonService.identifyUser();
  }

  public tabSelection(selectedTab) {
    this.isQueryParm = this.isHomeTab = this.isDegreeTab = this.isFinTab = this.isConnectTab = this.isMoreTab = false;
    switch (selectedTab) {
      case 1: {
        this.isHomeTab = true;
        break;
      }
      case 2: {
        this.isDegreeTab = true;
        break;
      }
      case 3: {
        this.isConnectTab = true;
        break;
      }
      case 4: {
        this.isFinTab = true;
        break;
      }
      case 5: {
        this.isMoreTab = true;
        break;
      }
    }
  }

  //this is a hack as angular's default route behavior will load the last view of the module but we need the root page
  public tabClick(event, selectedTab) {
    event.stopPropagation();
    event.preventDefault();
    // this.tabSelection(selectedTab);
    let eventAction = '';
    let navUrl = '';
    switch (selectedTab) {
      case 1: {
        eventAction = 'Tapped Home';
        navUrl = '/tabs/home';
        break;
      }
      case 2: {
        eventAction = 'Tapped Degree Plan';
        navUrl = '/tabs/degree';
        break;
      }
      case 4: {
        eventAction = 'Tapped Financial Aid';
        navUrl = '/tabs/financial-aid';
        break;
      }
      case 5: {
        eventAction = 'Tapped More Menu';
        navUrl = '/tabs/more';
        break;
      }
    }

    if (navUrl) {
      this.router.navigate([navUrl], { queryParams: { tabSelect: selectedTab }, replaceUrl: true });

      this.trackingService.trackEvent({
        category: 'Menu',
        action: eventAction,
        label: '',
        value: '',
      });
    }
  }

  public showConnectMenu() {
    if (this.connectMenuModal) {
      this.connectMenuModal.dismiss();
      delete this.connectMenuModal;
    }

    this.modalCtrl
      .create({
        component: ConnectMenuComponent,
        cssClass: 'connect-menu-modal',
        showBackdrop: true,
        backdropDismiss: true,
        componentProps: {
          connectMenuClicked: this.connectMenuClick,
          tabMessagesShowBadge: this.tabMessagesShowBadge,
          tabAnnouncementsShowBadge: this.tabAnnouncementsShowBadge,
          tabNotificationsShowBadge: this.tabNotificationsShowBadge,
          showTabChat: this.showTabChat,
        },
      })
      .then((modal) => {
        this.connectMenuModal = modal;

        this.connectMenuModal.present();
      });
  }

  public ionTabsDidChange(event) {
    if (event.tab === 'connect') return;
    this.isQueryParm = this.router.routerState.snapshot.root.queryParams.tabSelect;
    if (!this.isQueryParm) {
      this.isHomeTab = this.isDegreeTab = this.isFinTab = this.isConnectTab = this.isMoreTab = false;

      switch (this.tabRef.getSelected()) {
        case 'home': {
          this.isHomeTab = true;
          break;
        }
        case 'degree': {
          this.isDegreeTab = true;
          break;
        }
        case 'financial-aid': {
          this.isFinTab = true;
          break;
        }
        case 'more': {
          this.isMoreTab = true;
          break;
        }
      }
    }

    const newSelection = this.tabRef.getSelected();
    // if (this.currentSelection !== newSelection) {

    //   this.tabRef.outlet.deactivate();
    //   this.tabRef.outlet.pop(1, this.currentSelection);
    //   console.log('Changed ' + this.currentSelection + '  -> ' + event.tab);
    //   this.currentSelection = newSelection;
    // }
    this.currentSelection = newSelection;
  }

  private startBiometricsAndNotificationsProcesses() {
    this.subscriptions.isSecAuthSetupScreenDisplayed =
      this.pushNotificationsService.isSecAuthSetupScreenDisplayed.subscribe((biometricsInitialized: boolean) => {
        if (biometricsInitialized) {
          // If biometrics prompt has been shown, now initialize push notifications
          if (!this.globalConfigs.isImpersonatedUser) {
            this.pushNotificationsService
              .upgradeFirstRun()
              .catch((error) => this.globalConfigs.displayDebugError(error))
              .finally(() => this.pushNotificationsService.subscribePushNotificationEvents());
          } else {
            this.pushNotificationsService.disableUniversityPushNotification(true);
          }
        } else {
          this.authService.offerFingerprint(false);
        }
      });
  }

  private connectToSendbirdWithRetries() {
    return new Promise<void>((resolve, reject) => {
      const connectObs = from(this.messengerService.connect());
      connectObs.pipe(retry(3)).subscribe(
        () => {
          this.showTabChat = true;

          this.messengerService.updateUnreadCount();

          resolve();
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  private initializeAndSubscribeEvents() {
    this.connectToSendbirdWithRetries()
      .catch((error) => this.globalConfigs.displayDebugError(error))
      .finally(() => {
        this.startBiometricsAndNotificationsProcesses();
      });

    if (!this.subscriptions.chatCount) {
      this.subscriptions.chatCount = this.messengerService.unreadChannelCount.subscribe((count) => {
        this.tabMessagesShowBadge = count && count > 0;
        this.changeDetectorRef.markForCheck();
      });
    }

    // when starting the app try to get latest deep link that was passed into the app from notification
    this.urbanAirShip.getDeepLink(true).then((url) => {
      if (url) {
        this.deepLinkHandler(url);
      } else {
        // for notifications without deep link URL
        this.urbanAirShip.getLaunchNotification(true).then((push) => {
          if (!push || !push.extras) return;

          if (push.extras.sendbird) {
            // if Sendbird (messenger) notification
            this.router.navigate(['tabs/connect/messenger'], { queryParams: { tabSelect: 3 } });
          } else {
            // if any other notification without deep link
            this.router.navigate(['tabs/connect/notifications'], { queryParams: { tabSelect: 3 } });
          }
        });
      }
    });

    // deep link handler to handle deep links while app is running in background
    if (!this.subscriptions.deepLink) {
      this.subscriptions.deepLink = this.airshipService.onDeepLinkUrlChange.subscribe((url) => {
        if (!url) return;

        this.deepLinkHandler(url);
      });
    }

    // deep link handler for Sendbird chat notifications
    if (!this.subscriptions.deepLinkFcm) {
      this.subscriptions.deepLinkFcm = this.firebaseX.onMessageReceived().subscribe((notification) => {
        // Notification for chat message from Sendbird was clicked
        if (notification.messageType === 'notification' && notification.sendbird) {
          this.router.navigate(['tabs/connect/messenger'], { queryParams: { tabSelect: 3 } });
        }
      });
    }

    if (!this.subscriptions.unreadMessageCount) {
      this.subscriptions.unreadMessageCount = this.airshipService.onUnreadMessageCountUpdated.subscribe(
        (unreadMessageCount: number) => {
          this.airshipService.setBadgeNumber(unreadMessageCount);
          this.tabNotificationsShowBadge = unreadMessageCount && unreadMessageCount > 0;
          this.changeDetectorRef.markForCheck();
        }
      );
    }

    if (!this.subscriptions.hasUnreadMessage) {
      this.subscriptions.hasUnreadMessage = this.airshipService.onHasUnreadMessage.subscribe(
        (hasUnreadMessage: boolean) => {
          this.tabNotificationsShowBadge = hasUnreadMessage;
          this.changeDetectorRef.markForCheck();
        }
      );

      setInterval(() => {
        this.airshipService.refreshInbox().then(this.airshipService.checkUnreadMessage);
      }, 5000);
    }

    if (!this.subscriptions.unreadAnnouncementCount) {
      this.subscriptions.unreadAnnouncementCount = this.announcementService.onUnreadAnnouncementsCountChange.subscribe(
        (data: boolean) => {
          this.subscriptions.announcementsCount = this.announcementService
            .announcementsCount(this.announcementService.getAnnouncementPageNotificationsFilter(), true, true)
            .subscribe(
              (announcementsCount) => {
                this.tabAnnouncementsShowBadge =
                  announcementsCount &&
                  announcementsCount.AnnouncementCount &&
                  announcementsCount.AnnouncementCount.UnreadCurrentCount > 0;
                this.changeDetectorRef.markForCheck();
              },
              () => {
                setTimeout(() => {
                  if (this.subscriptions.announcementsCount) {
                    this.subscriptions.announcementsCount.unsubscribe();
                    delete this.subscriptions.announcementsCount;
                  }
                }, 0);
              }
            );
        }
      );
    }

    this.pollForAnnouncements();
  }

  private deepLinkHandler(url: string) {
    this.storage.removeItem('deepLinkUrl');
    this.airshipService.dismissInboxMessage();

    const decodedUrl = decodeURIComponent(url);
    try {
      this.dynamicLinksService.processDeepLink(decodedUrl, true);
    } catch (err) {}
    this.changeDetectorRef.markForCheck();
  }

  private pollForAnnouncements() {
    this.announcementService.countUnreadAnnouncements();
    setTimeout(this.pollForAnnouncements.bind(this), 5 * 60 * 1000);
  }
}
