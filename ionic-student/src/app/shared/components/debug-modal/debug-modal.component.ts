import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BaseComponent } from '../base-component/base.component';
import { StorageService } from '../../services/storage.service';
import { combineLatest, forkJoin, zip } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'pec-debug-modal',
  templateUrl: './debug-modal.component.html',
  styleUrls: ['./debug-modal.component.scss'],
})
export class DebugModalComponent extends BaseComponent {
  public subscribedPushNotificationToken: string;
  public devicePushNotificationToken: string;
  public deviceChannelId: string;
  public subscribedDeviceChannelId: string;
  public disallowUniversityPushNotification: string;
  public systemPushNotificationStatus: string;
  public isPushNotificationInitialized: string;
  public isUniversityNotificationInitialized: string;
  public displayedUniversityPushNotificationPrompt: string;
  public isSecAuthSetupScreenDisplayed: string;

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

  constructor(private modalCtrl: ModalController, private storage: StorageService) {
    super();
  }

  ionViewDidEnter() {
    this.subscriptions.subs = combineLatest([
      this.storage.getItem<string>(this.subscribedPushNotificationTokenKey).pipe(startWith(null)),
      this.storage.getItem<string>(this.devicePushNotificationTokenKey).pipe(startWith(null)),
      this.storage.getItem<string>(this.deviceChannelIdKey).pipe(startWith(null)),
      this.storage.getItem<string>(this.subscribedDeviceChannelIdKey).pipe(startWith(null)),
      this.storage.getItem<string>(this.disallowUniversityPushNotificationKey).pipe(startWith(null)),
      this.storage.getItem<string>(this.systemPushNotificationStatusKey).pipe(startWith(null)),
      this.storage.getItem<string>(this.isPushNotificationInitializedKey).pipe(startWith(null)),
      this.storage.getItem<string>(this.isUniversityNotificationInitializedKey).pipe(startWith(null)),
      this.storage.getItem<string>(this.displayedUniversityPushNotificationPromptKey).pipe(startWith(null)),
      this.storage.getItem<string>(this.isSecAuthSetupScreenDisplayedKey).pipe(startWith(null)),
    ]).subscribe(
      ([
        subscribedPushNotificationToken,
        devicePushNotificationToken,
        deviceChannelId,
        subscribedDeviceChannelId,
        disallowUniversityPushNotification,
        systemPushNotificationStatus,
        isPushNotificationInitialized,
        isUniversityNotificationInitialized,
        displayedUniversityPushNotificationPrompt,
        isSecAuthSetupScreenDisplayed,
      ]) => {
        this.subscribedPushNotificationToken = subscribedPushNotificationToken;
        this.devicePushNotificationToken = devicePushNotificationToken;
        this.deviceChannelId = deviceChannelId;
        this.subscribedDeviceChannelId = subscribedDeviceChannelId;
        this.disallowUniversityPushNotification = disallowUniversityPushNotification;
        this.systemPushNotificationStatus = systemPushNotificationStatus;
        this.isPushNotificationInitialized = isPushNotificationInitialized;
        this.isUniversityNotificationInitialized = isUniversityNotificationInitialized;
        this.displayedUniversityPushNotificationPrompt = displayedUniversityPushNotificationPrompt;
        this.isSecAuthSetupScreenDisplayed = isSecAuthSetupScreenDisplayed;
      }
    );
  }

  public closeModal() {
    this.modalCtrl.dismiss();
  }
}
