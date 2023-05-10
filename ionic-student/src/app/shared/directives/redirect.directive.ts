import { Directive, HostListener, Input, OnDestroy } from '@angular/core';
import { GlobalConfigsService } from '../services/global-configs.service';
import { PecHttpService } from '../services/pec-http.service';
import { MobileService } from '../../data/services/mobile.service';
import { first } from 'rxjs/operators';
import { UserService } from '../../data/services/user.service';
import { AlertController, LoadingController, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { StorageService } from '../services/storage.service';
import { InAppBrowser, InAppBrowserObject } from '@ionic-native/in-app-browser/ngx';
import { forkJoin, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { PecLoaderService } from '../services/pec-loader.service';

@Directive({
  selector: '[pecRedirect]',
})
export class RedirectDirective implements OnDestroy, ViewWillEnter, ViewDidLeave {
  @Input() pecOpenIn: string;

  protected url: string;

  private isLoading = false;
  private alert: HTMLIonAlertElement;
  private iab: InAppBrowserObject;
  private subscriptions: { [key: string]: Subscription };

  constructor(
    private globalConfigs: GlobalConfigsService,
    private http: PecHttpService,
    private mobileService: MobileService,
    private userService: UserService,
    private storageService: StorageService,
    private alertCtrl: AlertController,
    private loadingCtrl: PecLoaderService,
    private browserTab: BrowserTab,
    private inAppBrowser: InAppBrowser,
    private router: Router
  ) {}

  @HostListener('click', ['$event']) onClick($event) {
    if ($event && $event.stopPropagation) $event.stopPropagation();

    if (!this.url || this.isLoading) {
      return;
    }

    const dict: { [key: string]: string } = {};
    let urlHasLms = false;
    let urlHasToken = false;

    if (this.url.indexOf('{{apiUrl}}') >= 0) {
      if (!this.globalConfigs.apiUrl) {
        this.showError();
        return;
      }

      dict.apiUrl =
        this.globalConfigs.apiUrl.substr(-this.globalConfigs.apiUrl.length) === '/'
          ? this.globalConfigs.apiUrl
          : `${this.globalConfigs.apiUrl}/`;
    }

    if (this.url.indexOf('{{lmsUrl}}') >= 0) {
      urlHasLms = true;
    }

    if (this.url.indexOf('{{token}}') >= 0) {
      urlHasToken = true;
    }

    if (urlHasToken || urlHasLms) {
      this.showLoading().then(
        () => {
          if (urlHasToken) {
            this.userService
              .getSlt(5)
              .pipe(first())
              .subscribe(
                (sltToken) => {
                  if (!sltToken) {
                    this.showError();
                    return;
                  }

                  if (urlHasLms) {
                    this.mobileService
                      .campusSettings()
                      .pipe(first())
                      .subscribe(
                        (settings) => {
                          this.isLoading = false;

                          dict.token = encodeURIComponent(sltToken);
                          dict.lmsUrl =
                            settings.Settings.LmsUrl.substr(-settings.Settings.LmsUrl.length) === '/'
                              ? settings.Settings.LmsUrl
                              : `${settings.Settings.LmsUrl}/`;

                          if (!settings || !settings.Settings || !settings.Settings.LmsUrl) {
                            this.showError();
                            return;
                          }

                          this.navigate(dict);
                        },
                        () => this.showError()
                      );
                  } else {
                    this.isLoading = false;

                    dict.token = encodeURIComponent(sltToken);

                    this.navigate(dict);
                  }
                },
                () => this.showError()
              );
          } else if (urlHasLms) {
            this.mobileService
              .campusSettings()
              .pipe(first())
              .subscribe(
                (settings) => {
                  this.isLoading = false;

                  dict.lmsUrl =
                    settings.Settings.LmsUrl.substr(-settings.Settings.LmsUrl.length) === '/'
                      ? settings.Settings.LmsUrl
                      : `${settings.Settings.LmsUrl}/`;

                  if (!settings || !settings.Settings || !settings.Settings.LmsUrl) {
                    this.showError();
                    return;
                  }

                  this.navigate(dict);
                },
                () => this.showError()
              );
          }
        },
        () => this.showError()
      );
    } else {
      this.navigate(dict);
    }
  }

  public ionViewDidLeave() {
    if (this.iab) {
      this.iab.hide();
    }
  }

  public ionViewWillEnter() {
    if (this.iab) {
      this.iab.show();
    }
  }

  public ngOnDestroy() {
    this.clearSubscriptions();

    this.loadingCtrl.dismiss();

    if (this.alert) {
      this.alert.dismiss().then(() => delete this.alert);
    }

    if (this.globalConfigs.isCordova) {
      this.browserTab.close();
    }

    if (this.iab) {
      try {
        this.iab.close();
      } catch (err) {}
      delete this.iab;
    }
  }

  private navigate(dict: { [key: string]: string }) {
    if (this.isLoading) {
      return;
    }

    this.loadingCtrl.dismiss().then(() => {
      let u: string = this.url;

      if (dict) {
        for (const key in dict) {
          if (dict.hasOwnProperty(key)) {
            if (!dict[key]) {
              this.showError();
              return;
            }

            u = u.replace(`{{${key}}}`, dict[key]);
          }
        }
      }

      if (this.pecOpenIn === 'iframe') {
        this.router.navigate(['/iframe'], { queryParams: { url: u } });
        return;
      }

      const isSchoolLink =
        u.indexOf('careered.com') > 0 ||
        u.indexOf('aiuniv.edu') > 0 ||
        u.indexOf('coloradotech.edu') > 0 ||
        u.indexOf('careeredonline.com') > 0 ||
        u.indexOf('ctuonline.edu') > 0 ||
        u.indexOf('aiuonline.edu') > 0;
      if (this.pecOpenIn === 'inapp') {
        if (isSchoolLink) {
          if (this.globalConfigs.isCordova) {
            if (this.iab) {
              this.iab.close();
              delete this.iab;
            }

            this.browserTab.isAvailable().then((result) => {
              if (result) {
                this.browserTab.openUrl(u);
              } else {
                if (this.globalConfigs.isIos) {
                  this.iab = this.inAppBrowser.create(
                    u,
                    '_blank',
                    'location=no,hideNavigationButtons=no,hideurlbar=yes,closebuttoncaption=Close,closebuttoncolor=#ffffff,enableViewportScale=yes,footer=no,footercolor=#000000'
                  );
                } else {
                  this.iab = this.inAppBrowser.create(
                    u,
                    '_blank',
                    'location=yes,hidden=no,toolbarcolor=#808080,navigationbuttoncolor=#ffffff,hideNavigationButtons=no,hideurlbar=yes,closebuttoncaption=Close,closebuttoncolor=#ffffff,footer=no,footercolor=#000000'
                  );
                }

                if (this.globalConfigs.isAndroid) {
                  this.iab.on('loadstop').subscribe(() => {
                    setTimeout(() => {
                      this.iab.show();
                    }, 3000);
                  });
                }

                this.iab.on('exit').subscribe(() => {
                  delete this.iab;
                });

                if (!this.subscriptions.isOffline) {
                  this.subscriptions.isOffline = this.storageService.getItem('isOffline').subscribe((isOffline) => {
                    if (this.iab) {
                      if (isOffline) {
                        this.iab.hide();
                      } else {
                        this.iab.show();
                      }
                    }
                  });
                }
              }
            });

            return;
          } else {
            this.globalConfigs.openUrlOutOfApp(u);
          }
        } else {
          this.globalConfigs.openUrlOutOfApp(u);
        }
      } else if (this.pecOpenIn === 'browser') {
        this.globalConfigs.openUrlOutOfApp(u);
      }
    });
  }

  private showError(text?: string) {
    this.isLoading = false;

    this.loadingCtrl.dismiss().then(() => {
      if (!text) {
        text = 'There was a problem authenticating your request. Please try again.';
      }

      this.alertCtrl
        .create({
          message: text,
          buttons: [
            {
              text: 'Close',
              handler: () => {
                delete this.alert;
              },
            },
          ],
        })
        .then((alert) => {
          this.alert = alert;
          this.alert.present();
        });
    });
  }

  private showLoading() {
    this.isLoading = true;
    return this.loadingCtrl.show('Please wait...');
  }

  private clearSubscriptions() {
    for (const key in this.subscriptions) {
      if (this.subscriptions[key] && this.subscriptions[key].unsubscribe) {
        this.subscriptions[key].unsubscribe();
        delete this.subscriptions[key];
      }
    }
  }
}
