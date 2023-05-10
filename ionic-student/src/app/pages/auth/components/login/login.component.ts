import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { TrackingService } from '../../../../shared/services/tracking.service';
import { first } from 'rxjs/operators';
import { AuthType } from '../../../../shared/enums/auth-type.enum';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  Platform,
  ToastController,
  ViewDidEnter,
  ViewDidLeave,
} from '@ionic/angular';
import {
  LoginObject,
  LoginResponse,
  SecondaryAuthStorageObject,
  UserStorageObject,
} from '../../../../data/types/auth.type';
import { UserService } from '../../../../data/services/user.service';
import { User } from '../../../../data/types/user.type';
import { PushNotificationsService } from '../../../../shared/services/push-notifications.service';
import { StorageService } from '../../../../shared/services/storage.service';
import { MobileService } from '../../../../data/services/mobile.service';
import { CampusSetting, MobileSettings } from '../../../../data/types/mobile-settings.type';
import { OnboardingModalComponent } from '../../../../shared/components/onboarding-modal/onboarding-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MessengerService } from '../../../../data/services/messenger.service';
import { BiometricsService } from '../../../../shared/services/biometrics.service';
import { ThemeId } from '../../../../shared/enums/theme-id.enum';
import { BasePageComponent } from '../../../../shared/components/base-page-component/base-page.component';
import { PecPasscodeOptions } from '../../../../shared/components/passcode/passcode.component';
import { PecLoaderService } from '../../../../shared/services/pec-loader.service';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { CrashlyticsService } from 'src/app/shared/services/crashlytics.service';
import { AuthService } from '../../../../data/services/auth.service';

declare global {
  interface Window {
    cecSplash: any;
  }
}

