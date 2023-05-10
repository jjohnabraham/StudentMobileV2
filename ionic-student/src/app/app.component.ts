import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleAnalyticsService } from './shared/services/google-analytics.service';
import { GlobalConfigsService } from './shared/services/global-configs.service';
import { DynamicLinksService } from './shared/services/dynamic-links.service';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonContent, Platform } from '@ionic/angular';
import { PecHttpService } from './shared/services/pec-http.service';
import { MobileService } from './data/services/mobile.service';
import { first } from 'rxjs/operators';
import { MobileSettings } from './data/types/mobile-settings.type';
import { ThemeId } from './shared/enums/theme-id.enum';
import { Keyboard, KeyboardResizeMode } from '@ionic-native/keyboard/ngx';
import { ChameleonService } from './shared/services/chameleon.service';
import { PushNotificationsService } from './shared/services/push-notifications.service';

@Component({
  selector: 'ion-app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  public showTabs = true;
  public themeClass: string;

  private mobileSettings: MobileSettings;
  private timeoutAt: Date;
  private timeoutInterval: any;

  constructor(
    private gaService: GoogleAnalyticsService,
    private globalConfig: GlobalConfigsService,
    private router: Router,
    private dynamicLinksService: DynamicLinksService,
    private statusBar: StatusBar,
    private platform: Platform,
    private http: PecHttpService,
    private mobileService: MobileService,
    private keyboard: Keyboard,
    private chameleonService: ChameleonService
  ) {
    //This sets the theme class to the html at same time as stylesheet load
    this.themeClass = 'theme-' + this.globalConfig.themeId + ' env-' + this.globalConfig.environment;
    document.getElementsByTagName('HTML')[0].className = this.themeClass;

    platform.ready().then(() => {
      this.statusBar.styleLightContent();

      if (this.globalConfig.themeId === ThemeId.AIU) {
        this.statusBar.backgroundColorByHexString('#053c72');
      } else {
        this.statusBar.backgroundColorByHexString('#222222');
      }

      this.keyboard.setResizeMode(KeyboardResizeMode.Ionic);
      this.keyboard.disableScroll(false);
    });

    if (this.globalConfig.isAndroid) {
      this.platform.backButton.subscribeWithPriority(10, () => {
        window.history.back();
      });
    }
  }

  public ngOnInit() {
    this.globalConfig.initDevice().subscribe(() => {
      this.gaService.initAnalytics();
    });

    document.addEventListener(
      'offline',
      () => {
        this.router.navigate(['/error/offline']);
      },
      false
    );

    document.addEventListener('click', (e) => this.dynamicLinksService.interceptLinkClick(e));

    window.addEventListener('orientationchange', () => {
      if (this.keyboard) {
        if (this.keyboard.hide) {
          this.keyboard.hide();
        }
      }
    });

    this.http.onAnySuccess.subscribe((data) => {
      let timeout = 120;

      if (this.mobileSettings) {
        if (this.globalConfig.isIos && this.mobileSettings.IosSettings?.AppTimeout) {
          timeout = this.mobileSettings.IosSettings.AppTimeout;
        } else if (this.globalConfig.isAndroid && this.mobileSettings.AndroidSettings?.AppTimeout) {
          timeout = this.mobileSettings.AndroidSettings.AppTimeout;
        }
      }

      this.timeoutAt = new Date(data.getTime() + timeout * 60 * 1000);

      this.processTimeout();
    });

    this.http.onUnauthorized.subscribe(
      (data) => {
        this.navigateToLogin(null);
      },
      (error) => {
        this.navigateToLogin(error);
      }
    );

    this.getMobileSettings();
  }

  private getMobileSettings() {
    this.mobileService
      .settings()
      .pipe(first())
      .subscribe(
        (settings) => {
          let forceUpgrade = false;
          this.mobileSettings = settings;

          this.chameleonService.init();

          if (this.globalConfig.deviceSpecificId && (this.globalConfig.isIos || this.globalConfig.isAndroid)) {
            let minVersion = '';

            if (
              this.globalConfig.isIos &&
              this.mobileSettings.IosSettings &&
              this.mobileSettings.IosSettings.MinVersion
            ) {
              minVersion = this.mobileSettings.IosSettings.MinVersion;
            } else if (
              this.globalConfig.isAndroid &&
              this.mobileSettings.AndroidSettings &&
              this.mobileSettings.AndroidSettings.MinVersion
            ) {
              minVersion = this.mobileSettings.AndroidSettings.MinVersion;
            }

            if (this.globalConfig.compareVersion(minVersion) >= 0) {
              forceUpgrade = true;
            }
          }

          if (this.globalConfig.isIos) {
            this.http.useHeaders = true;
          }

          if (forceUpgrade) {
            this.router.navigate(['/error/force-update'], { replaceUrl: true });
            return;
          }
        },
        (error) => {
          this.router.navigate(['/error/technical-difficulties/SETTINGFAIL'], {
            replaceUrl: true,
            state: { errorData: error },
          });
        }
      );
  }

  private navigateToLogin(error) {
    const isErrorPage = location.href.indexOf('/error/technical-difficulties') !== -1;
    const isUpdatePage = location.href.indexOf('/error/force-update') !== -1;
    const isLoginPage = location.href.indexOf('/login') !== -1;

    if (!isErrorPage && !isUpdatePage) {
      if (this.mobileSettings) {
        if (isLoginPage) {
          this.router.navigate(['/login'], {
            replaceUrl: true,
          });
        }
      } else {
        this.router.navigate(['/error/technical-difficulties/SETTINGFAIL'], {
          replaceUrl: true,
          state: { errorData: error },
        });
      }
    }
  }

  private processTimeout() {
    const now: Date = new Date();
    if (now > this.timeoutAt) {
      const isLoginPage = location.href.indexOf('/login') !== -1;
      const isTimeoutPage = location.href.indexOf('/error/timeout') !== -1;

      if (!isLoginPage && !isTimeoutPage) {
        this.globalConfig.requireNavigationConfirmation = false;
        this.router.navigate(['/error/timeout'], {
          replaceUrl: true,
        });
      }
    }

    if (this.timeoutInterval) {
      clearTimeout(this.timeoutInterval);
      this.timeoutInterval = 0;
    }

    this.timeoutInterval = setTimeout(() => {
      this.processTimeout();
    }, 10000);
  }
}
