import { Injectable } from '@angular/core';
import { PecHttpService } from '../../shared/services/pec-http.service';
import { GlobalConfigsService } from '../../shared/services/global-configs.service';
import { Observable, throwError } from 'rxjs';
import { CampusSetting, MobileSettings, SltToken } from '../types/mobile-settings.type';
import { ThemeId } from '../../shared/enums/theme-id.enum';
import { map } from 'rxjs/operators';
import { CampusId } from '../../shared/enums/campus-id.enum';

@Injectable({
  providedIn: 'root',
})
export class MobileService {
  constructor(private http: PecHttpService, private globalConfigs: GlobalConfigsService) {}

  public settings(refresh?: boolean): Observable<MobileSettings> {
    const deviceType = this.globalConfigs.isIos ? 1 : 2;

    return this.http.request({
      url: `api/mobile/settings?themeId=${this.globalConfigs.themeId}&applicationType=2&mobileDeviceType=${deviceType}`,
      method: 'Get',
      signature:
        'api/mobile/settings?themeId=${this.globalConfigs.themeId}&applicationType=2&mobileDeviceType=${deviceType}',
      config: {
        global: true,
        cache: true,
        refresh,
      },
    });
  }

  public campusSettings(ssid?: number, sycampusid?: number): Observable<CampusSetting> {
    if (!ssid || !sycampusid) {
      ssid = this.globalConfigs.ssid;
      sycampusid = this.globalConfigs.sycampusid;
    }

    if ((!ssid || !sycampusid) && this.globalConfigs.themeId) {
      if (this.globalConfigs.themeId === ThemeId.AIU) {
        ssid = 2;
        sycampusid = CampusId.AIU_ONLINE;
      } else {
        ssid = 3;
        sycampusid = CampusId.CTU_ONLINE;
      }
    }

    if (ssid && sycampusid) {
      return this.settings().pipe(
        map((settings) => {
          if (settings && settings.CampusSettings && settings.CampusSettings.length) {
            return settings.CampusSettings.find((o) => {
              return o.Campus && o.Campus.SourceSystemId === ssid && o.Campus.CampusId === sycampusid;
            });
          }

          return null;
        })
      );
    }
  }

  public getFacultySlt(appId: number): Observable<SltToken> {
    return this.http.request({
      url: `api/mobile/loginAs?type=${appId}`,
      signature: 'api/mobile/loginAs?type=${appId}',
      method: 'Get',
      config: {
        cache: true,
      },
    });
  }

  public saveDeviceRegistration(deviceChannelId: string, optIn: boolean): Observable<string> {
    const request: SaveDeviceRegistrationRequest = new SaveDeviceRegistrationRequest();

    if (!deviceChannelId) {
      return throwError('Invalid parameter: deviceChannelId');
    }

    if (!this.globalConfigs.deviceSpecificId) {
      return throwError('Invalid device ID');
    }

    request.deviceId = this.globalConfigs.deviceSpecificId;
    request.deviceChannelId = deviceChannelId;
    request.optIn = optIn;
    request.applicationVersion = this.globalConfigs.version;
    request.deviceOS = this.globalConfigs.deviceVersion;
    request.deviceTypeDescription = this.globalConfigs.deviceManufacturer;
    request.deviceModel = this.globalConfigs.deviceModel;
    request.deviceMake = this.globalConfigs.deviceManufacturer;
    request.chameleonId = this.globalConfigs.chameleonId;

    if (this.globalConfigs.isIos) {
      request.mobileDeviceType = PlatformType.IOS;
    } else {
      request.mobileDeviceType = PlatformType.ANDROID;
    }

    return this.http.request({
      url: `api/mobile/registerdevice`,
      signature: 'api/mobile/registerdevice',
      method: 'Post',
      body: request,
    });
  }
}

enum PlatformType {
  NONE = 0,
  IOS = 1,
  ANDROID = 2,
}

class SaveDeviceRegistrationRequest {
  public mobileDeviceType: number;
  public deviceChannelId: string;
  public deviceId: string;
  public deviceInfo: string;
  public deviceOS: string;
  public deviceTypeDescription: string;
  public deviceModel: string;
  public deviceMake: string;
  public optIn: boolean;
  public applicationVersion: string;
  public chameleonId: string;
}
