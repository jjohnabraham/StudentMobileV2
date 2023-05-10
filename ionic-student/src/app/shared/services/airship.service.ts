import { Injectable, NgZone } from '@angular/core';
import { delay, first, share } from 'rxjs/operators';
import { forkJoin, Observable, OperatorFunction, Subject, Subscription } from 'rxjs';
import { StorageService } from './storage.service';
import { GlobalConfigsService } from './global-configs.service';
import { ResourceService } from '../../data/services/resource.service';
import { PecAirshipService } from '@pec/notifications';
import { UrbanAirShip } from '@ionic-native/urbanairship/ngx';

@Injectable({
  providedIn: 'root',
})
export class AirshipService {
  public get notificationOpened(): Observable<string> {
    return this.storage.getItem<string>(this.notificationOpenedKey);
  }

  public onUnreadMessageCountUpdated: Observable<number>;

  public onHasUnreadMessage: Observable<boolean>;

  public onDeepLinkUrlChange: Observable<string>;

  public onInboxUpdated: Observable<boolean>;

  private deepLinkUrl: Subject<string> = new Subject<string>();
  private inboxUpdated: Subject<boolean> = new Subject<boolean>();
  private subscriptions: { [key: string]: Subscription } = {};
  private inboxRefreshInterval = 0;
  private refreshInboxTimer = 0;
  private isDeepLinkKey = 'isDeepLink';
  private notificationOpenedKey = 'notificationOpened';
  private defaultInboxRefreshInterval = 1;

  constructor(
    private storage: StorageService,
    private globalConfigs: GlobalConfigsService,
    private resourceService: ResourceService,
    private pecAirshipService: PecAirshipService,
    private zone: NgZone,
    private urbanAirship: UrbanAirShip
  ) {
    this.onDeepLinkUrlChange = this.deepLinkUrl.asObservable().pipe(share());
    this.onInboxUpdated = this.inboxUpdated.pipe(share());
    this.onUnreadMessageCountUpdated = this.pecAirshipService.unreadMessageCountSubject.asObservable().pipe(share());
    this.onHasUnreadMessage = this.pecAirshipService.hasUnreadMessageSubject.asObservable().pipe(share());
  }

  public subscribeEvents() {
    if (!this.subscriptions.onInboxUpdated) {
      this.subscriptions.onInboxUpdated = this.onInboxUpdated.subscribe((inboxUpdated: boolean) => {
        if (inboxUpdated) {
          this.updateUnreadMessageCount();
        }
      });
    }

    if (!this.subscriptions.onHasUnreadMessage) {
      this.subscriptions.onHasUnreadMessage = this.onHasUnreadMessage.subscribe((hasUnreadMessage: boolean) => {
        if (hasUnreadMessage) {
          this.updateUnreadMessageCount();
        }
      });

      this.checkUnreadMessage();
    }

    if (!this.subscriptions.notificationOpened) {
      this.subscriptions.notificationOpened = this.notificationOpened.pipe(delay(500)).subscribe((v: string) => {
        if (v) {
          this.onPushNotificationOpened(v);
        }
      });
    }

    this.updateUnreadMessageCount();
  }

  public unsubscribeEvents() {
    this.clearAllSubscriptions();

    if (this.globalConfigs.isCordova) {
      this.dismissInboxMessage();
    }
  }

  public updateUaInbox() {
    this.inboxUpdated.next(true);
  }

  public checkUnreadMessage() {
    if (!this.globalConfigs.isCordova) {
      return;
    }

    this.pecAirshipService.checkUnreadMessage().catch((error) => this.globalConfigs.displayDebugError(error));
  }

  public onPushNotificationOpened(messageId: string) {
    this.storage
      .getItem(this.isDeepLinkKey)
      .pipe(first())
      .subscribe((isDeepLink) => {
        if (isDeepLink) {
          this.storage.removeItem(this.isDeepLinkKey);
        } else {
          if (messageId) {
            this.displayInboxMessageDetails(messageId)
              .then(() => {
                this.storage.removeItem(this.notificationOpenedKey);
              })
              .catch((error) => this.globalConfigs.displayDebugError(error));
          }
        }
      });
  }

  public getInboxMessages() {
    if (!this.globalConfigs.isCordova) {
      return;
    }

    return this.pecAirshipService.getInboxMessages().catch((error) => this.globalConfigs.displayDebugError(error));
  }

