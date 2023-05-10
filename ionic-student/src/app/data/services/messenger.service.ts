import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalConfigsService } from '../../shared/services/global-configs.service';
import { StorageService } from '../../shared/services/storage.service';
import { first } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { ChatService } from './chat.service';
import { MessengerUser } from '../types/messenger.type';
import { PecSendbirdService } from '@pec/notifications';

@Injectable({
  providedIn: 'root',
})
export class MessengerService {
  public unreadChannelCount: Observable<number>;

  private readonly sendbirdEnabledStorageKey = 'chatEnabled';

  private isConnectedToSendbird = false;

  public get sendbirdEnabled(): Observable<number> {
    return this.storage.getItem<number>(this.sendbirdEnabledStorageKey);
  }

  constructor(
    private toastCtrl: ToastController,
    private globalConfigs: GlobalConfigsService,
    private storage: StorageService,
    private pecSendbirdService: PecSendbirdService,
    private chatService: ChatService
  ) {
    this.unreadChannelCount = pecSendbirdService.unreadChannelCount;
  }

  public connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.isConnectedToSendbird) {
        resolve(true);
        return;
      }

      this.chatService
        .user()
        .pipe(first())
        .subscribe(
          (data: MessengerUser) => {
            if (!data) {
              reject();
            }

            this.pecSendbirdService
              .connect(data.ApplicationId, data.Id, data.AccessToken)
              .then(() => {
                this.isConnectedToSendbird = true;
                this.setSendbirdEnabled(1).finally(() => resolve(true));
              })
              .catch((error) => {
                this.isConnectedToSendbird = false;
                this.setSendbirdEnabled(0).finally(() => reject(error));
              });
          },
          (error) => reject(error)
        );
    });
  }

  public disconnect() {
    return this.pecSendbirdService.disconnect().then(() => {
      this.isConnectedToSendbird = false;
    });
  }

  public setForegroundState() {
    this.pecSendbirdService.setForegroundState();
  }

  public setBackgroundState() {
    this.pecSendbirdService.setBackgroundState();
  }

  public updateUnreadCount() {
    this.pecSendbirdService.updateUnreadCount();
  }

  private setSendbirdEnabled(value: number) {
    return this.storage.setItem(this.sendbirdEnabledStorageKey, value, true);
  }
}
