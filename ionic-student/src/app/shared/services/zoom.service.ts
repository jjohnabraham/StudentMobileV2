import { Injectable } from '@angular/core';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { first } from 'rxjs/operators';
import { MobileService } from 'src/app/data/services/mobile.service';
import { UserService } from 'src/app/data/services/user.service';
import { GlobalConfigsService } from './global-configs.service';
import { PecAlertService } from './pec-alert.service';
import { AppAvailability } from '@ionic-native/app-availability/ngx';
import { PecPopOverService } from './pec-popover.service';
import { ZoomErrorPopoverComponent } from '../components/zoom-error-popover/zoom-error-popover.component';

@Injectable({
  providedIn: 'root',
})
export class PecZoomService {
  private displayingAlertToInstallAdobe = false;

  constructor(
    private globalConfigs: GlobalConfigsService,
    private userService: UserService,
    private mobileService: MobileService,
    private alertService: PecAlertService,
    private browserTab: BrowserTab,
    private appAvailability: AppAvailability,
    private popoverCtrl: PecPopOverService
  ) {}

  public launchZoomArchiveChat(isArchive: boolean, assignmentUrl: string) {
    const appId = 5;
    this.userService
      .getSlt(appId)
      .pipe(first())
      .subscribe((token) => {
        token = encodeURIComponent(token);
        this.mobileService
          .campusSettings()
          .pipe(first())
          .subscribe((o) => {
            if (!o || !o.Settings || !o.Settings.LmsUrl) {
              return;
            }
            let lmsUrl = o.Settings.LmsUrl;
            if (isArchive) {
              lmsUrl = `${lmsUrl}${assignmentUrl}${
                assignmentUrl && assignmentUrl.indexOf('?') < 0 ? '?' : '&'
              }refApp=mobile&slt=${token}`;

              this.launchArchiveChatMp4(lmsUrl);
            }
          });
      });
  }

  public launchChat(vendor: number, lmsLiveSessionId: string, url: string, isgroupChat: boolean) {
    let app;
    let appId: string;
    let alertMessage: string;
    if ((vendor && vendor === 2) || lmsLiveSessionId) {
      if (this.globalConfigs.isIos) {
        if (!isgroupChat) {
          url = url.replace('https://', 'zoomus://');
          url = url.replace('?', '&');
          // //url can have any of the following pattern based on the status of the meeting
          url = url.replace('/w/', '/join?confno=');
          url = url.replace('/j/', '/join?confno=');
          url = url.replace('/s/', '/join?confno=');
          url = url.replace('/wc/', '/join?confno=');
        }

        app = 'zoomus://';
        appId = 'https://apps.apple.com/us/app/zoom-cloud-meetings/id546505307';
        alertMessage = 'Would you like to visit the App Store to get ZOOM Cloud Meetings?';
      } else if (this.globalConfigs.isAndroid) {
        app = 'us.zoom.videomeetings';
        appId = 'market://details?id=us.zoom.videomeetings';
        alertMessage = 'Would you like to visit the Play Store to get ZOOM Cloud Meetings?';
      } else {
        this.globalConfigs.openUrlOutOfApp(url);
        return;
      }
    } else if (vendor === 1) {
      if (this.globalConfigs.isIos) {
        app = 'connectpro://';
        appId = 'itms://apps.apple.com/us/app/adobe-connect-mobile/id430437503?mt=8';
        alertMessage = 'Would you like to visit the App Store to get Adobe Connect?';
      } else if (this.globalConfigs.isAndroid) {
        app = 'air.com.adobe.connectpro';
        appId = 'market://details?id=air.com.adobe.connectpro';
        alertMessage = 'Would you like to visit the Play Store to get Adobe Connect?';
      }
    }
    if (this.globalConfigs.isAndroid) {
      this.browserTab.openUrl(url)
    } else {
      this.appAvailability.check(app).then(
        (yes: boolean) => this.globalConfigs.openUrlOutOfApp(url),
        (no: boolean) => this.showAlertToAdobeConnect(appId, alertMessage)
      );
    }
  }

  public presentZoomErrorPopOver(error) {
    this.popoverCtrl.show({
      component: ZoomErrorPopoverComponent,
      componentProps: {
        title: error.ErrorTitle,
        message: error.ErrorMessage,
        errorCode: error.ErrorCode,
      },
      cssClass: 'pec-popover-alert',
    });
  }

  private launchArchiveChatMp4(mp4Url: string) {
    if (this.globalConfigs.isCordova) {
      this.browserTab.openUrl(mp4Url);
      return;
    } else {
      this.globalConfigs.openUrlOutOfApp(mp4Url);
    }
  }

  private async showAlertToAdobeConnect(appId: string, alertMessage: string) {
    if (this.displayingAlertToInstallAdobe) {
      return;
    }

    this.displayingAlertToInstallAdobe = true;

    await this.alertService.show({
      header: `Application Not Installed`,
      message: alertMessage,
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'OK',
          action: () => {
            this.globalConfigs.openUrlOutOfApp(appId);
          },
        },
      ],
      onDismiss: () => (this.displayingAlertToInstallAdobe = false),
    });
  }
}