  public displayInboxMessageDetails(messageId: string, isRead: boolean = false) {
    if (!this.globalConfigs.isCordova) {
      return;
    }

    return this.refreshInbox().then(() => {
      return this.pecAirshipService
        .displayInboxMessageDetails(messageId, isRead)
        .catch((error) => this.globalConfigs.displayDebugError(error));
    });
  }

  public dismissInboxMessage() {
    if (!this.globalConfigs.isCordova) {
      return;
    }

    return this.pecAirshipService.dismissInboxMessage().catch((error) => this.globalConfigs.displayDebugError(error));
  }

  public refreshInbox() {
    return this.pecAirshipService.refreshInbox().catch((error) => this.globalConfigs.displayDebugError(error));
  }

  public deleteInboxMessage(messageId: string) {
    if (!this.globalConfigs.isCordova) {
      return;
    }

    return this.pecAirshipService
      .deleteInboxMessage(messageId)
      .catch((error) => this.globalConfigs.displayDebugError(error));
  }

  public clearInboxMessages(messageIds: string[]) {
    return new Observable<boolean>((subscriber) => {
      if (messageIds.length === 0) {
        subscriber.next(true);
      }

      const promises = [];
      for (const messageId of messageIds) {
        promises.push(this.deleteInboxMessage(messageId));
      }

      forkJoin(promises)
        .pipe(this.runInZone(this.zone))
        .subscribe(
          () => {
            subscriber.next(true);
          },
          (error) => {
            this.globalConfigs.displayDebugError(error);
            subscriber.error(error);
          }
        );
    });
  }

  public setBadgeNumber(count: number) {
    if (!this.globalConfigs.isIos) {
      return;
    }

    return this.pecAirshipService.setBadgeNumber(count).catch((error) => this.globalConfigs.displayDebugError(error));
  }

  public setDeepLinkUrl(url: string) {
    this.storage.setItem(this.isDeepLinkKey, true);
    this.deepLinkUrl.next(url);
  }

  /// The following function will set a timer to update inbox message in certain interval. ///
  /// This is specially required while push notification is turned off since the event "urbanairship.inbox_updated" doesn't fire while push is disabled ///
  public setInboxRefreshInterval(enable: boolean = true) {
    if (this.refreshInboxTimer) {
      clearInterval(this.refreshInboxTimer);
      this.refreshInboxTimer = 0;
    }

    if (enable) {
      this.getInboxRefreshInterval().then((refreshInterval: number) => {
        if (refreshInterval && refreshInterval > 0) {
          const refreshIntervalInMs = refreshInterval * 60 * 1000;

          this.refreshInboxTimer = window.setInterval(() => {
            this.refreshInbox();
          }, refreshIntervalInMs);
        }
      });
    }
  }

  public getChannelId() {
    return this.urbanAirship.getChannelID().catch((error) => this.globalConfigs.displayDebugError(error));
  }

  private runInZone<T>(zone: NgZone): OperatorFunction<T, T> {
    return (source) => {
      return new Observable((observer) => {
        const onNext = (value: T) => zone.run(() => observer.next(value));
        const onError = (e) => zone.run(() => observer.error(e));
        const onComplete = () => zone.run(() => observer.complete());
        return source.subscribe(onNext, onError, onComplete);
      });
    };
  }

  private updateUnreadMessageCount() {
    if (!this.globalConfigs.isCordova) {
      return;
    }

    return this.pecAirshipService
      .updateUnreadMessageCount()
      .catch((error) => this.globalConfigs.displayDebugError(error));
  }

  private getInboxRefreshInterval() {
    return new Promise<number>((resolve, reject) => {
      if (!this.inboxRefreshInterval || this.inboxRefreshInterval <= 0) {
        this.resourceService
          .getConfig('InboxRefreshInterval')
          .pipe(first())
          .subscribe(
            (o) => {
              if (o) {
                const interval: number = parseInt(o, 10);
                this.inboxRefreshInterval = interval && interval > 0 ? interval : this.defaultInboxRefreshInterval;
              } else {
                this.inboxRefreshInterval = this.defaultInboxRefreshInterval;
              }

              resolve(this.inboxRefreshInterval);
            },
            () => {
              this.inboxRefreshInterval = this.defaultInboxRefreshInterval;

              resolve(this.inboxRefreshInterval);
            }
          );
      } else {
        resolve(this.inboxRefreshInterval);
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
}
