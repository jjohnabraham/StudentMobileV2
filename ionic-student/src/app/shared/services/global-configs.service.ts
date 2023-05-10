import { Injectable, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StorageService } from './storage.service';
import { forkJoin, Observable, Subject, Subscription } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Device } from '@ionic-native/device/ngx';
import { HashProviderService } from './hash-provider.service';
import { ThemeId } from '../enums/theme-id.enum';
import { CampusId } from '../enums/campus-id.enum';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ScreenOrientation, ScreenOrientationService } from './screen-orientation.service';

declare global {
  interface Window {
    cecPreferences: any;
    CacheClear: any;
    chmln: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class GlobalConfigsService {
  public readonly aiuGroundTechSupportPhone = '866-907-4213';
  public readonly ctuTechSupportPhone = '847-783-8937';
  public readonly aiuOnlineTechSupportPhone = '847-585-2268';

  public apiUrl: string;
  public assetsUrl: string;
  public contentUrl: string;
  public customUrlScheme: string;
  public environment: EnvironmentType;
  public isAndroid: boolean;
  public isCordova: boolean;
  public isDemoUser: boolean;
  public isDevelopment: boolean;
  public isLocalhost: boolean;
  public isImpersonatedUser: boolean;
  public isIos: boolean;
  public isProduction: boolean;
  public isWeb: boolean;
  public messengerApiUrl: string;
  public messengerUrl: string;
  public requireNavigationConfirmation: boolean;
  public themeId: ThemeId;
  public brandName: string;
  public disableConnectMenuClick: boolean;
  public chameleonId: string;
  public appStatus: Observable<string>;
  public onAndroidBackPress: Observable<boolean>;

  public get cacheSuffix() {
    if (window.cecPreferences) {
      return window.cecPreferences['com.careered.cacheSuffix'];
    }

    return this._cacheSuffix;
  }

  public get trackingUrl(): string {
    return `https://${this.brandName}-student-${this.environment}/`.toLowerCase();
  }

  public get ssid(): number {
    return this._ssid;
  }

  public set ssid(v: number) {
    this._ssid = v;

    this.storage.setItem<number>(this._ssidKey, v, true);
  }

  public get unsupportedPhone(): string {
    return this._unsupportedPhone;
  }

  public set unsupportedPhone(phone: string) {
    this._unsupportedPhone = phone;

    this.storage.setItem<string>('UnsupportedStudentPhoneNumber', phone, true);
  }

  public get sycampusid(): CampusId {
    return this._sycampusid;
  }

  public set sycampusid(v: CampusId) {
    this._sycampusid = v;

    this.storage.setItem<CampusId>(this._campusidKey, v, true);
  }

  public get appSpecificId(): string {
    return this._appSpecificId || '';
  }

  public get deviceSpecificId(): string {
    return this._deviceSpecificId || '';
  }

  public get deviceModel(): string {
    return this._deviceModel || '';
  }

  public get deviceManufacturer(): string {
    return this._deviceManufacturer || '';
  }

  public get deviceVersion(): string {
    return this._deviceVersion || '';
  }

  public get devicePlatform(): string {
    return this._devicePlatform || '';
  }

  public get version(): string {
    return this._version || '';
  }

  public get packageName(): string {
    return this._packageName || '';
  }

  public get appName(): string {
    return (
      this._appName ||
      (this.isProduction
        ? `${this.brandName} Student Mobile`
        : `${this.brandName} Student Mobile ${this.environment.toUpperCase()}`)
    );
  }

  public get initialized(): boolean {
    return this._initialized;
  }

  public get isAppUpgraded(): Observable<string> {
    return this.storage.getItem<string>(this._isAppUpgradedKey);
  }

  public get chameleonKey(): string {
    return this.isProduction
      ? 'S6VYEPkvUizgXsyKvtgYUGWrD8mkUhBIVNMfrrgdV6qHAU-1M1VfV-D0liiZvfuj4e5KEY'
      : 'SaXKDr1ol4fQbLlKc4QMOomTCpGRDXsDopv5LGLteCqJJe-1OBK2e-DUZULBiO9TbyK28R';
  }

  private _cacheSuffix = `${new Date().getTime()}`;
  private _subscriptions: { [key: string]: boolean | Subscription } = {};
  private _ssid: number;
  private _sycampusid: CampusId;
  private _appSpecificId: string;
  private _deviceSpecificId: string;
  private _deviceModel: string;
  private _deviceManufacturer: string;
  private _deviceVersion: string;
  private _devicePlatform: string;
  private _version: string;
  private _packageName: string;
  private _appName: string;
  private _initialized = false;
  private _ssidKey: string;
  private _campusidKey: string;
  private _appStatusSubject: Subject<string> = new Subject<string>();
  private _unsupportedPhone: string;
  private _isAppUpgradedKey = 'isAppUpgradedKey';

  constructor(
    private platform: Platform,
    private zone: NgZone,
    private appVersion: AppVersion,
    private device: Device,
    private storage: StorageService,
    private hashService: HashProviderService,
    private iab: InAppBrowser,
    private statusBar: StatusBar,
    private screenOrientationService: ScreenOrientationService
  ) {
    if (window && window.cecPreferences) {
      this.contentUrl = window.cecPreferences['com.careered.content'];
      this.apiUrl = window.cecPreferences['com.careered.api'];
      this.messengerApiUrl = window.cecPreferences['com.careered.messengerapi'];
      this.messengerUrl = window.cecPreferences['com.careered.messengerurl'];
      this.themeId = Number(window.cecPreferences['com.careered.theme_id']);
      this.brandName = this.themeId === ThemeId.AIU ? 'AIU' : 'CTU';
      this.environment = window.cecPreferences['com.careered.environment'];
      this.customUrlScheme = window.cecPreferences['com.careered.customurlscheme'];
      this.assetsUrl = window.cecPreferences['com.careered.content'] + 'assets/' + this.brandName.toLowerCase();
    }

    this.isIos = platform.is('ios');
    this.isAndroid = platform.is('android');
    this.isWeb = !this.isIos && !this.isAndroid;
    this.isCordova = platform.is('cordova');
    this.isProduction = !(this.environment === 'dev' || this.environment === 'int' || this.environment === 'reg');
    this.isDevelopment = this.environment === 'dev';
    this.isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    this._ssidKey = 'com.careered.ssid';
    this._campusidKey = 'com.careered.sycampusid';

    this.appStatus = this._appStatusSubject.pipe(share());

    this.platform.ready().then(() => {
      this.zone.run(() => {
        this.onDeviceReadyWork();
      });
    });

    this.onAndroidBackPress = this.platform.backButton.asObservable().pipe(map(() => true));
  }

  public displayDebugError(error) {
    if (!this.isProduction && this.isCordova) {
      alert(JSON.stringify(error));
    } else if (!this.isProduction) {
      console.log(JSON.stringify(error));
    }
  }

  public clearCache() {
    if (window.CacheClear) {
      window.CacheClear();
    }
  }

  public openUrlOutOfApp(url: string) {
    if (this.isCordova) {
      this.iab.create(url, '_system', 'location=no,hidden=yes').show();
    } else {
      window.open(url, '_system');
    }
  }

  public compareVersion(version: string) {
    if (!this.version && !version) {
      return 0;
    }

    if (this.version && !version) {
      return -1;
    }

    if (!this.version && version) {
      return 1;
    }

    const versionA = version.toLowerCase();
    const versionB = this.version.toLowerCase();

    if (versionA === versionB) {
      return 0;
    }

    const splitA = versionA.split('.');
    const splitB = versionB.split('.');

    for (let i = 0; i < splitB.length; i++) {
      if (splitA.length <= i) {
        return -1;
      }

      if (splitA[i] < splitB[i]) {
        return -1;
      } else if (splitA[i] > splitB[i]) {
        return 1;
      }
    }

    return 0;
  }

  public initDevice() {
    return new Observable<boolean>((observer) => {
      this.storage.getItem<string>('_appSpecificId').subscribe((appSpecificId: string) => {
        if (appSpecificId) {
          this._appSpecificId = appSpecificId;
        } else {
          const id = this.hashService.getHash();

          this.storage.setItem<string>('_appSpecificId', id, true);
        }
      });

      this.storage.getItem<number>(this._ssidKey).subscribe((ssid: number) => {
        this._ssid = ssid;
      });

      this.storage.getItem<number>(this._campusidKey).subscribe((sycampusid: number) => {
        this._sycampusid = sycampusid;
      });

      this.storage.getItem<string>('UnsupportedStudentPhoneNumber').subscribe((uSPN: string) => {
        this._unsupportedPhone = uSPN;
      });

      const interval = setInterval(() => {
        if (this._initialized) {
          observer.next(true);
          observer.complete();
          clearInterval(interval);
        }
      }, 50);
    });
  }

  public getTechSupportNumber(unsupported: boolean) {
    // Tech Support number - need to update for campus id, only correct for online
    if (unsupported) {
      return this.unsupportedPhone;
    } else {
      if (this.sycampusid === CampusId.AIU_ONLINE || this.sycampusid === CampusId.CTU_ONLINE) {
        //if online campus
        return this.themeId === ThemeId.AIU ? this.aiuOnlineTechSupportPhone : this.ctuTechSupportPhone;
      } else {
        //if ground campus
        return this.themeId === ThemeId.AIU ? this.aiuGroundTechSupportPhone : this.ctuTechSupportPhone;
      }
    }
  }

  private onDeviceReadyWork() {
    if (this.isCordova) {
      this._deviceSpecificId = this.device.uuid;
      this._deviceVersion = this.device.version;
      this._deviceManufacturer = this.device.manufacturer;
      this._deviceModel = this.device.model;
      this._devicePlatform = this.device.platform;

      const promises = forkJoin([
        this.appVersion.getAppName(),
        this.appVersion.getPackageName(),
        this.appVersion.getVersionNumber(),
      ]);

      promises.subscribe(([appName, packageName, versionNumber]) => {
        this._appName = appName;
        this._packageName = packageName;
        this._version = `${versionNumber} - ${this.cacheSuffix}`;
        this._initialized = true;
      });

      this.statusBar.backgroundColorByName('black');
      this.statusBar.styleLightContent();
      this.statusBar.overlaysWebView(false);

      if (!this.statusBar.isVisible) {
        this.statusBar.show();
      }

      if (!(this.platform.is('ipad') || this.platform.is('tablet'))) {
        this.screenOrientationService.lockScreenOrientation(ScreenOrientation.Portrait);
      }
    } else if (!this._subscriptions._deviceSpecificId) {
      this._subscriptions._deviceSpecificId = this.storage
        .getItem<string>('_deviceSpecificId')
        .subscribe((deviceSpecificId: string) => {
          if (deviceSpecificId) {
            this._deviceSpecificId = deviceSpecificId;
          } else {
            this._deviceSpecificId = this.hashService.getHash();
            this.storage.setItem<string>('_deviceSpecificId', this._deviceSpecificId, true);
          }

          this._initialized = true;
        });

      this._version = `WEB - ${this.cacheSuffix}`;
    }

    if (!this._subscriptions.resume) {
      this._subscriptions.resume = this.platform.resume.subscribe(() => this._appStatusSubject.next('resume'));
    }

    if (!this._subscriptions.pause) {
      this._subscriptions.pause = this.platform.pause.subscribe(() => this._appStatusSubject.next('pause'));
    }
  }
}

export type EnvironmentType = 'dev' | 'int' | 'reg' | 'prod';