@Component({
  selector: 'pec-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends BasePageComponent implements ViewDidEnter, ViewDidLeave, OnInit {
  public loginForm: FormGroup;
  public showPassword = false;
  public memberInfoMessage: string;
  public selectedCampus: CampusSetting;
  public showCampusList: boolean;
  public mobileSettings: MobileSettings;
  public usePasscode: boolean;
  public isLoggedOutFaceId: boolean;
  public passcodeOptions: PecPasscodeOptions = {
    title: `Enter passcode to sign into <br / > ${
      this.globalConfigs.themeId === ThemeId.AIU ? 'AIU' : 'CTU'
    } Student Mobile.`,
    passcodeError: '*You entered the wrong passcode. Please try again.',
    onLoginClick: () => {
      this.usePasscode = false;
      this.loginFailures.length = 0;
    },
    onComplete: (passcode: string) => {
      return new Promise<void>((resolve, reject) => {
        this.showLoading().then(() => {
          this.authService
            .secondaryAuthLogin(this.secondaryAuth, passcode)
            .pipe(first())
            .subscribe(
              (allowed) => {
                this.loginCallSuccess(allowed, true, '', AuthType.Passcode);
                resolve();
              },
              (error) => {
                this.loginCallFailure(error, AuthType.Passcode, true);
                reject();
              }
            );
        });
      });
    },
  };

  private alert: HTMLIonAlertElement;
  private loading: HTMLIonLoadingElement;
  private onboardingModal: HTMLIonModalElement;
  private blockLoginTillLoader: HTMLIonLoadingElement;
  private errorPageCredentials: LoginObject;
  private loginFailures: number[] = [];
  private user: User;
  private secondaryAuth: SecondaryAuthStorageObject;
  private useFingerprint: boolean;
  private loginCredentials: LoginObject;
  private blockLoginTill: number;
  private blockLoginTillMilliseconsLeft: number;
  private validateFingerprintVisible: boolean;
  private isSignOutClickedFlag: boolean;
  private isFaceIdCapable: boolean;
  private isStandardLogin: boolean;
  private inView: boolean;
  private isPaused: boolean;
  private cacheSuffix: string;
  private blockLoginTillInterval: number;
  private cecSplash: any;
  private shortLifeToken: string;

  constructor(
    public globalConfigs: GlobalConfigsService,
    private trackingService: TrackingService,
    private authService: AuthService,
    private userService: UserService,
    private notificationsService: PushNotificationsService,
    private storage: StorageService,
    private mobileService: MobileService,
    private chatService: MessengerService,
    private biometricsService: BiometricsService,
    private fb: FormBuilder,
    private keyboard: Keyboard,
    private alertCtrl: AlertController,
    private loadingCtrl: PecLoaderService,
    private loadingService: LoadingController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    public actionSheetCtrl: ActionSheetController,
    private router: Router,
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    private zone: NgZone,
    private fingerPrintService: FingerprintAIO,
    private crashlyticsService: CrashlyticsService
  ) {
    super();

    this.loginForm = fb.group({
      UserName: new FormControl('', [Validators.required]),
      Password: new FormControl('', [Validators.required]),
      RememberMe: new FormControl(false),
    });

    platform.ready().then(() => {
      if (this.globalConfigs.isCordova) {
        this.platform.pause.subscribe(() => {
          this.showPassword = false;
        });
      }
    });
    this.crashlyticsService.init();
  }

  private get isOnboardingDissmissed() {
    return this.storage.getItem<string>('onboardingDissmissedVersion');
  }

  public togglePassword() {
    this.showPassword = !this.showPassword;

    setTimeout(() => {
      if (this.keyboard) {
        this.keyboard.show();
      }
    }, 0);
  }

  public toggleRememberMe() {
    this.trackingService.trackEvent({
      view: 'Login Page',
      category: 'Login Page',
      action: 'Toggled Remember Me',
      label: 'On',
      value: '',
    });

    if (!this.loginForm.get('RememberMe').value) {
      this.authService.clearRememberMeLogin();
      this.trackingService.trackEvent({
        view: 'Login Page',
        category: 'Login Page',
        action: 'Toggled Remember Me',
        label: 'Off',
        value: '',
      });
    } else {
      this.trackingService.trackEvent({
        view: 'Login Page',
        category: 'Login Page',
        action: 'Toggled Remember Me',
        label: 'On',
        value: '',
      });
    }
  }

  public presentActionSheet() {
    if (!this.selectedCampus) {
      this.showError('Please select a campus from the list above', 'Which Campus?');
      this.showCampusList = !this.showCampusList;
      return;
    }

    let urlForgotPassword: string;
    let urlForgotUsername: string;

    if (this.selectedCampus.Settings) {
      urlForgotPassword = this.selectedCampus.Settings['Forgot Password'];
      urlForgotUsername = this.selectedCampus.Settings['Forgot Username'];
    }

    this.actionSheetCtrl
      .create({
        buttons: [
          {
            text: 'Forgot Password',
            handler: () => {
              this.openLoginHelp(urlForgotPassword);
              this.trackingService.trackEvent({
                view: 'Login Page',
                category: 'Login Page',
                action: 'Tapped Login Assistance',
                label: 'Password',
                value: '',
              });
            },
          },
          {
            text: 'Forgot Username',
            handler: () => {
              this.openLoginHelp(urlForgotUsername);
              this.trackingService.trackEvent({
                view: 'Login Page',
                category: 'Login Page',
                action: 'Tapped Login Assistance',
                label: 'Username',
                value: '',
              });
            },
          },
        ],
      })
      .then((actionSheet) => actionSheet.present());
  }

  public login() {
    if (!this.selectedCampus) {
      this.trackingService.trackEvent({
        view: 'Login Page',
        category: 'Login Page',
        action: 'Log in Failed',
        label: 'No Campus Selected',
        value: '',
      });

      this.showError('Please select a campus from the list above.', 'Which Campus?');
      this.showCampusList = !this.showCampusList;

      return;
    }

    if (this.loginForm.invalid) {
      this.showError();

      return;
    }

    this.showLoading().then(() => {
      const lc: LoginObject = {
        ...this.loginForm.value,
        SourceSystemId: this.selectedCampus.Campus.SourceSystemId,
        CampusId: this.selectedCampus.Campus.CampusId,
        ApplicationType: 2,
      };

      this.errorPageCredentials = lc;
      this.loginCredentials = { ...lc, Password: '' };

      this.authService
        .loginPost(lc)
        .pipe(first())
        .subscribe(
          (allowed) => {
            this.loginCallSuccess(allowed, false, lc.UserName, AuthType.Standard);
          },
          (error) => {
            this.loginCallFailure(error, AuthType.Standard, false);
          }
        );
    });
  }

  public toggleCampusList() {
    this.selectedCampus = this.showCampusList ? null : this.selectedCampus;
    this.showCampusList = !this.showCampusList;
  }

  public getStandardLogin() {
    this.isLoggedOutFaceId = false;
    this.router.navigate(['/login'], {
      queryParams: { isSignOutClicked: true, isStandardLogin: true },
      replaceUrl: true,
    });
  }

  public getFaceIdLogin() {
    this.isLoggedOutFaceId = false;
    this.isSignOutClickedFlag = false;
    this.isStandardLogin = true;
    this.validateFingerprint();
  }

  public ngOnInit() {
    this.loadApp();
  }

  public ionViewDidEnter() {
    window.addEventListener('keyboardDidShow', this.onKeyboardShowEvent, false);

    this.subscriptions.routeParams = this.activatedRoute.queryParams.subscribe((routeParams) => {
      this.isSignOutClickedFlag = routeParams.isSignOutClicked;
      this.isStandardLogin = routeParams.isStandardLogin;
    });

    this.subscriptions.params = this.activatedRoute.params.subscribe((params) => {
      this.shortLifeToken = params.shortLifeToken;
    });

    if (this.shortLifeToken) {
      this.showLoading().then(() => {
        this.authService.sltLogin(decodeURIComponent(this.shortLifeToken));
      });
    }

    this.loadApp();
  }

  public ionViewWillLeave() {
    window.removeEventListener('keyboardDidShow', this.onKeyboardShowEvent, false);

    this.inView = false;
    this.loginForm.patchValue({ Password: '' });

    if (this.alert) {
      this.alert.dismiss();
      delete this.alert;
    }

    for (const key in this.subscriptions) {
      if (this.subscriptions[key] && this.subscriptions[key].unsubscribe) {
        this.subscriptions[key].unsubscribe();
        delete this.subscriptions[key];
      }
    }
  }

  public ionViewDidLeave() {
    this.hideLoading();
  }

  private onKeyboardShowEvent() {
    document.activeElement.scrollIntoView(true);
  }

  private loadApp() {
    if (this.globalConfigs.isIos) {
      this.biometricsService.fingerprintSupport().then((data) => {
        this.isFaceIdCapable = data.type === 'face';
      });
    }

    this.mobileService
      .settings()
      .pipe(first())
      .subscribe(
        (settings) => {
          if (settings) {
            let forceUpgrade = false;
            this.mobileSettings = settings;

            var stopSplash = setInterval(function () {
              if (window.cecSplash) {
                clearInterval(stopSplash);
                setTimeout(function () {
                  window.cecSplash.stop();
                }, 500)
              }
            }, 100);

            if (this.globalConfigs.deviceSpecificId && this.globalConfigs.isCordova) {
              let minVersion = '';

              if (
                this.globalConfigs.isIos &&
                this.mobileSettings.IosSettings &&
                this.mobileSettings.IosSettings.MinVersion
              ) {
                minVersion = this.mobileSettings.IosSettings.MinVersion;
              } else if (
                this.globalConfigs.isAndroid &&
                this.mobileSettings.AndroidSettings &&
                this.mobileSettings.AndroidSettings.MinVersion
              ) {
                minVersion = this.mobileSettings.AndroidSettings.MinVersion;
              }

              if (this.globalConfigs.compareVersion(minVersion) >= 0) {
                forceUpgrade = true;
              }
            }

            this.memberInfoMessage = settings.CampusSettings[0].Settings.AiuMemberMessage;
            this.initCampus();

            if (forceUpgrade) {
              this.router.navigate(['/error/force-update'], { replaceUrl: true });
            } else {
              this.inView = true;

              this.authService
                .logout()
                .pipe(first())
                .subscribe(() => {
                  if (!this.subscriptions.appStatus) {
                    this.subscriptions.appStatus = this.globalConfigs.appStatus.subscribe((v: string) => {
                      if (v) {
                        if (v === 'resume') {
                          if (this.inView) {
                            this.zone.run(() => {
                              if (this.useFingerprint && !this.validateFingerprintVisible && this.isPaused) {
                                this.validateFingerprint();
                              }

                              this.isPaused = false;
                            });
                          }
                        } else if (v === 'pause') {
                          if (this.inView) {
                            this.zone.run(() => {
                              this.isPaused = true;
                            });
                          }
                        }
                      }
                    });
                  }

                  if (!this.subscriptions.cacheSuffix) {
                    this.subscriptions.cacheSuffix = this.storage.getItem<string>('cacheSuffix').subscribe((value) => {
                      if (value) {
                        this.cacheSuffix = value;
                      }
                    });
                  }

                  if (!this.subscriptions.blockLoginTill) {
                    this.subscriptions.blockLoginTill = this.storage
                      .getItem('blockLoginTill')
                      .subscribe((value: number) => {
                        if (this.blockLoginTillInterval) {
                          clearInterval(this.blockLoginTillInterval);
                          this.blockLoginTillInterval = 0;
                        }

                        if (this.blockLoginTillLoader) {
                          this.blockLoginTillLoader.dismiss().then(() => (this.blockLoginTillLoader = null));
                        }

                        this.blockLoginTillMilliseconsLeft = 0;
                        this.blockLoginTill = value;

                        if (value && value > 0) {
                          this.trackingService.trackEvent({
                            view: 'Login Page',
                            category: 'Login Page',
                            action: 'Log in Failed_User Locked Out',
                            label: '',
                            value: '',
                          });

                          this.processBlockUntil();
                        }
                      });
                  }

                  if (!this.subscriptions.rememberMeLogin) {
                    this.subscriptions.rememberMeLogin = this.authService.rememberMeLogin.subscribe(
                      (item: LoginObject) => {
                        if (item && !(this.loginCredentials && this.loginCredentials.UserName)) {
                          if (item.RememberMe) {
                            this.loginCredentials = item;
                            this.loginForm.patchValue(item);
                            this.initCampus();
                          } else {
                            this.loginCredentials = new LoginObject();
                          }
                        }
                      }
                    );
                  }

                  this.authService.getSecondaryAuth.pipe(first()).subscribe((auth: SecondaryAuthStorageObject) => {
                    this.usePasscode = false;
                    this.useFingerprint = false;

                    if (auth) {
                      this.secondaryAuth = auth;
                      if (!auth.Disabled) {
                        if (auth.AuthType === AuthType.Passcode) {
                          this.usePasscode = true;
                          this.passcodeOptions = {
                            title: `Enter passcode to sign into <br / > ${this.globalConfigs.brandName} Student Mobile.`,
                            passcodeError: '*You entered the wrong passcode. Please try again.',
                            onLoginClick: () => {
                              this.usePasscode = false;
                              this.loginFailures.length = 0;
                            },
                            onComplete: (passcode: string) => {
                              return new Promise<void>((resolve, reject) => {
                                this.showLoading().then(() => {
                                  this.authService
                                    .secondaryAuthLogin(this.secondaryAuth, passcode)
                                    .pipe(first())
                                    .subscribe(
                                      (allowed) => {
                                        this.loginCallSuccess(allowed, true, '', AuthType.Passcode);
                                        resolve();
                                      },
                                      (error) => {
                                        this.loginCallFailure(error, AuthType.Passcode, true);
                                        reject();
                                      }
                                    );
                                });
                              });
                            },
                          };
                        } else if (auth.AuthType === AuthType.Standard) {
                          this.useFingerprint = true;
                          // let the page to fully render
                          setTimeout(() => this.validateFingerprint(), 300);
                        }
                      }
                    }
                  });
                });
            }
          } else {
            this.sendSettingErrorCode();
            this.trackingService.trackEvent({
              view: 'Login View',
              category: 'System Errors',
              action: 'ErrorCode : SETTINGFAIL',
              label: 'Login Page',
              value: '',
            });
            this.apiError('SETTINGFAIL');
          }
        },
        (error) => {
          this.hideLoading();
          this.sendSettingErrorCode();
          this.apiError('SETTINGFAIL', error);
        }
      );
  }

  private showError(text?: string, title?: string) {
    if (!text) {
      text = 'Invalid username, password, or campus.';
    }

    if (!title) {
      title = ' ';
    }

    this.trackingService.trackEvent({
      view: 'Login Page',
      category: 'Login Page',
      action: 'Log in Failed',
      label: 'Invalid User Information',
      value: '',
    });

    return this.showAlert({
      header: title,
      message: text,
      buttons: ['Close'],
    });
  }

  private showAlert(alertOptions) {
    return this.alertCtrl.create(alertOptions).then((alert) => {
      this.alert = alert;

      this.alert.onDidDismiss().then(() => {
        delete this.alert;
      });

      this.alert.present();

      return alert;
    });
  }

  private showLoading() {
    return this.loadingCtrl.show('Please wait...').then((loading) => {
      this.loading = loading;
    });
  }

  private loginCallSuccess(
    loginResponse: LoginResponse,
    isSecondaryLogin: boolean,
    userName: string,
    authType: AuthType,
    slt?: string
  ) {
    if (loginResponse && (!loginResponse.hasOwnProperty('SuccessfulLogin') || loginResponse.SuccessfulLogin)) {
      let eventLabel = this.getAuthTypeLabel(authType);

      this.userService
        .info({ slt })
        .pipe(first())
        .subscribe(
          (user) => {
            this.loginFailures = [];

            this.hideLoading();

            this.user = user;

            if (user.IsStudent) {
              this.updateUserData(user).catch();

              if (user.IsHybridStudent === true && this.selectedCampus.Campus.Name === 'Online') {
                this.showError();
                return;
              }

              if (user.StudentStatusId === 17 || user.StudentStatusId === 18) {
                this.router.navigate(['/tabs/home/alumni/alumni'], { replaceUrl: true });
                this.hideLoading();
                return;
              }

              if (!loginResponse.SupportedApp) {
                this.router.navigate(['/error/alumni'], { replaceUrl: true });
                this.hideLoading();
                return;
              }

              this.trackingService.trackEvent({
                view: 'Login Page',
                category: 'Login Page',
                action: 'Logged in Successfully',
                label: eventLabel,
                value: '',
              });

              this.authService.setRegistrationToken(loginResponse.RegistrationToken);
              this.crashlyticsService.onLogin();
              this.selectedCampus = this.mobileSettings.CampusSettings.find((o) => {
                return o.Campus && o.Campus.CampusId === this.globalConfigs.sycampusid;
              }, this);

              if (this.selectedCampus.Settings.ShowOnboarding.toLowerCase() === 'true') {
                this.isOnboardingDissmissed.subscribe((response: string) => {
                  const isSet = !!response;

                  if (isSet === false) {
                    setTimeout(() => {
                      this.presentOnboardingModal();
                    }, 0);
                  } else {
                    this.router.navigate(['/tabs/home'], { replaceUrl: true });
                  }
                });
              } else {
                this.router.navigate(['/tabs/home'], { replaceUrl: true });
              }
            } else if (user.IsFaculty) {
              this.trackingService.trackEvent({
                view: 'Login Page',
                category: 'Login Page',
                action: 'Faculty Login',
                label: '',
                value: '',
              });

              this.router.navigate(['/error/faculty'], { replaceUrl: true });
            } else {
              eventLabel = authType === AuthType.Standard ? 'Invalid User Information' : eventLabel;

              this.trackingService.trackEvent({
                view: 'Login Page',
                category: 'Login Page',
                action: 'Log in Failed',
                label: eventLabel,
                value: '',
              });

              this.showError();
            }

            if (!this.globalConfigs.isImpersonatedUser && !this.user.IsDemo) {
              if (!isSecondaryLogin && this.secondaryAuth) {
                if (this.secondaryAuth.UserName.toUpperCase() !== userName.toUpperCase()) {
                  this.authService.clearSecondaryAuth();
                } else {
                  this.authService.enableSecondaryAuth();
                }
              }
            }
          },
          (error) => {
            this.hideLoading();

            this.trackingService.trackEvent({
              view: 'Login View',
              category: 'System Errors',
              action: 'ErrorCode : LOGINFAIL',
              label: 'Login Page',
              value: '',
            });

            this.apiError('LOGINFAIL', error);
          }
        );
    } else {
      this.hideLoading();

      this.trackingService.trackEvent({
        view: 'Login View',
        category: 'System Errors',
        action: 'ErrorCode : LOGINFAIL',
        label: 'Login Page',
        value: '',
      });

      this.apiError('LOGINFAIL');
    }
  }

  private loginCallFailure(error, authType: AuthType, isSecondaryLogin?: boolean) {
    this.hideLoading();

    if (error.status && error.status === 200) {
      const now = new Date().getTime();
      const delta = 60 * 1000;
      const since = now - delta;

      while (this.loginFailures.length && this.loginFailures[0] < since) {
        this.loginFailures.shift();
      }

      this.loginFailures.push(now);

      if (this.loginFailures.length >= 3) {
        const alertPromise = this.showLoginError(authType, isSecondaryLogin);

        if (isSecondaryLogin && this.secondaryAuth) {
          this.loginFailures.length = 0;
          if (isSecondaryLogin) {
            this.usePasscode = false;
            this.useFingerprint = false;
            this.authService.disableSecondaryAuth();
          } else {
            this.storage.setItem('blockLoginTill', now + delta);
          }
        } else if (alertPromise) {
          alertPromise.then((alert) => {
            alert.onDidDismiss().then(() => {
              this.loginFailures.length = 0;
              if (isSecondaryLogin) {
                this.usePasscode = false;
                this.useFingerprint = false;
                this.authService.disableSecondaryAuth();
              } else {
                this.storage.setItem('blockLoginTill', now + delta);
              }
            });
          });
        }
      } else if (!isSecondaryLogin) {
        this.showError();
      } else {
        const eventLabel = this.getAuthTypeLabel(authType);

        this.trackingService.trackEvent({
          view: 'Login Page',
          category: 'Login Page',
          action: 'Log in Failed',
          label: eventLabel,
          value: '',
        });
      }
    } else {
      this.trackingService.trackEvent({
        view: 'Login View',
        category: 'System Errors',
        action: 'ErrorCode : ERRORSTAT200',
        label: 'Login Page',
        value: '',
      });

      this.apiError('ERRORSTAT200', error);
    }
  }

  private getAuthTypeLabel(authType: AuthType) {
    let label = '';

    switch (authType) {
      case 1:
        label = 'Standard';
        break;

      case 2:
        label = 'Passcode';
        break;

      case 3:
        label = this.globalConfigs.isAndroid ? 'Fingerprint' : 'Touch ID';
        break;

      case 4:
        label = 'Face ID';
        break;

      case 5:
        label = 'SLT';
        break;
    }

    return label;
  }

  private hideLoading() {
    this.loadingCtrl.dismiss();
    this.validateFingerprintVisible = false;
  }

  // Prepare the app for current user. eg. reset old user's information if different user logs in.
  private updateUserData(user: User) {
    return new Promise<boolean>((resolve, reject) => {
      if (!user) {
        resolve(false);
        return;
      }

      this.authService
        .getUserInfo()
        .pipe(first())
        .subscribe((userInfo: UserStorageObject) => {
          if (!userInfo || userInfo.UserIdExternal !== user.UserIdExternal) {
            this.authService.storeUserInfo(user);
          }
        });
    });
  }

  private presentOnboardingModal() {
    this.modalCtrl
      .create({
        component: OnboardingModalComponent,
        componentProps: {
          textMessage: 'Onboarding Screen',
        },
      })
      .then((modal) => {
        this.onboardingModal = modal;
        this.onboardingModal.present();
      });
  }

  private apiError(msg?: string, error?) {
    let userInfo = {};
    if (this.user) {
      userInfo = this.user;
    } else {
      if (this.mobileSettings) {
        userInfo = {
          SyCampusId: this.selectedCampus.Campus.CampusId,
          SourceSystemId: this.selectedCampus.Campus.SourceSystemId,
          UserName: this.loginForm.get('UserName').value,
        };
      }
    }

    this.router.navigate(['/error/technical-difficulties' + (msg ? '/' + msg : '')], {
      replaceUrl: true,
      state: { errorData: JSON.stringify(error) },
    });
  }

  private showLoginError(authType: AuthType, isSecondaryLogin?: boolean) {
    if (isSecondaryLogin && this.secondaryAuth) {
      this.toastCtrl
        .create({
          message: 'Too many failed attempts',
          duration: 4000,
          position: 'bottom',
          cssClass: 'pec-toast-message',
        })
        .then((toast) => {
          toast.present();
        });

      const eventLabel = this.getAuthTypeLabel(authType);
      this.trackingService.trackEvent({
        view: 'Login Page',
        category: 'Login Page',
        action: 'Log in Failed',
        label: eventLabel,
        value: '',
      });

      return null;
    } else {
      return this.showError();
    }
  }

  private openLoginHelp(url) {
    this.hideLoading();

    this.router.navigateByUrl('/login-help', { state: { url } });
  }

  private initCampus() {
    if (
      this.mobileSettings &&
      this.mobileSettings.CampusSettings &&
      this.mobileSettings.CampusSettings.length &&
      this.loginCredentials &&
      this.loginCredentials.CampusId > 0 &&
      !this.selectedCampus
    ) {

      this.selectedCampus = this.mobileSettings.CampusSettings.find((o) => {
        return (
          o.Campus &&
          o.Campus.SourceSystemId === this.loginCredentials.SourceSystemId &&
          o.Campus.CampusId === this.loginCredentials.CampusId
        );
      });
    }
  }

  private processBlockUntil() {
    const now = new Date().getTime();

    if (now >= this.blockLoginTill) {
      this.storage.setItem('blockLoginTill', 0);
      return;
    }

    this.blockLoginTillMilliseconsLeft = this.blockLoginTill - now;

    if (this.blockLoginTillMilliseconsLeft > 0) {
      const textColor = this.globalConfigs.themeId === ThemeId.CTU ? 'pec-text-primary' : 'pec-text-orange';
      const message = `
            <div class="ion-text-center pec-text-semi-transparent-dark locked-message">
                <h5 class="pec-fw-bold pec-fs-15 pec-mt-25 pec-mb-0 pec-px-20">Looks like you're having trouble logging in.</h5>
                <p class="pec-fw-bold pec-fs-15 pec-mt-0">Here are a few tips to help:</p>
                <ul class="ion-text-left pec-fs-13 pec-pl-20 pec-fw-300">
                <li><span>Make sure you've chosen the correct campus at the top of the login screen.</span></li>
                <li><span>Use the same password you use to log into the online portal.</span></li>
                <li><span>If you've forgotten your username or password, tap the Need Help link at the bottom of the login screen.</span></li>
                </ul>
                <h5 class="pec-fw-bold pec-fs-15 pec-mt-25 pec-mb-0 pec-px-20">Please try again in:</h5>
                <h1 class="${textColor} pec-my-10 pec-fs-23 pec-fw-500 locked-countdown">${(
        this.blockLoginTillMilliseconsLeft / 1000
      ).toFixed(0)}
                <span> second${this.blockLoginTillMilliseconsLeft > 1 ? 's' : ''}</span></h1>
            </div>
            `;

      if (!this.blockLoginTillLoader) {
        this.loadingService
          .create({
            message,
            cssClass: 'login-block-until',
            showBackdrop: true,
            spinner: null,
          })
          .then((loader) => {
            this.blockLoginTillLoader = loader;
            this.blockLoginTillLoader.present();
            this.blockLoginTillInterval = setInterval(() => this.processBlockUntil(), 100);
          });
      } else {
        this.blockLoginTillLoader.message = message;
      }
    }
  }

  private sendSettingErrorCode() {
    this.trackingService.trackEvent({
      category: 'System Errors',
      action: 'ErrorCode : SETTINGFAIL',
      label: 'Login Page',
    });
  }

  private validateFingerprint(isRetry?: boolean) {
    // ios validate fingerprint but if face id available use that. logic is in the biometricsService
    if (this.useFingerprint && !this.validateFingerprintVisible) {
      // check for settings -> logout flag
      // check if faceId capable device
      // if both are true then show the 'faceId button login view'
      if (this.isSignOutClickedFlag && this.isFaceIdCapable) {
        // check if url for standard login was clicked
        this.isLoggedOutFaceId = !this.isStandardLogin;
      } else {
        this.biometricsService.fingerprintSupport().then(
          (data) => {
            this.isFaceIdCapable = data.type === 'face';
            this.validateFingerprintVisible = true;

            const authTypeName = this.biometricsService.getAuthTypeNameFromType(data.type);

            let title = '';
            let message = '';
            if (isRetry) {
              title = this.globalConfigs.isIos ? authTypeName : 'Unable to Recognize Fingerprint';
              message = `${authTypeName} was not recognized. Please try again`;
            } else {
              title = this.globalConfigs.isIos ? '' : 'Fingerprint Sign In';
              message = this.globalConfigs.isIos
                ? 'Authenticate to Sign In'
                : `Confirm fingerprint to sign into ${this.globalConfigs.appName}`;
            }

            this.biometricsService.validateFingerprint(title, message).then(
              (hash: string) => {
                this.showLoading().then(() => {
                  this.authService
                    .secondaryAuthLogin(this.secondaryAuth, hash)
                    .pipe(first())
                    .subscribe(
                      (allowed) => {
                        this.loginCallSuccess(
                          allowed,
                          true,
                          '',
                          this.isFaceIdCapable ? AuthType.FaceID : AuthType.TouchID
                        );
                      },
                      (error) => {
                        this.loginCallFailure(error, this.isFaceIdCapable ? AuthType.FaceID : AuthType.TouchID, true);
                      }
                    );
                });
              },
              (error) => {
                this.trackingService.trackEvent({
                  view: 'Login Page',
                  category: 'Login Page',
                  action: 'Log in Failed',
                  label: authTypeName,
                  value: '',
                });

                this.handleBiometricsError(error);
              }
            );
          },
          (error) => {
            const authType = this.biometricsService.getAuthTypeFromDeviceModel();
            const authTypeName = this.biometricsService.getAuthTypeNameFromType(authType);

            this.trackingService.trackEvent({
              view: 'Login Page',
              category: 'Login Page',
              action: 'Log in Failed',
              label: authTypeName,
              value: '',
            });

            this.handleBiometricsError(error);
            this.authService.clearSecondaryAuth();
            this.useFingerprint = false;
          }
        );
      }
    }
  }

  private handleBiometricsError(error) {
    this.validateFingerprintVisible = false;

    if (error) {
      if (error.code === this.fingerPrintService.BIOMETRIC_AUTHENTICATION_FAILED) {
        // retry auth attempt
        this.validateFingerprint(true);
        return;
      }

      if (
        error.code === this.fingerPrintService.BIOMETRIC_DISMISSED ||
        error.code === this.fingerPrintService.BIOMETRIC_UNAVAILABLE
      ) {
        // on iOS with face ID error code is BIOMETRIC_UNAVAILABLE when user dismisses Face ID prompt
        this.useFingerprint = false;
        return;
      }

      let toastText = '';

      this.useFingerprint = false;

      if (
        error.code === this.fingerPrintService.BIOMETRIC_LOCKED_OUT ||
        error.code === this.fingerPrintService.BIOMETRIC_LOCKED_OUT_PERMANENT ||
        error.message?.indexOf('locked out') !== -1
      ) {
        // Locked out due to too many attempts
        this.authService.disableSecondaryAuth();
        toastText = 'Too many failed attempts. Please login to reset.';
      } else if (
        error.code === this.fingerPrintService.BIOMETRIC_NOT_ENROLLED ||
        error.code === this.fingerPrintService.BIOMETRIC_UNAVAILABLE ||
        error.code === this.fingerPrintService.BIOMETRIC_UNKNOWN_ERROR
      ) {
        // BIOMETRIC_UNAVAILABLE means user didn't enable Face ID when prompted after first login
        // BIOMETRIC_NOT_ENROLLED means biometrics are available on the device, but user has not enrolled to use it or disabled it
        // on login screen just do nothing and let user use standard login
      } else if (error.code === this.fingerPrintService.BIOMETRIC_SECRET_NOT_FOUND) {
        this.authService.clearSecondaryAuth();
        this.showError(
          'A new fingerprint has been added to your device since your last login. Please log into the app and set up fingerprint authentication again in the More view.'
        );
      } else {
        toastText = `Biometric authentication failed: ${error.message}. Please use standard login.`;
      }

      if (toastText) {
        this.toastCtrl
          .create({
            message: toastText,
            duration: 4000,
            position: 'bottom',
            cssClass: 'pec-toast-message',
          })
          .then((toast) => toast.present());
      }
    }
  }
}
