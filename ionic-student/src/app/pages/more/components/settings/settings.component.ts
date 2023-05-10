import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BasePageComponent } from '../../../../shared/components/base-page-component/base-page.component';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { StorageService } from '../../../../shared/services/storage.service';
import { ModalController, ToastController, ViewDidEnter, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { MobileService } from '../../../../data/services/mobile.service';
import { MobileSettings, Settings } from 'src/app/data/types/mobile-settings.type';
import { AuthService } from '../../../../data/services/auth.service';
import { AuthType } from '../../../../shared/enums/auth-type.enum';
import { BiometricsService } from '../../../../shared/services/biometrics.service';
import { MessengerService } from '../../../../data/services/messenger.service';
import {
  AppNotificationStatus,
  PushNotificationsService,
} from '../../../../shared/services/push-notifications.service';
import { PecAlertService } from '../../../../shared/services/pec-alert.service';
import { TrackingService } from 'src/app/shared/services/tracking.service';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { PasscodeModalComponent } from '../../../../shared/components/passcode-modal/passcode-modal.component';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { CrashlyticsService } from 'src/app/shared/services/crashlytics.service';
import { UserService } from 'src/app/data/services/user.service';
import { filter } from 'rxjs/operators';
import { SecondaryAuthStorageObject } from '../../../../data/types/auth.type';
import { combineLatest } from 'rxjs';
import { DebugModalComponent } from '../../../../shared/components/debug-modal/debug-modal.component';

@Component({
  selector: 'pec-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [OpenNativeSettings],
})
export class SettingsComponent
  extends BasePageComponent
  implements OnInit, OnDestroy, ViewDidEnter, ViewWillEnter, ViewDidLeave
{
  public campusName: string;
  public authenticationMode = 0;
  public passcodeToggled = false;
  public isPushNotificationSupported = false;
  public isAppNotificationDisabled = false;
  public isMessengerPushNotificationSupported = false;
  public messengerNotificationToggled = false;
  public campusSettings: Settings;
  public deviceChannelId: string = null;
  public registrationToken: string;
  public campusPointziSetting: boolean;
  public showDevOptions: boolean;

  private _fingerprintToggledModel = false;
  private fingerprintToggled = false;
  private _passcodeToggledModel = false;
  private _univNotificationToggledModel = false;
  private _messengerNotificationToggledModel = false;
  private fingerprintRegistered = false;
  private passcodeModal: HTMLIonModalElement;
  private showLoading: boolean;
  private inView: boolean;
  private mobileSettings: MobileSettings;
  private registerFingerprintVisible: boolean;
  private alert: HTMLIonAlertElement;
  private displayingAlertToEnableNotification = false;
  private univNotificationToggled = false;

  private prevUrl: string;
  private debugModal: HTMLIonModalElement;

  public get fingerprintToggledModel(): boolean {
    return this._fingerprintToggledModel;
  }

  public set fingerprintToggledModel(value: boolean) {
    this._fingerprintToggledModel = value;

    if (this.fingerprintToggled !== value) {
      this.toggleFingerprint();
    }
  }

  public get passcodeToggledModel(): boolean {
    return this._passcodeToggledModel;
  }

  public set passcodeToggledModel(value: boolean) {
    this._passcodeToggledModel = value;

    if (this.passcodeToggled !== value) {
      this.togglePasscode();
    }
  }

  public get univNotificationToggledModel(): boolean {
    return this._univNotificationToggledModel;
  }

  public set univNotificationToggledModel(value: boolean) {
    this._univNotificationToggledModel = value;
    this._messengerNotificationToggledModel = value;

    if (
      (this.univNotificationToggled !== value && !this.isAppNotificationDisabled) ||
      (this.isAppNotificationDisabled && value)
    ) {
      this.toggleUniversityNotification();

      this.trackingService.trackEvent({
        view: 'Settings View',
        category: 'Settings View',
        action: 'Toggled University Notifications',
        label: value ? 'On' : 'Off',
        value: '',
      });
    } else {
      this.verifyUnivNotificationValue();
    }
  }

  public get messengerNotificationToggledModel(): boolean {
    return this._messengerNotificationToggledModel;
  }

  public set messengerNotificationToggledModel(value: boolean) {
    this._messengerNotificationToggledModel = value;

    if (
      (this.messengerNotificationToggled !== value && !this.isAppNotificationDisabled) ||
      (this.isAppNotificationDisabled && value)
    ) {
      this.toggleMessengerNotification();

      this.trackingService.trackEvent({
        view: 'Settings View',
        category: 'Settings View',
        action: 'Toggled Messenger Notifications',
        label: value ? 'On' : 'Off',
        value: '',
      });
    } else {
      this.verifyMessengerNotificationValue();
    }
  }

  public get authTypeName(): string {
    if (this.globalConfigs.isAndroid && this.authenticationMode > 1) {
      return 'Fingerprint';
    }

    if (this.globalConfigs.isIos && this.authenticationMode > 1) {
      switch (this.authenticationMode) {
        case 3:
          return 'Face ID';
        case 2:
          return 'Touch ID';
      }
    }

    return null;
  }

  constructor(
    public globalConfigs: GlobalConfigsService,
    private userService: UserService,
    private storage: StorageService,
    private mobileService: MobileService,
    private authService: AuthService,
    private biometricsService: BiometricsService,
    private pushNotificationsService: PushNotificationsService,
    private chatService: MessengerService,
    private crashlyticsService: CrashlyticsService,
    private modalCtrl: ModalController,
    private alertCtrl: PecAlertService,
    private trackingService: TrackingService,
    private toastCtrl: ToastController,
    private zone: NgZone,
    private openSettings: OpenNativeSettings,
    private fingerPrintService: FingerprintAIO,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly router: Router
  ) {
    super();

    this.campusName = globalConfigs.brandName;
    this.showDevOptions = !globalConfigs.isProduction;
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((x) => (this.prevUrl = JSON.stringify(x)));
  }

  public openDebugMenu() {
    if (this.globalConfigs.isProduction) return;

    if (!this.debugModal) {
      this.modalCtrl
        .create({
          component: DebugModalComponent,
        })
        .then((modal) => {
          this.debugModal = modal;

          this.debugModal.onDidDismiss().then(() => {
            delete this.debugModal;
          });

          this.debugModal.present();
        });
    }
  }

  public clearCache() {
    this.storage.removeAll();
    this.globalConfigs.clearCache();
    this.authService.logout();

    this.router.navigate(['/login'], {
      replaceUrl: true,
      queryParams: { isSignOutClicked: true },
    });
  }

  public crashApp() {
    this.crashlyticsService.logError('Manual Crash', this.router.url, this.prevUrl);
    this.crashlyticsService.crash();
  }

  public openPasscodePage() {
    if (!this.passcodeModal) {
      this.authService.getSecondaryAuth.pipe(first()).subscribe((auth: SecondaryAuthStorageObject) => {
        this.modalCtrl
          .create({
            component: PasscodeModalComponent,
            componentProps: {
              isPasscodeToggled: true,
              secondaryAuthStorageObject: auth,
              completeCallback: this.authService.registerSecondaryAuth,
            },
          })
          .then((modal) => {
            this.passcodeModal = modal;

            this.passcodeModal.onDidDismiss().then(() => {
              this.verifyPasscodeValue();
              delete this.passcodeModal;
            });

            this.passcodeModal.present();
          });
      });
    }
  }

  public ngOnInit() {
    if (!this.globalConfigs.isImpersonatedUser) {
      this.subscriptions.fingerprintRegistered = this.storage
        .getItem<number>('fingerprintRegistered')
        .subscribe((value: number) => {
          if (value != null && !value) {
            if (this.fingerprintToggled) {
              this.fingerprintToggled = false;
              this._fingerprintToggledModel = false;
              this.authService.clearSecondaryAuth();
            }
          }
        });
    }
    this.userService
      .info()
      .pipe(first())
      .subscribe((user) => {
        this.showDevOptions = !this.globalConfigs.isProduction || user.UserName === 'demo.student';
      });

    this.loadData();
  }

  public ngOnDestroy() {
    this.clearSubscriptions();

    if (this.passcodeModal) {
      this.passcodeModal.dismiss();
      delete this.passcodeModal;
    }
  }

  public ionViewDidLeave() {
    this.inView = false;

    if (this.registerFingerprintVisible) {
      this.registerFingerprintVisible = false;
      this.verifyFingerprintValue();
    }
  }

  public ionViewDidEnter() {
    this.inView = true;

    if (!this.globalConfigs.isImpersonatedUser) {
      this.isPushNotificationSupported = this.globalConfigs.isCordova;

      // Switch notification toggle off if app notification is disabled
      if (!this.subscriptions.appNotificationStatus) {
        this.subscriptions.appNotificationStatus = this.pushNotificationsService.systemPushNotificationStatus.subscribe(
          (appNotificationStatus) => {
            this.isAppNotificationDisabled =
              appNotificationStatus === AppNotificationStatus.DISABLE ||
              appNotificationStatus === AppNotificationStatus.NONE;
            this.verifyUnivNotificationValue();
            this.verifyMessengerNotificationValue();

            this.changeDetectorRef.markForCheck();
          }
        );
      }

      if (!this.subscriptions.chatEnabled) {
        this.subscriptions.chatEnabled = this.chatService.sendbirdEnabled.subscribe((chatEnabled: number) => {
          if (chatEnabled === 1) {
            if (this.isPushNotificationSupported) {
              this.isMessengerPushNotificationSupported = true;
            }
          }
        });
      }

      if (!this.subscriptions.pushNotificationEnabled) {
        this.subscriptions.pushNotificationEnabled = combineLatest([
          this.pushNotificationsService.universityPushNotificationEnabled,
          this.pushNotificationsService.messengerPushNotificationEnabled,
        ]).subscribe(([universityNotificationEnabled, messengerNotificationEnabled]) => {
          if (!universityNotificationEnabled || this.isAppNotificationDisabled) {
            this.univNotificationToggled = false;
            this.univNotificationToggledModel = false;
          } else {
            this.univNotificationToggled = true;
            this.univNotificationToggledModel = true;
          }

          if (universityNotificationEnabled && messengerNotificationEnabled && !this.isAppNotificationDisabled) {
            this.messengerNotificationToggled = true;
            this.messengerNotificationToggledModel = true;
          } else {
            this.messengerNotificationToggled = false;
            this.messengerNotificationToggledModel = false;
          }

          this.verifyUnivNotificationValue();
          this.verifyMessengerNotificationValue();
        });
      }

      if (!this.subscriptions.deviceChannelId) {
        this.subscriptions.deviceChannelId = this.pushNotificationsService.deviceChannelId.subscribe(
          (deviceChannelId) => {
            this.deviceChannelId = deviceChannelId;
          }
        );
      }

      if (!this.subscriptions.registrationToken) {
        this.subscriptions.registrationToken = this.authService.getRegistrationToken().subscribe((result) => {
          this.registrationToken = result ? result : undefined;
        });
      }

      if (this.isPushNotificationSupported) {
        this.pushNotificationsService.verifySystemPushNotificationsStatus();
      }

      this.mobileService
        .settings()
        .pipe(first())
        .subscribe((settings) => {
          if (settings) {
            this.mobileSettings = settings;
          }
        });

      const campusPointziSetting = this.mobileSettings.CampusSettings.find((o) => {
        return o.Campus && o.Campus.CampusId === this.globalConfigs.sycampusid;
      });

      this.campusPointziSetting = campusPointziSetting.Settings.ShowPointzi.toLowerCase() === 'true';

      if (!this.subscriptions.appStatus) {
        this.subscriptions.appStatus = this.globalConfigs.appStatus.subscribe((v: string) => {
          if (v) {
            if (v === 'resume') {
              if (this.inView) {
                this.zone.run(() => {
                  this.refreshFingerprintStatus();
                  this.verifyFingerprintValue();
                });
              }
            } else if (v === 'pause') {
              if (this.inView) {
                this.zone.run(() => {
                  if (this.registerFingerprintVisible) {
                    this.registerFingerprintVisible = false;
                    this.verifyFingerprintValue();
                  }
                });
              }
            }
          }
        });
      }
    }
  }

  public ionViewWillEnter() {
    if (!this.globalConfigs.isImpersonatedUser) {
      this.refreshFingerprintStatus().then(() => {
        this.subscriptions.getSecondaryAuth = this.authService.getSecondaryAuth.subscribe(
          (auth: SecondaryAuthStorageObject) => {
            if (auth && !auth.Disabled) {
              if (auth.AuthType === AuthType.Passcode) {
                this.passcodeToggled = true;
                this.passcodeToggledModel = true;
              } else if (auth.AuthType === AuthType.Standard) {
                if (this.fingerprintRegistered) {
                  this.fingerprintToggled = true;
                  this.fingerprintToggledModel = true;
                } else {
                  this.authService.clearSecondaryAuth();
                }
              }
            } else {
              this.passcodeToggled = false;
              this.passcodeToggledModel = false;

              this.fingerprintToggled = false;
              this.fingerprintToggledModel = false;
            }
          },
          () => {
            this.passcodeToggledModel = false;

            this.fingerprintToggled = false;
            this.fingerprintToggledModel = false;
          }
        );

        this.verifyPasscodeValue();
        this.verifyFingerprintValue();
      });
    }
  }

  private loadData() {
    this.showLoading = true;

    this.mobileService
      .campusSettings()
      .pipe(first())
      .subscribe(
        (settings) => {
          if (settings && settings.Settings) {
            this.campusSettings = settings.Settings;
          }
        },
        () => {
          this.showLoading = false;
        }
      );
  }

  private verifyFingerprintValue() {
    setTimeout(() => {
      if (this.fingerprintToggledModel !== this.fingerprintToggled) {
        this.fingerprintToggledModel = this.fingerprintToggled;
      }
    }, 0);
  }

  private refreshFingerprintStatus() {
    return new Promise<void>((resolve) => {
      this.biometricsService.fingerprintSupport().then(
        (data) => {
          if (data && data.type) this.authenticationMode = data.type === 'face' ? 3 : 2;

          this.fingerprintRegistered = true;
          resolve();
        },
        (error) => {
          // for this type of errors user still can go to device Settings to enable biometrics
          // so we still set this.fingerprintRegistered = true
          if (
            error?.code === this.fingerPrintService.BIOMETRIC_UNAVAILABLE ||
            error?.code === this.fingerPrintService.BIOMETRIC_NOT_ENROLLED ||
            error?.message?.indexOf('locked out') !== -1
          ) {
            // BIOMETRIC_UNAVAILABLE means user dismissed initial Face ID prompt
            // BIOMETRIC_NOT_ENROLLED means biometrics are available on the device, but user has not enrolled to use it or disabled it

            // on error, we have to detect Face ID manually
            this.authenticationMode = this.biometricsService.getAuthTypeFromDeviceModel() === 'face' ? 3 : 2;
            this.fingerprintRegistered = true;
          } else {
            this.authenticationMode = 1;
          }

          resolve();
          return;
        }
      );
    });
  }

  private verifyPasscodeValue() {
    setTimeout(() => {
      if (this.passcodeToggledModel !== this.passcodeToggled) {
        this.passcodeToggledModel = this.passcodeToggled;
      }
    }, 0);
  }

  private toggleFingerprint() {
    if (this.fingerprintToggled) {
      this.alertCtrl
        .show({
          header: `Disable ${this.authTypeName}`,
          message: `${this.authTypeName} will no longer be available to sign into this app. Are you sure you would like it off?`,
          onDismiss: () => {
            this.verifyFingerprintValue();
          },
          buttons: [
            {
              text: this.globalConfigs.isIos ? 'No' : 'Cancel',
              action: () => {
                this.verifyFingerprintValue();
              },
            },
            {
              text: this.globalConfigs.isIos ? 'Yes' : 'OK',
              action: () => {
                this.authService.clearSecondaryAuth().then(
                  () => {
                    this.trackingService.trackEvent({
                      view: 'Settings View',
                      category: 'Settings View',
                      action: `Toggled ${this.authTypeName}`,
                      label: 'Off',
                      value: '',
                    });

                    this.toastCtrl
                      .create({
                        message: `${this.authTypeName} has been turned off.`,
                        duration: 3000,
                        position: 'bottom',
                        cssClass: 'pec-toast-message',
                      })
                      .then((toast) => toast.present());

                    this.verifyFingerprintValue();
                  },
                  () => {
                    this.verifyFingerprintValue();
                  }
                );
              },
            },
          ],
        })
        .then((alert) => {
          this.alert = alert;
        });
    } else {
      this.offerBiometrics();
    }
  }

  private offerBiometrics() {
    this.registerFingerprintVisible = true;

    this.authService.offerFingerprint(true).then(
      () => {
        this.registerFingerprintVisible = false;
        this.verifyFingerprintValue();

        this.trackingService.trackEvent({
          view: 'Settings View',
          category: 'Settings View',
          action: `Toggled ${this.authTypeName}`,
          label: 'On',
          value: '',
        });
      },
      () => {
        this.registerFingerprintVisible = false;
        this.verifyFingerprintValue();
      }
    );
  }

  private togglePasscode() {
    if (this.passcodeToggled) {
      this.alertCtrl
        .show({
          header: 'Disable Passcode',
          message: 'Passcode will no longer be available to sign into this app. Are you sure you would like it off?',
          onDismiss: () => {
            this.verifyPasscodeValue();
          },
          buttons: [
            {
              text: this.globalConfigs.isIos ? 'No' : 'Cancel',
              action: () => {
                this.verifyPasscodeValue();
              },
            },
            {
              text: this.globalConfigs.isIos ? 'Yes' : 'OK',
              action: () => {
                this.authService.clearSecondaryAuth().then(
                  () => {
                    this.toastCtrl
                      .create({
                        message: 'Passcode has been turned off.',
                        duration: 3000,
                        position: 'bottom',
                        cssClass: 'pec-toast-message',
                      })
                      .then((toast) => toast.present());

                    this.trackingService.trackEvent({
                      view: 'Settings View',
                      category: 'Settings View',
                      action: 'Toggled Passcode',
                      label: 'Off',
                      value: '',
                    });

                    this.verifyPasscodeValue();
                  },
                  () => {
                    this.verifyPasscodeValue();
                  }
                );
              },
            },
          ],
        })
        .then((alert) => {
          this.alert = alert;
        });
    } else {
      this.openPasscodePage();
    }
  }

  private toggleUniversityNotification() {
    if (this.isAppNotificationDisabled || this.globalConfigs.isIos) {
      this.showAlertToEnablePushNotificationFromSettings().catch(() => {
        this._univNotificationToggledModel = this.univNotificationToggled;
        this._messengerNotificationToggledModel = this.messengerNotificationToggled;
      });
    } else if (this.univNotificationToggled) {
      //opt-out university notifications
      this.pushNotificationsService.disableUniversityPushNotification().then(
        () => {
          this.verifyUnivNotificationValue();
        },
        () => {
          this.verifyUnivNotificationValue();
        }
      );
    } else {
      if (this.globalConfigs.isAndroid) {
        //removed the initial flag to disallow university notification if exists
        this.pushNotificationsService.disallowUniversityNotification
          .pipe(first())
          .subscribe((disallowUnivNotification: boolean) => {
            if (disallowUnivNotification) {
              this.storage.removeItem('disallowUniversityNotification');
            }
          });
      }

      this.pushNotificationsService.enableUniversityPushNotification(false, true).then(
        () => {
          this.verifyUnivNotificationValue();
        },
        () => {
          this.verifyUnivNotificationValue();
        }
      );
    }
  }

  private verifyUnivNotificationValue() {
    this.zone.run(() => {
      if (this.isAppNotificationDisabled) {
        this.univNotificationToggled = false;
      } else if (this._univNotificationToggledModel !== this.univNotificationToggled) {
        this.univNotificationToggled = this._univNotificationToggledModel;
      }

      this.changeDetectorRef.markForCheck();
    });
  }

  private toggleMessengerNotification() {
    if (this.isAppNotificationDisabled) {
      this.showAlertToEnablePushNotificationFromSettings().catch(() => {
        this._univNotificationToggledModel = this.univNotificationToggled;
        this._messengerNotificationToggledModel = this.messengerNotificationToggled;
      });
    } else if (this.messengerNotificationToggled) {
      this.pushNotificationsService.disableMessengerPushNotification(false).then(
        () => {
          this.verifyMessengerNotificationValue();
        },
        () => {
          this.verifyMessengerNotificationValue();
        }
      );
    } else {
      //validate the request
      if (!this.univNotificationToggled) {
        this.toastCtrl
          .create({
            header: 'University Notifications must be ON in order to enable Messenger Notifications.',
            duration: 3000,
            position: 'bottom',
            cssClass: 'pec-toast-message',
          })
          .then((toast) => {
            toast.present().then(() => {
              this._messengerNotificationToggledModel = false;
              this.verifyMessengerNotificationValue();
            });
          });
      } else {
        this.pushNotificationsService.enableMessengerPushNotification().then(
          () => {
            this.verifyMessengerNotificationValue();
          },
          () => {
            this.verifyMessengerNotificationValue();
          }
        );
      }
    }
  }

  private verifyMessengerNotificationValue() {
    this.zone.run(() => {
      if (this.isAppNotificationDisabled) {
        this.messengerNotificationToggled = false;
      } else if (this._messengerNotificationToggledModel !== this.messengerNotificationToggled) {
        this.messengerNotificationToggled = this._messengerNotificationToggledModel;
      }

      this.changeDetectorRef.markForCheck();
    });
  }

  private showAlertToEnablePushNotificationFromSettings() {
    return new Promise<void>((resolve, reject) => {
      this.displayingAlertToEnableNotification = true;
      const alertButtons = [
        {
          text: 'Cancel',
          action: () => {
            reject();
          },
        },
      ];

      if (this.globalConfigs.isCordova) {
        const alertButton = {
          text: 'OK',
          action: () => {
            //goto settings
            this.openSettings.open('settings').catch(() => {
              //failed to open device settings
              this.alertCtrl.show({
                header: 'Unable to Open Settings!',
                message:
                  'To register this device for push notification, please turn on the push notification for this app in device settings.',
                buttons: [
                  {
                    text: 'OK',
                    action: () => {},
                  },
                ],
              });
            });

            resolve();
          },
        };

        alertButtons.push(alertButton);
      }

      this.alertCtrl.show({
        header: `Leaving ${this.globalConfigs.brandName} Student Mobile`,
        message: `Changes to push notification settings must be made in your device\'s system settings.  Tap OK to be redirected there now.`,
        cssClass: '',
        buttons: alertButtons,
        onDismiss: () => {
          this.displayingAlertToEnableNotification = false;
        },
      });
    });
  }
}
