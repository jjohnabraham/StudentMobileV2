import { AfterViewInit, Component, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { BaseComponent } from '../base-component/base.component';
import { IonFab, ModalController, ViewDidEnter } from '@ionic/angular';
import { TrackingService } from '../../services/tracking.service';
import { GlobalConfigsService } from '../../services/global-configs.service';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { Router } from '@angular/router';
import { MobileService } from '../../../data/services/mobile.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'pec-connect-menu',
  templateUrl: './connect-menu.component.html',
  styleUrls: ['./connect-menu.component.scss'],
})
export class ConnectMenuComponent extends BaseComponent implements AfterViewInit, ViewDidEnter {
  @ViewChild(IonFab) ionFab: IonFab;
  @Output() connectMenuClicked = new EventEmitter();
  @Input() tabMessagesShowBadge = false;
  @Input() tabAnnouncementsShowBadge = false;
  @Input() tabNotificationsShowBadge = false;
  @Input() showTabChat = false;

  private emailUrl: string;

  constructor(
    private modalCtrl: ModalController,
    private trackingService: TrackingService,
    private globalConfigs: GlobalConfigsService,
    private browserTab: BrowserTab,
    private router: Router,
    private mobileService: MobileService
  ) {
    super();
  }

  public ionViewDidEnter() {
    this.mobileService
      .settings()
      .pipe(first())
      .subscribe((settings) => {
        if (settings) {
          if (this.globalConfigs.deviceSpecificId && (this.globalConfigs.isIos || this.globalConfigs.isAndroid)) {
            if (this.globalConfigs.isIos && settings.IosSettings && settings.IosSettings.EmailOffice365Url) {
              this.emailUrl = settings.IosSettings.EmailOffice365Url;
            } else if (
              this.globalConfigs.isAndroid &&
              settings.AndroidSettings &&
              settings.AndroidSettings.EmailOffice365Url
            ) {
              this.emailUrl = settings.AndroidSettings.EmailOffice365Url;
            }
          }
        }
      });
  }

  public onClose() {
    this.modalCtrl.dismiss();
  }

  public ngAfterViewInit() {
    this.ionFab.activated = true;
  }

  public navigateTo(index: number) {
    this.connectMenuClicked.emit();
    this.onClose();

    switch (index) {
      case 1:
        this.trackingService.trackEvent({ category: 'Menu', action: 'Tapped Connect', label: 'Email', value: '' });

        if (this.globalConfigs.isCordova) {
          this.browserTab.openUrl(this.emailUrl);
        } else {
          this.globalConfigs.openUrlOutOfApp(this.emailUrl);
        }

        break;
      case 2:
        this.trackingService.trackEvent({ category: 'Menu', action: 'Tapped Connect', label: 'Messenger', value: '' });
        this.router.navigate(['/tabs/connect/messenger'], { replaceUrl: true });
        break;
      case 3:
        this.trackingService.trackEvent({
          category: 'Menu',
          action: 'Tapped Connect',
          label: 'Announcements',
          value: '',
        });
        this.router.navigate(['/tabs/connect/announcements'], { replaceUrl: true });
        break;
      case 4:
        this.trackingService.trackEvent({
          category: 'Menu',
          action: 'Tapped Connect',
          label: 'Notifications',
          value: '',
        });
        this.router.navigate(['/tabs/connect/notifications'], { replaceUrl: true });
        break;
    }
  }
}
