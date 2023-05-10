import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  ChatUniqueContacts,
  DeviceRegistrationDetails,
  DeviceRegistrationResponse,
  MessengerUser,
  UrbanAirshipRegistrationDetails,
} from '../types/messenger.type';
import { PecHttpService } from '../../shared/services/pec-http.service';
import { GlobalConfigsService } from '../../shared/services/global-configs.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private http: PecHttpService, private globalConfigs: GlobalConfigsService) {}

  public user(): Observable<MessengerUser> {
    return this.http.request({
      url: `api/chat/user`,
      method: 'Get',
      signature: 'api/chat/user',
      apiSource: 1,
      config: {
        cache: true,
      },
    });
  }

  public getChatUniqueContacts(): Observable<ChatUniqueContacts> {
    return this.http.request({
      url: 'api/chat/contacts/unique',
      method: 'Get',
      signature: 'api/chat/contacts/unique',
      config: {
        cache: true,
      },
      apiSource: 1,
    });
  }

  public getDeviceRegistration(): Observable<DeviceRegistrationDetails[]> {
    return this.http.request({
      url: `api/chat/device?deviceId=${this.globalConfigs.deviceSpecificId}`,
      signature: 'api/chat/device?deviceId=${this.globalConfigs.deviceSpecificId}',
      method: 'Get',
    });
  }

  public getUrbanAirShipDeviceChannelId(): Observable<UrbanAirshipRegistrationDetails[]> {
    return this.http.request({
      url: `api/chat/uniquedeviceid?uniqueDeviceId=${this.globalConfigs.deviceSpecificId}`,
      signature: 'api/chat/uniquedeviceid?uniqueDeviceId=${this.globalConfigs.deviceSpecificId}',
      method: 'Get',
    });
  }

  public saveDeviceRegistration(pushRegistrationToken: string, optIn: boolean): Observable<DeviceRegistrationResponse> {
    const request: SaveDeviceRegistrationRequest = {
      deviceId: this.globalConfigs.deviceSpecificId,
      channelId: '',
      deviceToken: pushRegistrationToken,
      registrationType: PushNotificationProvider.SENDBIRD,
      applicationType: 2,
      optIn,
      platformType: this.globalConfigs.isIos ? PlatformType.IOS : PlatformType.ANDROID,
    };

    return this.http.request({
      url: `api/chat/device`,
      signature: 'api/chat/device',
      method: 'Post',
      body: request,
      apiSource: 1,
    });
  }
}

enum PlatformType {
  NONE = 0,
  IOS = 1,
  ANDROID = 2,
}

enum PushNotificationProvider {
  NONE = 0,
  URBANAIRSHIP = 1,
  SENDBIRD = 2,
}

interface SaveDeviceRegistrationRequest {
  deviceId: string;
  deviceToken: string;
  channelId: string;
  registrationType: PushNotificationProvider;
  platformType: PlatformType;
  applicationType: number;
  optIn: boolean;
}
