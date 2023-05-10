import { Component, ChangeDetectorRef, OnDestroy, NgZone } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { StorageService } from '../../../../shared/services/storage.service';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { TrackingService } from '../../../../shared/services/tracking.service';
import { BasePageComponent } from 'src/app/shared/components/base-page-component/base-page.component';
import { AirshipService } from '../../../../shared/services/airship.service';
import { InboxMessage } from '@pec/notifications';

@Component({
  selector: 'pec-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage extends BasePageComponent implements OnDestroy {
  public showLoading = false;

  public inboxMessages: {
    [id: string]: InboxMessage;
  } = {};
  public alert: HTMLIonAlertElement;
  public objectKeys = Object.keys;
  public schoolLogo = `${
    this.globalConfigs.contentUrl
  }assets/${this.globalConfigs.brandName.toLowerCase()}/images/school-logo-icon.png`;

  public unreadNotificationCount = 0;

  constructor(
    private storage: StorageService,
    public globalConfigs: GlobalConfigsService,
    private airshipService: AirshipService,
    private trackingService: TrackingService,
    private changeDetectorRef: ChangeDetectorRef,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private zone: NgZone
  ) {
    super();
  }

  ionViewDidEnter() {
    this.loadData();

    this.subscriptions.onInboxUpdated = this.airshipService.onInboxUpdated.subscribe((inboxUpdated: boolean) => {
      if (inboxUpdated) {
        this.showLoading = true;

        this.loadInboxMessages().then(() => this.clearLoading());
      }
    });
  }

  public get isEmptyInbox() {
    return !(this.inboxMessages && Object.keys(this.inboxMessages).length > 0);
  }

  public clearLoading() {
    this.showLoading = false;
  }

  public deleteAllMessage() {
    const onDeleteInboxMessages = () => {
      this.zone.run(() => {
        const messageIds = Object.keys(this.inboxMessages);

        if (!(messageIds && messageIds.length)) {
          this.showMessage('There is no notification to delete.');
          return;
        }

        this.showLoading = true;

        this.airshipService.clearInboxMessages(messageIds).subscribe(
          () => {
            this.zone.run(() => {
              this.refreshInbox().then(
                () => {
                  this.clearLoading();
                  this.showMessage('Deleted all notifications successfully.');
                  this.changeDetectorRef.markForCheck();
                },
                (error) => {
                  this.clearLoading();
                  this.globalConfigs.displayDebugError(error);
                  this.changeDetectorRef.markForCheck();
                }
              );
            });
          },
          (error) => {
            this.zone.run(() => {
              this.clearLoading();
              this.globalConfigs.displayDebugError(error);
              this.showMessage('Sorry, an error occured while deleting notifications. Please try again later.');
              this.changeDetectorRef.markForCheck();
            });
          }
        );
      });
    };

    this.showAlert({
      header: 'Delete All Notifications?',
      message: "You won't be able to undo this action.",
      cssClass: '',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            this.trackingService.trackEvent({
              view: 'Notification Center',
              category: 'Notification Center',
              action: 'Tapped Confirmation To Delete',
              label: 'Cancel',
              value: '',
            });
            this.alert.dismiss();
          },
        },
        {
          text: 'Delete All',
          handler: () => {
            this.trackingService.trackEvent({
              view: 'Notification Center',
              category: 'Notification Center',
              action: 'Tapped Confirmation To Delete',
              label: 'Yes',
              value: '',
            });
            onDeleteInboxMessages();
          },
        },
      ],
    });
  }

  public deleteMessage(messageId: string) {
    if (!messageId) {
      this.showMessage('Sorry, an error occured. Please try again later.');
      return;
    }

    this.showLoading = true;
    this.airshipService.deleteInboxMessage(messageId).then(
      (messageDeleted: boolean) => {
        this.clearLoading();

        if (!messageDeleted) {
          this.showMessage('Sorry, an error occured. Please try again later.');
          return;
        }

        if (this.inboxMessages[messageId]) {
          delete this.inboxMessages[messageId];
          this.unreadNotificationCount--;
        }

        this.showMessage('Notification deleted successfully.');
        this.changeDetectorRef.markForCheck();
      },
      (error) => {
        this.clearLoading();
        this.globalConfigs.displayDebugError(error);
        this.showMessage('Sorry, an error occured. Please try again later.');
        this.changeDetectorRef.markForCheck();
      }
    );
  }

  public showAlert(alertOptions) {
    return this.alertCtrl.create(alertOptions).then((alert) => {
      this.alert = alert;

      this.alert.onDidDismiss().then(() => {
        delete this.alert;
      });

      this.alert.present();

      return alert;
    });
  }

  public isValidDate(date: Date): boolean {
    return !isNaN(Date.parse(date.toString()));
  }

  public getMessageDuration(dateRecieved: Date): string {
    if (!(dateRecieved && this.isValidDate(dateRecieved))) {
      return '';
    }

    const today: Date = new Date();
    const diff = (today.getTime() - dateRecieved.getTime()) / 1000;
    const dm = Math.abs(Math.round(diff / 60));

    if (dm <= 1) {
      return 'Now';
    } else if (dm <= 60 * 24 && dateRecieved.getDate() === new Date().getDate()) {
      return dateRecieved.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    } else if (
      dm <= 60 * 24 * 7 &&
      dateRecieved.toLocaleString('en-US', { weekday: 'long' }) !==
        new Date().toLocaleString('en-US', { weekday: 'long' })
    ) {
      return dateRecieved.toLocaleString('en-US', { weekday: 'long' });
    } else if (dateRecieved.getFullYear() === new Date().getFullYear()) {
      return dateRecieved.toLocaleString('en-US', { month: 'long', day: 'numeric' });
    } else {
      return dateRecieved.toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
    }
  }

  public showInboxMessageDetails(messageId: string) {
    if (this.globalConfigs.isImpersonatedUser) {
      this.showAlert({
        title: 'Notification Details',
        message: 'This feature is disabled for impersonated user',
        cssClass: '',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              this.alert.dismiss();
            },
          },
        ],
      });
      return;
    }
    if (!(messageId && this.inboxMessages[messageId])) {
      this.showMessage('Sorry, an error occured. Please try again later.');
      return;
    }

    this.airshipService
      .displayInboxMessageDetails(messageId, this.inboxMessages[messageId].isRead)
      .then((displayed) => {
        if (!displayed) {
          this.showMessage('Sorry, an error occured. Please try again later.');
          return;
        }

        if (this.inboxMessages[messageId]) {
          this.inboxMessages[messageId].isRead = true;
        }

        this.changeDetectorRef.markForCheck();
      });
  }

  public showMessage(message: string) {
    this.toastCtrl
      .create({
        message,
        duration: 3000,
        position: 'bottom',
        cssClass: 'pec-toast-message',
      })
      .then((toast) => toast.present());
  }

  private loadInboxMessages() {
    return new Promise<boolean>((resolve, reject) => {
      this.airshipService.getInboxMessages().then(
        (messages: InboxMessage[]) => {
          if (messages && messages.length > 0) {
            if (this.inboxMessages) {
              delete this.inboxMessages;
            }

            this.inboxMessages = {};
            this.unreadNotificationCount = 0;
            for (const message of messages) {
              this.inboxMessages[message.id] = message;
              if (!this.inboxMessages[message.id].isRead) {
                this.unreadNotificationCount++;
              }
            }
          } else {
            this.inboxMessages = {};
          }

          this.changeDetectorRef.markForCheck();
          resolve(true);
        },
        (error) => reject(error)
      );
    });
  }

  private refreshInbox() {
    return new Promise<boolean>((resolve, reject) => {
      this.airshipService.refreshInbox().then(
        () => {
          this.loadInboxMessages().then(
            () => resolve(true),
            (error) => reject(error)
          );
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  private loadData() {
    this.showLoading = true;

    this.refreshInbox().then(
      () => {
        this.clearLoading();
      },
      (error) => {
        this.globalConfigs.displayDebugError(error);
        this.clearLoading();
      }
    );
  }
}
