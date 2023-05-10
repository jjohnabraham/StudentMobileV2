import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { concatMap, first, map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { GlobalConfigsService } from '../../shared/services/global-configs.service';
import { StorageService } from '../../shared/services/storage.service';
import { PecHttpService } from '../../shared/services/pec-http.service';
import {
  LoginObject,
  LoginResponse,
  RegisterSecAuthObject,
  SecondaryAuthLoginObject,
  SecondaryAuthStorageObject,
  UserStorageObject,
} from '../types/auth.type';
import { BiometricsService } from '../../shared/services/biometrics.service';
import { MessengerService } from './messenger.service';
import { PushNotificationsService } from '../../shared/services/push-notifications.service';
import { UserService } from './user.service';
import { User } from '../types/user.type';
import { TrackingService } from '../../shared/services/tracking.service';
import { PecAlertOptions, PecAlertService } from '../../shared/services/pec-alert.service';
import { ModalController, ToastController } from '@ionic/angular';
import { PecLoaderService } from '../../shared/services/pec-loader.service';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { PasscodeModalComponent } from '../../shared/components/passcode-modal/passcode-modal.component';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public preventSecondaryStorage: boolean;

  private readonly rmKey = 'com.careered.rememberMeLogin';
  private readonly secondaryAuthStorageObjectKey = 'secondaryAuthStorageObject';
  private readonly userStorageObjectKey = 'UserStorageObject';
  private readonly registrationTokenKey = 'RegistrationToken';
  private isSettingsPage: boolean;
  private preventNoFingerprintMessageStorage: boolean;
  private alert: HTMLIonAlertElement;
  private passcodeModal: HTMLIonModalElement;

  constructor(
    private http: PecHttpService,
    private storage: StorageService,
    private globalConfigs: GlobalConfigsService,
    private biometricsService: BiometricsService,
    private notificationsService: PushNotificationsService,
    private messengerService: MessengerService,
    private userService: UserService,
    private trackingService: TrackingService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: PecLoaderService,
    private openSettings: OpenNativeSettings,
    private alertCtrl: PecAlertService,
    private fingerPrintService: FingerprintAIO,
    private modalCtrl: ModalController
  ) {}

  public get rememberMeLogin() {
    return this.storage.getItem<LoginObject>(this.rmKey).pipe(
      map((o: LoginObject) => {
        let lo: LoginObject;

        if (!o) {
          lo = new LoginObject();
          lo.RememberMe = true;
        } else {
          lo = o;
        }

        if (lo.SourceSystemId > 0 && lo.CampusId > 0) {
          this.globalConfigs.ssid = lo.SourceSystemId;
          this.globalConfigs.sycampusid = lo.CampusId;
        }

        return lo;
      })
    );
  }

  public get getSecondaryAuth() {
    return this.storage.getItem<SecondaryAuthStorageObject>(this.secondaryAuthStorageObjectKey);
  }

  private get isNoFingerprintMessageStorageDisplayed() {
    return this.storage.getItem<boolean>('isNoFingerprintMessageStorageDisplayed');
  }

  public loginPost(input: LoginObject): Observable<LoginResponse> {
    const inputCopy: LoginObject = { ...input, Password: '' };
    this.storage.setItem<LoginObject>(this.rmKey, inputCopy, true);

    this.globalConfigs.ssid = inputCopy.SourceSystemId;
    this.globalConfigs.sycampusid = inputCopy.CampusId;

    input.DeviceSpecificId = this.globalConfigs.deviceSpecificId;

    return this.http.request({
      url: `api/login/${input.SourceSystemId}/${input.CampusId}`,
      signature: 'api/login/${input.SourceSystemId}/${input.CampusId}',
      method: 'Post',
      body: input,
    });
  }

  public secondaryAuthLogin(i: SecondaryAuthStorageObject, passcode: string): Observable<LoginResponse> {
    const l = new SecondaryAuthLoginObject();

    l.CampusId = i.CampusId;
    l.SourceSystemId = i.SourceSystemId;
    l.DeviceSpecificId = this.globalConfigs.deviceSpecificId;
    l.AppSpecificId = this.globalConfigs.appSpecificId;
    l.AuthType = i.AuthType;
    l.AuthToken = passcode;
    l.ThemeId = this.globalConfigs.themeId;
    l.UserName = i.UserName;

    this.globalConfigs.ssid = i.SourceSystemId;
    this.globalConfigs.sycampusid = i.CampusId;

    return this.http.request({
      url: `api/login/${l.SourceSystemId}/${l.CampusId}`,
      signature: 'api/login/${l.SourceSystemId}/${l.CampusId}',
      method: 'Post',
      body: l,
    });
  }

  public registerSecondaryAuth(input: RegisterSecAuthObject) {
    return this.rememberMeLogin.pipe(
      concatMap((item) => {
        if (item) {
          input.UserName = item.UserName;
        }

        return this.http
          .request({
            url: `api/secondaryauth/register`,
            signature: 'api/secondaryauth/register',
            method: 'Post',
            body: input,
          })
          .pipe(
            map((success: boolean) => {
              if (success) {
                const s = new SecondaryAuthStorageObject();
                s.CampusId = this.globalConfigs.sycampusid;
                s.SourceSystemId = this.globalConfigs.ssid;
                s.AuthType = input.AuthType;
                s.UserName = input.UserName;

                this.storage.setItem(this.secondaryAuthStorageObjectKey, s, true);
              }

              return success;
            })
          );
      })
    );
  }

  public enableSecondaryAuth(auth?: SecondaryAuthStorageObject) {
    if (!auth) {
      return new Promise<boolean>((resolve, reject) => {
        this.storage
          .getItem<SecondaryAuthStorageObject>(this.secondaryAuthStorageObjectKey)
          .pipe(first())
          .subscribe(
            (o) => {
              if (o) {
                o.Disabled = false;
                return this.storage.setItem(this.secondaryAuthStorageObjectKey, o, true).then(
                  () => {
                    resolve(true);
                  },
                  () => {
                    reject();
                  }
                );
              } else {
                this.clearSecondaryAuth();
                resolve(true);
              }
            },
            (error) => reject(error)
          );
      });
    } else {
      auth.Disabled = false;
      return this.storage.setItem(this.secondaryAuthStorageObjectKey, auth, true);
    }
  }

  public disableSecondaryAuth(auth?: SecondaryAuthStorageObject) {
    if (!auth) {
      return new Promise<boolean>((resolve, reject) => {
        this.storage
          .getItem<SecondaryAuthStorageObject>(this.secondaryAuthStorageObjectKey)
          .pipe(first())
          .subscribe(
            (o) => {
              if (o) {
                o.Disabled = true;
                return this.storage.setItem(this.secondaryAuthStorageObjectKey, o, true).then(
                  () => {
                    resolve(true);
                  },
                  () => {
                    reject();
                  }
                );
              } else {
                this.clearSecondaryAuth();
                resolve(true);
              }
            },
            (error) => reject(error)
          );
      });
    } else {
      auth.Disabled = true;
      return this.storage.setItem(this.secondaryAuthStorageObjectKey, auth, true);
    }
  }

  public clearSecondaryAuth() {
    this.biometricsService.clearFingerprintRegistered();

    return this.storage.removeItem(this.secondaryAuthStorageObjectKey);
  }

  public sltLogin(slt, user?, ssid?, syCampusId?) {
    if (slt) {
      this.logout();
      this.userService
        .info({ slt })
        .pipe(first())
        .subscribe(
          (u: User) => {
            if (u.IsStudent) {
              this.globalConfigs.ssid = ssid ? ssid : u.SourceSystemId;
              this.globalConfigs.sycampusid = syCampusId ? syCampusId : u.SyCampusId;

              this.trackingService.trackEvent({
                view: 'Login Page',
                category: 'Login Page',
                action: 'Impersonation Login',
                label: '',
                value: '',
              });

              this.router.navigate(['/tabs/home']);
            } else {
              this.router.navigate(['/error/technical-difficulties'], { state: { errorData: 'Not a student' } });
            }
          },
          (error) => {
            this.router.navigate(['/error/technical-difficulties/' + error.error], { state: { errorData: error } });
          }
        );
    } else {
      this.router.navigate(['/error/technical-difficulties/NOSLTPROVIDED']);
    }
  }

  public clearRememberMeLogin() {
    const input: LoginObject = new LoginObject();

    return this.storage.setItem<LoginObject>(this.rmKey, input, true);
  }

  public logout(): Observable<boolean> {
    this.http.clearHeaders();
    this.http.clearCache();

    this.messengerService.disconnect();
    this.notificationsService.unsubscribeEvents();

    return this.http.request({
      url: `api/logout`,
      signature: 'api/logout',
      method: 'Get',
      config: { cache: false },
    });
  }

  public storeUserInfo(user: UserStorageObject) {
    if (!(user && user.UserIdExternal && user.UserName)) {
      return false;
    }

    const userCopy = { ...user };

    this.storage.setItem(this.userStorageObjectKey, userCopy, true);

    return true;
  }

  public getUserInfo() {
    return this.storage.getItem<UserStorageObject>(this.userStorageObjectKey);
  }

  public getRegistrationToken() {
    return this.storage.getItem<string>(this.registrationTokenKey);
  }

  public setRegistrationToken(token: string) {
    return this.storage.setItem<string>(this.registrationTokenKey, token, true);
  }

  // Check auth headers stored in sessionStorage
  public isAuthenticated() {
    const authHeadersJson = window.sessionStorage.getItem('authHeaders');

    if (!authHeadersJson) return false;

    let result = false;
    const authHeaders = JSON.parse(authHeadersJson);
    for (const authHeadersKey in authHeaders) {
      if (authHeaders.hasOwnProperty(authHeadersKey)) {
        if (
          authHeadersKey.toLowerCase().indexOf('lmsauth-') === 0 ||
          authHeadersKey.toLowerCase().indexOf('authorization') === 0
        ) {
          const value = authHeaders[authHeadersKey];
          result = !!value; // if auth headers have one of auth headers and it has value, then we are authorized
        }
      }
    }

    return result;
  }

  public offerFingerprint(isSettingsPage?: boolean, isRetry?: boolean) {
    this.preventSecondaryStorage = false;
    this.isSettingsPage = isSettingsPage;

    return new Promise<boolean>((resolve, reject) => {
      this.biometricsService.fingerprintSupport().then(
        (data) => {
          const authTypeName = this.biometricsService.getAuthTypeNameFromType(data.type);

          let title = '';
          let message = '';
          if (isRetry) {
            title = this.globalConfigs.isIos ? authTypeName : `Unable to Recognize ${authTypeName}`;
            message = `${authTypeName} was not recognized. Please try again`;
          } else {
            title = this.globalConfigs.isIos ? `Enable ${authTypeName}` : `Activate ${authTypeName}`;
            message = this.globalConfigs.isIos
              ? `For convenience, you can use ${authTypeName} to log into ${this.globalConfigs.brandName} Student Mobile. To configure, place a finger on the ${authTypeName} sensor now. NOTE: All users with a registered fingerprint on this device will have access to your ${this.globalConfigs.brandName} Student Mobile account.`
              : `Did you know that you can use your fingerprint to log into ${this.globalConfigs.brandName} Student Mobile? NOTE: All users with a registered fingerprint on this device will have access to your ${this.globalConfigs.brandName} Student Mobile account.`;
          }

          this.biometricsService.storeFingerprint(title, message).then(
            (hash) => {
              const r = new RegisterSecAuthObject();
              r.DeviceSpecificId = this.globalConfigs.deviceSpecificId;
              r.AppSpecificId = this.globalConfigs.appSpecificId;
              r.AuthToken = hash;
              r.AuthType = 1;

              this.loadingCtrl.show('Please wait...').then(() => {
                this.registerSecondaryAuth(r)
                  .pipe(first())
                  .subscribe(
                    (success) => {
                      this.loadingCtrl.dismiss().then(() => {
                        if (success) {
                          this.toastCtrl
                            .create({
                              message: `${authTypeName} was successfully configured. You can change this option in Settings via the More tab.`,
                              duration: 4000,
                              position: 'bottom',
                              cssClass: 'pec-toast-message',
                            })
                            .then((toast) => toast.present());

                          this.biometricsService.setFingerprintRegistered();
                          this.setSecondaryStorage();
                          resolve(true);
                        } else {
                          this.setSecondaryStorage();

                          this.toastCtrl
                            .create({
                              message: `${authTypeName} was NOT successfully saved. Please try again`,
                              duration: 3000,
                              position: 'bottom',
                              cssClass: 'pec-toast-message',
                            })
                            .then((toast) => toast.present());

                          reject();
                        }
                      });
                    },
                    (error) => {
                      this.loadingCtrl.dismiss().then(() => {
                        this.setSecondaryStorage();

                        this.toastCtrl
                          .create({
                            message: `${authTypeName} was NOT successfully saved. Please try again`,
                            duration: 3000,
                            position: 'bottom',
                            cssClass: 'pec-toast-message',
                          })
                          .then((toast) => toast.present());

                        reject(error);
                      });
                    }
                  );
              });
            },
            (error) => {
              this.handleBiometricsError(error, resolve, reject);
            }
          );
        },
        (error) => {
          const type = this.biometricsService.getAuthTypeFromDeviceModel();

          // special case for iOS device with Face ID
          // error code is BIOMETRIC_UNAVAILABLE when user has dismissed initial Face ID prompt and is trying to enable it from app Settings again
          // in this case user must go to device Settings and enable Face ID for our app manually
          if (this.isSettingsPage && error?.code === this.fingerPrintService.BIOMETRIC_UNAVAILABLE && type === 'face') {
            this.userMustGoToSettings(type);
            resolve(true);
          } else {
            this.handleBiometricsError(error, resolve, reject);
          }
        }
      );
    });
  }

  private handleBiometricsError(error, resolve, reject) {
    if (error) {
      if (error.code === this.fingerPrintService.BIOMETRIC_AUTHENTICATION_FAILED) {
        // retry auth attempt
        this.offerFingerprint(this.isSettingsPage, true).then(
          () => resolve(),
          (error2) => reject(error2)
        );
        return;
      } else if (
        error.code === this.fingerPrintService.BIOMETRIC_DISMISSED ||
        error.code === this.fingerPrintService.BIOMETRIC_UNAVAILABLE
      ) {
        // on iOS with Face ID error code is BIOMETRIC_UNAVAILABLE when user has dismissed initial Face ID prompt
        // if face ID was dismissed during initial prompt, user won't be able to enable it from settings page because of this error
        this.setSecondaryStorage();
        resolve();
      } else if (
        error.code === this.fingerPrintService.BIOMETRIC_LOCKED_OUT ||
        error.code === this.fingerPrintService.BIOMETRIC_LOCKED_OUT_PERMANENT ||
        (error.message && error.message.indexOf('locked out') !== -1)
      ) {
        this.showAlert(
          {
            header: '',
            message: 'Too many failed attempts. Try again later',
            buttons: [
              {
                text: 'OK',
                action: () => this.setSecondaryStorage(),
              },
            ],
            enableBackdropDismiss: false,
          },
          true
        );

        resolve();
      } else if (
        error.code === this.fingerPrintService.BIOMETRIC_NOT_ENROLLED ||
        (error.message && error.message.indexOf('one biometric must be enrolled') !== -1)
      ) {
        // biometrics not registered, user must go to settings
        // when BIOMETRIC_NOT_ENROLLED plugin won't tell whether it's Touch ID or Face ID device
        // on error, we have to detect Face ID manually
        const type = this.biometricsService.getAuthTypeFromDeviceModel();
        this.userMustGoToSettings(type);
        resolve();
      } else {
        // Cordova is not available (web) or device doesn't support biometrics
        this.setSecondaryStorage();

        this.getSecondaryAuth.pipe(first()).subscribe((auth: SecondaryAuthStorageObject) => {
          this.openPasscodePage(auth);
        });

        resolve();
      }
    }

    reject(error);
  }

  private openPasscodePage(auth: SecondaryAuthStorageObject) {
    if (!this.passcodeModal) {
      this.modalCtrl
        .create({
          component: PasscodeModalComponent,
          componentProps: {
            secondaryAuthStorageObject: auth,
            completeCallback: this.registerSecondaryAuth.bind(this),
          },
        })
        .then((modal) => {
          this.passcodeModal = modal;

          this.passcodeModal.onDidDismiss().then(() => {
            delete this.passcodeModal;
          });

          this.passcodeModal.present();
        });
    }
  }

  private userMustGoToSettings(type) {
    this.isNoFingerprintMessageStorageDisplayed.pipe(first()).subscribe((response: boolean) => {
      if (this.isSettingsPage) {
        this.showMustRegisterAlert(type);
      } else {
        if (!response) {
          if (!this.preventNoFingerprintMessageStorage) {
            this.showMustRegisterAlert(type);
            this.setNoFingerprintMessageStorage();
            this.preventNoFingerprintMessageStorage = true;
          }
        } else {
          if (!this.preventNoFingerprintMessageStorage) {
            this.setNoFingerprintMessageStorage();
          }
        }
      }
    });
  }

  private showMustRegisterAlert(type) {
    const authTypeName = this.biometricsService.getAuthTypeNameFromType(type);

    const options = [
      {
        text: 'Cancel',
        action: () => {},
      },
    ];

    if (this.globalConfigs.isCordova) {
      const settingsBtn = {
        text: 'Settings',
        action: () => {
          //goto settings
          this.openSettings.open(this.globalConfigs.isIos ? 'touch' : 'settings').catch(() => {
            //failed to open device settings
            this.showAlert({
              header: 'Unable to Open Settings!',
              message: `There are currently no ${authTypeName} saved on your device. Please go to settings and create one.`,
              cssClass: '',
              buttons: [
                {
                  text: 'OK',
                  action: () => {},
                },
              ],
              enableBackdropDismiss: false,
            });
          });
        },
      };

      options.push(settingsBtn);
    }

    const bioTitle = `Can't Enable ${authTypeName}`;
    let bioLabel = `${this.globalConfigs.appName} supports ${authTypeName} authentication. However, there are no fingerprints saved on your device. Tap settings to setup ${authTypeName}.`;

    if (this.globalConfigs.isIos) {
      if (type === 'face') {
        bioLabel = `${this.globalConfigs.appName} supports Face ID authentication. Tap Settings to set up Face ID for your device and also ensure that Face ID is turned on for this app.`;
      }
    }

    this.showAlert({
      header: bioTitle,
      message: bioLabel,
      buttons: options,
      enableBackdropDismiss: false,
    });
  }

  private showAlert(alertOptions: PecAlertOptions, invalidTouch: boolean = true) {
    if (this.alert) {
      return;
    }

    alertOptions.onDismiss = () => {
      if (invalidTouch) {
        this.setSecondaryStorage();
      }
      delete this.alert;
    };

    this.alertCtrl.show(alertOptions).then((alert) => {
      this.alert = alert;
    });
  }

  private setSecondaryStorage() {
    if (!this.preventSecondaryStorage) {
      this.storage.setItem('isSecAuthSetupScreenDisplayed', true, true);
    }
  }

  private setNoFingerprintMessageStorage() {
    this.storage.setItem('isNoFingerprintMessageStorageDisplayed', true, true);
  }
}
