import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { GlobalConfigsService } from './global-configs.service';
import { MessengerService } from '../../data/services/messenger.service';
import { concat, forkJoin, Observable, Subscription } from 'rxjs';
import { filter, first, map, timeout } from 'rxjs/operators';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { AlertController, Platform, ToastController } from '@ionic/angular';
import { ChatService } from '../../data/services/chat.service';
import { DeviceRegistrationResponse } from '../../data/types/messenger.type';
import { AirshipService } from './airship.service';
import { MobileService } from '../../data/services/mobile.service';
import { PecAirshipService } from '@pec/notifications';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationsService {
  private readonly subscribedPushNotificationTokenKey = 'SendBirdRegistrationToken';
  private readonly devicePushNotificationTokenKey = 'pushRegistrationToken';
  private readonly deviceChannelIdKey = 'deviceChannelId';
  private readonly subscribedDeviceChannelIdKey = 'subscribedDeviceChannelId';
  private readonly disallowUniversityPushNotificationKey = 'disallowUniversityNotification';
  private readonly systemPushNotificationStatusKey = 'appNotificationStatus';
  private readonly isPushNotificationInitializedKey = 'isPushNotificationInitialized';
  private readonly isUniversityNotificationInitializedKey = 'isUniversityNotificationInitialized';
  private readonly displayedUniversityPushNotificationPromptKey = 'displayedPushNotificationPrompt';
  private readonly isSecAuthSetupScreenDisplayedKey = 'isSecAuthSetupScreenDisplayed';
  private readonly notificationOpenedKey = 'notificationOpened';

  private subscriptions: { [key: string]: Subscription } = {};
  private verifyAppNotificationStatusInterval = 0;
  private alert: HTMLIonAlertElement;

  private onUaRegistration = {
    handleEvent: (event) => {
      if (!event || event.error) {
        if (event?.error) {
          this.globalConfigs.displayDebugError('Error occured in onUaRegistration: ' + event.error);
        } else {
          this.globalConfigs.displayDebugError('Error occured in onUaRegistration: no description');
        }
        return;
      } else {
        if (this.globalConfigs.isIos) {
          const deviceToken = event.deviceToken;

          if (!deviceToken) {
            this.globalConfigs.displayDebugError('Error occured in onUaRegistration: UA did not return deviceToken');
            return;
          }

          this.devicePushNotificationToken.pipe(first()).subscribe((pushRegistrationToken: string) => {
            if (deviceToken == null || deviceToken !== pushRegistrationToken) {
              this.setDevicePushNotificationToken(deviceToken);
            }
          });
        }

        if (event.channelID) {
          this.deviceChannelId.pipe(first()).subscribe((deviceChannelId: string) => {
            if (deviceChannelId == null || deviceChannelId !== event.channelID) {
              this.storage.setItem(this.deviceChannelIdKey, event.channelID, true);
            }
          });
        }
      }
    },
  };

  private onUaInboxUpdated = {
    handleEvent: (event) => {
      if (!event || event.error) {
        if (event?.error) {
          this.globalConfigs.displayDebugError('Error occured in onUaInboxUpdated: ' + event.error);
        } else {
          this.globalConfigs.displayDebugError('Error occured in onUaInboxUpdated');
        }
      } else {
        this.airshipService.updateUaInbox();
      }
    },
  };

  private handleDeepLink = {
    handleEvent: (event) => {
      if (!event || event.error) {
        if (event?.error) {
          this.globalConfigs.displayDebugError('Error occured in handleDeepLink: ' + event.error);
        } else {
          this.globalConfigs.displayDebugError('Error occured in handleDeepLink');
        }
      } else {
        if (event.deepLink) {
          this.airshipService.setDeepLinkUrl(event.deepLink);
        }
      }
    },
  };

  private onNotificationOpened = {
    handleEvent: (event) => {
      if (!event || event.error) {
        if (event?.error) {
          this.globalConfigs.displayDebugError('Error occured in onNotificationOpened: ' + event.error);
        } else {
          this.globalConfigs.displayDebugError('Error occured in onNotificationOpened');
        }
      } else {
        if (event.extras && event.extras._uamid) {
          this.storage.setItem(this.notificationOpenedKey, event.extras._uamid, false);
        }
      }
    },
  };

  // Airship device channel ID that came from Airship during 'urbanairship.registration' event
  public get deviceChannelId(): Observable<string> {
    return this.storage.getItem<string>(this.deviceChannelIdKey);
  }

  // Airship device channel ID that was sent and saved during /registerdevice API call
  // when user opted-in for University push notifications
  public get subscribedDeviceChannelId(): Observable<string> {
    return this.storage.getItem<string>(this.subscribedDeviceChannelIdKey);
  }

  // Token used for push notifications, for iOS it comes from Airship, for Android from Firebase
  private get devicePushNotificationToken(): Observable<string> {
    return this.storage.getItem<string>(this.devicePushNotificationTokenKey);
  }

  // Token used for push notifications that was sent and saved during /device API call
  // when user opted-in for Messenger push notifications
  private get subscribedPushNotificationToken(): Observable<string> {
    return this.storage.getItem<string>(this.subscribedPushNotificationTokenKey);
  }

  // Shows if University push notifications were enabled
  public get universityPushNotificationEnabled(): Observable<boolean> {
    return this.storage.getItem<string>(this.subscribedDeviceChannelIdKey).pipe(
      map((v) => {
        return !!v;
      })
    );
  }

  // Shows if Messenger push notifications were enabled
  public get messengerPushNotificationEnabled(): Observable<boolean> {
    return this.storage.getItem<string>(this.subscribedPushNotificationTokenKey).pipe(
      map((v) => {
        return !!v;
      })
    );
  }

  // Shows if user chose "Don't allow" during initial push notifications prompt
  public get disallowUniversityNotification(): Observable<boolean> {
    return this.storage.getItem<boolean>(this.disallowUniversityPushNotificationKey);
  }

  // Shows if push notifications are allowed on system level
  public get systemPushNotificationStatus(): Observable<AppNotificationStatus> {
    return this.storage.getItem<AppNotificationStatus>(this.systemPushNotificationStatusKey);
  }

  // Shows if push notification initialization process was finished
  private get isPushNotificationInitialized(): Observable<boolean> {
    return this.storage.getItem<boolean>(this.isPushNotificationInitializedKey);
  }

  // Shows if University push notifications were initialized
  private get universityPushNotificationInitialized(): Observable<boolean> {
    return this.storage.getItem<boolean>(this.isUniversityNotificationInitializedKey);
  }

  // Shows if push notifications prompt has been shown to the user
  private get displayedPushNotificationPrompt(): Observable<boolean> {
    return this.storage.getItem<boolean>(this.displayedUniversityPushNotificationPromptKey);
  }

  // Shows if biometrics prompt was shown to the user,
  // push notifications prompt will be shown after this flag is set to true
  public get isSecAuthSetupScreenDisplayed(): Observable<boolean> {
    return this.storage.getItem<boolean>(this.isSecAuthSetupScreenDisplayedKey);
  }

  constructor(
    private firebase: FirebaseX,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private globalConfigs: GlobalConfigsService,
    private storage: StorageService,
    private messengerService: MessengerService,
    private chatService: ChatService,
    private airshipService: AirshipService,
    private pecAirshipService: PecAirshipService,
    private mobileService: MobileService,
    private platform: Platform
  ) {
    platform.ready().then(() => {
      if (this.globalConfigs.isCordova) {
        this.init();
        this.verifySystemPushNotificationsStatus();
      }
    });
  }

  public init() {
    if (this.globalConfigs.isImpersonatedUser || !this.globalConfigs.isCordova) {
      return;
    }

    document.addEventListener('urbanairship.registration', this.onUaRegistration);
    document.addEventListener('urbanairship.inbox_updated', this.onUaInboxUpdated);
    document.addEventListener('urbanairship.deep_link', this.handleDeepLink);
    document.addEventListener('urbanairship.notification_opened', this.onNotificationOpened);

    if (!this.subscriptions.onTokenRefresh && this.globalConfigs.isAndroid) {
      this.subscriptions.onTokenRefresh = this.firebase.onTokenRefresh().subscribe(
        (token) => this.onAndroidFirebaseTokenRefresh(token),
        (error) => this.globalConfigs.displayDebugError('Error occured in Firebase onTokenRefresh: ' + error)
      );
    }

    this.airshipService.getChannelId().then((deviceChannelId) => {
      if (deviceChannelId) {
        this.storage.setItem(this.deviceChannelIdKey, deviceChannelId, true);
      }
    });
  }

  public enableMessengerPushNotification(quietMode: boolean = false) {
    return new Promise<boolean>((resolve, reject) => {
      this.saveMessengerPushNotificationRegistration().then(
        (sbRegistrationSuccess: boolean) => {
          if (!sbRegistrationSuccess) {
            if (!quietMode) {
              this.showMessage('Sorry, an error occured. Please try again.');
            }

            resolve(false);
            return;
          }

          if (!quietMode) {
            this.showMessage(`${this.globalConfigs.brandName} messenger notifications enabled successfully.`);
          }

          resolve(true);
        },
        (error) => {
          this.globalConfigs.displayDebugError(error);

          if (!quietMode) {
            this.showMessage('Sorry, an error occured. Please try again.');
          }

          reject(error);
        }
      );
    });
  }

  public disableMessengerPushNotification(quietMode: boolean = false) {
    return new Promise<boolean>((resolve, reject) => {
      const successMessage = `Disabled ${this.globalConfigs.brandName} messenger notifications successfully.`;
      const failureMessage = 'Sorry, an error occured while turning off messenger notification. Please try again.';

      this.removeMessengerPushNotificationRegistration().then(
        (disabledChatNotification: boolean) => {
          if (!quietMode) {
            this.showMessage(disabledChatNotification ? successMessage : failureMessage);
          }

          resolve(disabledChatNotification);
        },
        (error) => {
          this.globalConfigs.displayDebugError(error);

          if (!quietMode) {
            this.showMessage(failureMessage);
          }

          reject(error);
        }
      );
    });
  }

  public upgradeFirstRun(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.globalConfigs.isAppUpgraded.pipe(first()).subscribe((isUpgraded) => {
        // run only once after update
        if (isUpgraded) {
          resolve();
          return;
        }

        this.storage.setItem<string>('isAppUpgradedKey', 'yes');

        const obs = forkJoin([
          this.systemPushNotificationStatus.pipe(first()),
          this.chatService.getDeviceRegistration().pipe(first()),
          this.chatService.getUrbanAirShipDeviceChannelId().pipe(first()),
          this.deviceChannelId.pipe(first()),
          this.devicePushNotificationToken.pipe(first()),
        ]);

        obs.subscribe(
          ([appNotificationStatus, deviceReg, urbanReg, deviceChannelId, pushRegistrationToken]) => {
            // run only if app notifications are allowed on device level
            if (appNotificationStatus === AppNotificationStatus.ENABLE) {
              const promises = [];
              const universityEnabled = urbanReg && urbanReg[0] && urbanReg[0].OptedInByArea;
              const messengerEnabled = !!(deviceReg && deviceReg[0]);

              if (universityEnabled) {
                promises.push(
                  this.storage.setItem<string>(this.subscribedDeviceChannelIdKey, deviceChannelId),
                  this.storage.setItem(this.isUniversityNotificationInitializedKey, true, true),
                  this.storage.setItem(this.isPushNotificationInitializedKey, true, true),
                  this.storage.setItem(this.displayedUniversityPushNotificationPromptKey, true, true)
                );
              }

              if (messengerEnabled && universityEnabled) {
                promises.push(this.setRegisteredPushNotificationToken(pushRegistrationToken));
              }

              // after everything is saved to local storage, proceed as usual
              if (promises.length > 0) {
                concat(promises).subscribe(
                  () => {},
                  () => {},
                  () => resolve()
                );
              } else {
                resolve();
              }
            } else {
              resolve();
            }
          },
          (error) => reject(error)
        );
      });
    });
  }

  public verifySystemPushNotificationsStatus() {
    return new Promise<boolean>((resolve, reject) => {
      this.getSystemPushNotificationStatusIos().then(
        (isSystemNotificationEnabled) => {
          const systemNotificationNextStatus = isSystemNotificationEnabled
            ? AppNotificationStatus.ENABLE
            : AppNotificationStatus.DISABLE;
          this.systemPushNotificationStatus.pipe(first()).subscribe(
            (systemNotificationCurrentStatus: AppNotificationStatus) => {
              if (systemNotificationCurrentStatus !== systemNotificationNextStatus) {
                this.storage.setItem(this.systemPushNotificationStatusKey, systemNotificationNextStatus, true);
              }

              resolve(isSystemNotificationEnabled);
            },
            (error) => {
              this.globalConfigs.displayDebugError(error);

              reject(error);
            }
          );
        },
        (error) => {
          this.globalConfigs.displayDebugError(error);

          reject(error);
        }
      );
    });
  }

  public subscribePushNotificationEvents() {
    if (!this.globalConfigs.isCordova) {
      return;
    }

    if (!this.subscriptions.isPushNotificationInitialized) {
      this.subscriptions.isPushNotificationInitialized = this.isPushNotificationInitialized.subscribe(
        (pushInitialized: boolean) => {
          if (!pushInitialized) {
            this.initializeAirshipAndGetFcmToken().then((pushRegistered: boolean) => {
              if (pushRegistered) {
                this.storage.setItem(this.isPushNotificationInitializedKey, true, true);
              }
            });
          } else {
            // Update device channel id in notification service everytime user login or a new channel id assigned to device
            if (!this.subscriptions.deviceChannelId) {
              this.subscriptions.deviceChannelId = this.deviceChannelId.subscribe((deviceChannelId: string) => {
                if (deviceChannelId) {
                  this.onDeviceChannelUpdated(deviceChannelId);
                }
              });
            }

            if (!this.subscriptions.universityNotificationEnabled) {
              this.subscriptions.universityNotificationEnabled = this.universityPushNotificationEnabled.subscribe(
                (univNotificationEnabled: boolean) => {
                  this.onUniversityPushNotificationStatusChanged(univNotificationEnabled);
                }
              );
            }

            // Update push registration token in sendbird everytime a new token assigned to the device
            if (!this.subscriptions.pushRegistrationToken) {
              this.subscriptions.pushRegistrationToken = this.devicePushNotificationToken.subscribe(
                (pushToken: string) => {
                  if (pushToken) {
                    this.onPushRegistrationTokenUpdated(pushToken);
                  }
                }
              );
            }

            if (!this.subscriptions.appNotificationStatus) {
              this.subscriptions.appNotificationStatus = this.systemPushNotificationStatus.subscribe(
                (appNotificationStatusChanged: AppNotificationStatus) => {
                  this.onAppNotificationStatusChanged(appNotificationStatusChanged);
                }
              );
            }

            if (!this.subscriptions.appStatus) {
              this.subscriptions.appStatus = this.globalConfigs.appStatus.subscribe((v: string) => {
                if (v) {
                  this.onAppPauseResume(v);
                }
              });
            }

            this.airshipService.subscribeEvents();
          }
        }
      );
    }
  }

  public disableUniversityPushNotification(quietMode: boolean = false, initialInstall: boolean = false) {
    return new Promise<boolean>((resolve, reject) => {
      const successMessage = 'Disabled university notification successfully.';
      const failureMessage = 'Sorry, an error occured while turning off university notification. Please try again.';

      return new Promise<boolean>((resolve2, reject2) => {
        //opt-out university notifications
        this.subscribeDevice(false, initialInstall).then(
          (unsubscribeUnivNotification: boolean) => {
            if (!unsubscribeUnivNotification) {
              resolve2(false);
              return;
            }

            resolve2(true);
          },
          (error) => {
            this.globalConfigs.displayDebugError(error);

            reject2(error);
          }
        );
      }).then(
        (disabledUnivNotification: boolean) => {
          return new Promise<boolean>((resolve3, reject3) => {
            if (!disabledUnivNotification) {
              resolve3(false);
              return;
            }

            this.unregisterAirshipPushNotification().then(
              (unregisteredPushNotification: boolean) => {
                if (!unregisteredPushNotification) {
                  resolve3(false);
                  return;
                }

                resolve3(true);
              },
              (error) => {
                this.globalConfigs.displayDebugError(error);

                reject3(error);
              }
            );
          }).then(
            (response: boolean) => {
              if (!quietMode) {
                this.showMessage(response ? successMessage : failureMessage);
              }

              resolve(response);
            },
            (error) => {
              this.globalConfigs.displayDebugError(error);

              if (!quietMode) {
                this.showMessage(failureMessage);
              }

              reject(error);
            }
          );
        },
        (error) => {
          this.globalConfigs.displayDebugError(error);

          if (!quietMode) {
            this.showMessage(failureMessage);
          }

          reject(error);
        }
      );
    });
  }

  public enableUniversityPushNotification(quietMode: boolean = false, enableMessengerNotification: boolean = true) {
    return new Promise<boolean>((resolve, reject) => {
      const successMessage = 'Enabled university notification successfully.';
      const failureMessage = 'Sorry, an error occured while turning on university notification. Please try again.';

      const failureCallback = (error) => {
        this.globalConfigs.displayDebugError(error);

        if (!quietMode) {
          this.showMessage(failureMessage);
        }

        reject(error);
      };

      this.universityPushNotificationEnabled.pipe(first()).subscribe((univNotificationEnabled: boolean) => {
        if (univNotificationEnabled) {
          if (!quietMode) {
            this.showMessage(successMessage);
          }

          resolve(true);
          return;
        }

        this.initializeAirshipAndGetFcmToken().then(
          (registerForPushNotification: boolean) => {
            if (!registerForPushNotification) {
              failureCallback('Unable to register device for push notifications.');
              return;
            }

            // opt-in university notifications
            this.subscribeDevice(true).then(
              (subscribeDevice: boolean) => {
                if (!subscribeDevice) {
                  failureCallback('Unable to subscribe device for push notifications.');
                  return;
                }

                if (!quietMode) {
                  this.showMessage(successMessage);
                }

                resolve(true);
              },
              (error) => failureCallback(error)
            );
          },
          (error) => failureCallback(error)
        );
      });
    });
  }

  public unsubscribeEvents() {
    this.airshipService.unsubscribeEvents();
    this.clearAllSubscriptions();

    if (this.verifyAppNotificationStatusInterval) {
      clearInterval(this.verifyAppNotificationStatusInterval);
      this.verifyAppNotificationStatusInterval = 0;
    }
  }

  private setRegisteredPushNotificationToken(token: string) {
    return this.storage.setItem(this.subscribedPushNotificationTokenKey, token);
  }

  // for iOS it comes from Airship, for Android from Firebase
  private setDevicePushNotificationToken(token: string) {
    return this.storage.setItem(this.devicePushNotificationTokenKey, token, true);
  }

  // Check if notifications are allowed for the app on the system level in iOS only
  // Always true for Android
  private getSystemPushNotificationStatusIos() {
    return new Promise<boolean>((resolve, reject) => {
      if (!this.globalConfigs.isCordova) {
        reject('Push notification plugin is not available.');
        return;
      }

      this.firebase.hasPermission().then(
        (hasPermission) => resolve(hasPermission),
        (error) => reject(error)
      );
    });
  }

  private onAndroidFirebaseTokenRefresh(fbPushRegistrationToken: string) {
    if (!fbPushRegistrationToken) {
      this.globalConfigs.displayDebugError('Error in onAndroidFirebaseTokenRefresh: fbPushRegistrationToken is null');
      return;
    }

    this.devicePushNotificationToken.pipe(first()).subscribe((pushRegistrationToken) => {
      if (pushRegistrationToken == null || fbPushRegistrationToken !== pushRegistrationToken) {
        this.setDevicePushNotificationToken(fbPushRegistrationToken);
      }
    });
  }

  private clearAllSubscriptions() {
    for (const key in this.subscriptions) {
      if (this.subscriptions[key]) {
        if (this.subscriptions[key].unsubscribe) {
          this.subscriptions[key].unsubscribe();
        }

        delete this.subscriptions[key];
      }
    }
  }

  private subscribeDevice(optIn: boolean, initialInstall: boolean = false) {
    return new Promise<boolean>((resolve, reject) => {
      this.deviceChannelId.pipe(first()).subscribe(
        (deviceChannelId: string) => {
          if (!deviceChannelId) {
            reject('Error occured in subscribeDevice: deviceChannelId not found.');
            return;
          }

          this.mobileService
            .saveDeviceRegistration(deviceChannelId, optIn)
            .pipe(first())
            .subscribe(
              () => {
                this.subscribedDeviceChannelId.pipe(first()).subscribe((subscribedDeviceChannelId: string) => {
                  if (optIn || initialInstall) {
                    if (subscribedDeviceChannelId == null || deviceChannelId !== subscribedDeviceChannelId) {
                      if (optIn) {
                        this.storage.setItem(this.subscribedDeviceChannelIdKey, deviceChannelId, true);
                      }
                    }
                  } else {
                    this.storage.removeItem(this.subscribedDeviceChannelIdKey);
                  }

                  resolve(true);
                });
              },
              (error) => reject(error)
            );
        },
        (error) => reject(error)
      );
    });
  }

  private onAppPauseResume(event: string) {
    if (event === 'resume') {
      this.messengerService.setForegroundState();
      this.verifySystemPushNotificationsStatus();
    } else if (event === 'pause') {
      this.messengerService.setBackgroundState();
    }
  }

  // called every time after user logs in or when device channel ID is update
  private onDeviceChannelUpdated(deviceChannelId: string) {
    return new Promise<boolean>((resolve, reject) => {
      if (!deviceChannelId || this.globalConfigs.isImpersonatedUser || this.globalConfigs.isDemoUser) {
        resolve(false);
        return;
      }

      this.universityPushNotificationInitialized.pipe(first()).subscribe((isUnivNotificationInitialized: boolean) => {
        if (!isUnivNotificationInitialized) {
          this.verifySystemPushNotificationsStatus().then(() => {
            this.promptToAllowUniversityPushNotification().then(
              (univNotificationInitialized: boolean) => {
                if (univNotificationInitialized) {
                  this.storage.setItem(this.isUniversityNotificationInitializedKey, true, true);
                  resolve(true);
                }
              },
              (error) => reject(error)
            );
          });
        } else {
          // make /registerdevice call on every user login
          this.universityPushNotificationEnabled.pipe(first()).subscribe((univNotificationEnabled: boolean) => {
            this.subscribeDevice(univNotificationEnabled).then(
              () => resolve(true),
              (error) => reject(error)
            );
          });
        }
      });
    });
  }

  private onUniversityPushNotificationStatusChanged(universityNotificationEnabled: boolean) {
    if (universityNotificationEnabled) {
      this.enableMessengerPushNotification(true);

      //disable timer to pull inbox message and use the event to pull the record
      this.airshipService.setInboxRefreshInterval(false);
    } else {
      this.disableMessengerPushNotification(true);

      //set a timer to pull record for inbox message in certain interval.
      this.airshipService.setInboxRefreshInterval(true);
    }
  }

  private onPushRegistrationTokenUpdated(pushRegistrationToken: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.messengerPushNotificationEnabled.pipe(first()).subscribe(
        (chatNotificationEnabled: boolean) => {
          if (!chatNotificationEnabled) {
            resolve(false);
            return;
          }

          // if chat notification is already enabled then update the sendbird push registration if it's different
          this.subscribedPushNotificationToken.pipe(first()).subscribe((sbRegistrationToken: string) => {
            if (sbRegistrationToken === pushRegistrationToken) {
              resolve(true);
              return;
            }

            this.initializeAirshipAndGetFcmToken().then(
              (chatRegistrationUpdated: boolean) => {
                if (!chatRegistrationUpdated) {
                  resolve(false);
                  return;
                }

                resolve(true);
              },
              (error) => reject(error)
            );
          });
        },
        (error) => reject(error)
      );
    });
  }

  private onAppNotificationStatusChanged(appNotificationStatus: AppNotificationStatus): void {
    if (this.globalConfigs.isIos) {
      this.universityPushNotificationEnabled.pipe(first()).subscribe((univNotificationEnabled: boolean) => {
        if (appNotificationStatus === AppNotificationStatus.ENABLE && !univNotificationEnabled) {
          this.enableUniversityPushNotification();
        } else if (appNotificationStatus === AppNotificationStatus.DISABLE && univNotificationEnabled) {
          this.disableUniversityPushNotification();
        } else if (appNotificationStatus === AppNotificationStatus.DISABLE && !univNotificationEnabled) {
          this.subscribeDevice(false, true);
        }
      });
    }
  }

  private showPromptToAllowPushNotifications() {
    if (this.alert) {
      return;
    }

    return new Promise<string>((resolve, reject) => {
      this.showAlert(
        `"${this.globalConfigs.brandName} Student Mobile" Would Like to Send You Notifications`,
        'Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.',
        'Allow',
        "Don't Allow"
      ).then(
        (action: string) => {
          this.storage.setItem(this.displayedUniversityPushNotificationPromptKey, true, true);
          if (action === 'none') {
            this.storage.removeItem(this.isPushNotificationInitializedKey);
            this.storage.removeItem(this.isUniversityNotificationInitializedKey);
          }
          resolve(action);
        },
        (error) => reject(error)
      );
    });
  }

  private showAlert(title: string, message: string, okButtonText: string = null, cancelButtonText: string = null) {
    return new Promise<string>((resolve, reject) => {
      let action = 'none';

      if (!okButtonText) {
        okButtonText = 'ok';
      }

      if (!cancelButtonText) {
        cancelButtonText = 'cancel';
      }

      this.alertCtrl
        .create({
          header: title,
          message,
          buttons: [
            {
              text: cancelButtonText,
              handler: () => {
                action = 'Cancel';
              },
            },
            {
              text: okButtonText,
              handler: () => {
                action = 'OK';
              },
            },
          ],
          backdropDismiss: false,
        })
        .then((alert) => {
          this.alert = alert;

          alert.onDidDismiss().then(() => {
            resolve(action);
            delete this.alert;
          });

          alert.present();
        });
    });
  }

  private promptToAllowUniversityPushNotification() {
    return new Promise<boolean>((resolve, reject) => {
      return new Promise<boolean>((resolve2, reject2) => {
        if (this.globalConfigs.isIos) {
          //check app notification status next 1 min with 3 sec interval to get the accurate result.
          let retryCount = 1;
          this.verifyAppNotificationStatusInterval = window.setInterval(() => {
            this.verifySystemPushNotificationsStatus().then(
              (isSystemNotificationEnabled) => {
                if (isSystemNotificationEnabled) {
                  clearInterval(this.verifyAppNotificationStatusInterval);
                  this.verifyAppNotificationStatusInterval = 0;

                  resolve2(true);
                  return;
                }

                if (retryCount >= 180) {
                  clearInterval(this.verifyAppNotificationStatusInterval);
                  this.verifyAppNotificationStatusInterval = 0;

                  resolve2(false);
                  return;
                }

                retryCount += 1;
              },
              () => {
                retryCount += 1;
              }
            );
          }, 1000);
        } else {
          this.displayedPushNotificationPrompt.pipe(first()).subscribe((displayedPushNotificationPrompt: boolean) => {
            if (displayedPushNotificationPrompt) {
              this.disallowUniversityNotification.pipe(first()).subscribe(
                (disallowUnivNotification: boolean) => resolve2(!disallowUnivNotification),
                (error) => reject2(error)
              );
            }

            //show prompt to allow push notification for android
            this.showPromptToAllowPushNotifications().then(
              (action: string) => {
                if (action !== 'OK') {
                  this.storage.setItem(this.disallowUniversityPushNotificationKey, true, true).then(() => {
                    this.disableMessengerPushNotification(true);
                  });
                  resolve2(false);
                  return;
                }

                this.verifySystemPushNotificationsStatus().then(
                  (isSystemNotificationEnabled) => {
                    if (!isSystemNotificationEnabled) {
                      // TODO show prompt to settings
                    }

                    resolve2(isSystemNotificationEnabled);
                  },
                  (error) => reject2(error)
                );
              },
              (error) => reject2(error)
            );
          });
        }
      }).then((allowNotification: boolean) => {
        if (!allowNotification) {
          this.disableUniversityPushNotification(true, true).then(
            () => resolve(true),
            (error) => reject(error)
          );
        } else {
          this.enableUniversityPushNotification().then(
            () => resolve(true),
            (error) => reject(error)
          );
        }
      });
    });
  }

  private unregisterAirshipPushNotification() {
    if (!this.globalConfigs.isCordova) {
      return;
    }

    return this.pecAirshipService.unregisterUaPushNotification();
  }

  private registerAirshipPushNotification() {
    if (!this.globalConfigs.isCordova) {
      return;
    }

    return this.pecAirshipService.registerForUaPushNotifications();
  }

  private getFirebaseTokenForAndroidPushNotifications() {
    return new Promise<string>((resolve, reject) => {
      if (!this.globalConfigs.isCordova) {
        reject('Firebase plugin is not available.');
      }

      const getFirebaseToken = () => {
        this.firebase.getToken().then(
          (token) => {
            resolve(token);
          },
          (error) => reject(error)
        );
      };

      this.firebase.hasPermission().then(
        (hasPermission) => {
          if (!hasPermission) {
            this.firebase.grantPermission().then(
              (isGranted) => {
                if (!isGranted) {
                  reject('Permission to use push notifications was not granted.');
                }

                getFirebaseToken();
              },
              (error) => reject(error)
            );
          } else {
            getFirebaseToken();
          }
        },
        (error) => reject(error)
      );
    });
  }

  private initializeAirshipAndGetFcmToken() {
    const getAndSaveFirebaseTokenForAndroidPushNotifications = (resolve, reject) => {
      if (this.globalConfigs.isIos) {
        resolve(true);
      } else {
        this.getFirebaseTokenForAndroidPushNotifications().then(
          (fcmPushRegistrationToken: string) => {
            if (fcmPushRegistrationToken) {
              this.devicePushNotificationToken.pipe(first()).subscribe((pushRegistrationToken) => {
                if (pushRegistrationToken == null || fcmPushRegistrationToken !== pushRegistrationToken) {
                  this.setDevicePushNotificationToken(fcmPushRegistrationToken);
                }

                resolve(true);
              });
            } else {
              resolve(true);
              //reject('Error in getFirebaseTokenForAndroidPushNotifications: fcmPushRegistrationToken is null');
            }
          },
          (error) => reject(error)
        );
      }
    };

    return new Promise<boolean>((resolve, reject) => {
      this.registerAirshipPushNotification().then(
        (uaRegistration: boolean) => {
          if (!uaRegistration) {
            reject('UA registration was not successful.');
            return;
          }

          getAndSaveFirebaseTokenForAndroidPushNotifications(resolve, reject);
        },
        (error) => reject(error)
      );
    });
  }

  private saveMessengerPushNotificationRegistration(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.globalConfigs.isCordova) {
        reject('Unsupported platform for push notification.');
        return;
      }

      this.subscriptions.sendbirdEnabled = this.messengerService.sendbirdEnabled.subscribe((chatEnabled: number) => {
        if (chatEnabled !== 1) {
          return;
        }

        this.subscriptions.devicePushNotificationToken = this.devicePushNotificationToken
          .pipe(
            filter((t) => t !== null),
            timeout(5000)
          )
          .subscribe(
            (pushRegistrationToken: string) => {
              if (!pushRegistrationToken) {
                reject('Error occured in saveMessengerPushNotificationRegistration: no devicePushNotificationToken');
                return;
              }

              this.chatService
                .saveDeviceRegistration(pushRegistrationToken, true)
                .pipe(first())
                .subscribe(
                  (response: DeviceRegistrationResponse) => {
                    if (!response || !response.IsSuccessStatusCode) {
                      reject('Error occured in saveMessengerPushNotificationRegistration: ' + response?.ReasonPhrase);
                      return;
                    }

                    this.setRegisteredPushNotificationToken(pushRegistrationToken).then(
                      () => {
                        this.subscriptions.sendbirdEnabled.unsubscribe();
                        this.subscriptions.devicePushNotificationToken.unsubscribe();

                        resolve(true);
                      },
                      (error) => reject('Error occured in saveMessengerPushNotificationRegistration: ' + error)
                    );
                  },
                  (error) => reject('Error occured in saveMessengerPushNotificationRegistration: ' + error)
                );
            },
            (error) => reject('Error occured in saveMessengerPushNotificationRegistration: ' + error)
          );
      });
    });
  }

  private removeMessengerPushNotificationRegistration(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.globalConfigs.isCordova) {
        reject('Unsupported platform for push notification.');
        return;
      }

      this.subscribedPushNotificationToken.pipe(first()).subscribe(
        (sendBirdRegistrationToken: string) => {
          if (!sendBirdRegistrationToken) {
            // device already unregistered
            resolve(true);
            return;
          }

          this.chatService
            .saveDeviceRegistration(sendBirdRegistrationToken, false)
            .pipe(first())
            .subscribe(
              (response: DeviceRegistrationResponse) => {
                if (!response || !response.IsSuccessStatusCode) {
                  const error =
                    response && response.ReasonPhrase
                      ? response.ReasonPhrase
                      : 'Unregister messenger push notification was not successful';
                  reject(error);
                  return;
                }

                this.storage.removeItem(this.subscribedPushNotificationTokenKey);

                resolve(true);
              },
              (error) => reject(error)
            );
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  private showMessage(message: string) {
    this.toastCtrl.dismiss().finally(() => {
      this.toastCtrl
        .create({
          message,
          duration: 3000,
          position: 'bottom',
          cssClass: 'pec-toast-message',
        })
        .then((toast) => toast.present());
    });
  }
}

export enum AppNotificationStatus {
  NONE = 0,
  ENABLE = 1,
  DISABLE = 2,
}
