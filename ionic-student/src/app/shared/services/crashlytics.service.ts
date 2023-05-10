import { Injectable } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/data/services/auth.service';
import { User } from 'src/app/data/types/user.type';
import { GlobalConfigsService } from './global-configs.service';

@Injectable({
  providedIn: 'root',
})
export class CrashlyticsService {
  private isCordova = false;
  constructor(
    private authService: AuthService,
    private globalConfigs: GlobalConfigsService,
    private firebase: FirebaseX
  ) {
    this.isCordova = this.globalConfigs.isCordova;
  }
  public init(): void {
    //https://github.com/dpa99c/cordova-plugin-firebasex#setcrashlyticscustomkey
    try {
      this.setCustomKey('UID', this.globalConfigs.deviceSpecificId);
      this.setCustomKey('Device Manufacturer', this.globalConfigs.deviceManufacturer);
      this.setCustomKey('Device Model', this.globalConfigs.deviceModel);
      this.setCustomKey('Device Version Number', this.globalConfigs.deviceVersion);
      this.setCustomKey('Platform', this.globalConfigs.devicePlatform);
    } catch (err) {
      this.setCustomKey('Could Not Capture Device Information Because of This Error:', JSON.stringify(err));
    }
  }
  public onLogin(): void {
    try {
      this.authService
        .getUserInfo()
        .pipe(take(1))
        .subscribe((user) => {
          const userItem = user as User;
          if (userItem) {
            this.setCustomKey('Student ID', userItem.StudentNumber);
            this.setCustomKey('SyCampusid', userItem.SyCampusId.toString());
          }
        });
    } catch (err) {
      this.setCustomKey('Could Not Capture User Information Because of This Error:', JSON.stringify(err));
    }
  }

  public crash() {
    if (this.isCordova) {
      this.firebase.sendCrash();
    }
  }

  public logError(errorMessage: string, currUrl: string, prevUrl?: string) { //Non-fatal events
    try {
      if (this.isCordova) {
        this.setCustomKey('Current Path: ', currUrl);
        if (prevUrl) {
          this.setCustomKey('Previous Path: ', prevUrl);
        }
        this.firebase.logError(errorMessage);
      }
    } catch (err) {}
  }

  public logEvent(type: string, data: any, currUrl: string, prevUrl?: string) {
    try {
      if (this.isCordova) {
        this.setCustomKey('Current Path: ', currUrl);
        if (prevUrl) {
          this.setCustomKey('Previous Path: ', prevUrl);
        }
        this.firebase.logEvent(type, data);
      }
    } catch (err) { }
  }

  public log(message: string, currUrl: string, prevUrl?: string) {
    try {
      if (this.isCordova) {
        this.setCustomKey('Current Path: ', currUrl);
        if (prevUrl) {
          this.setCustomKey('Previous Path: ', prevUrl);
        }
        this.firebase.logMessage(message);
      }
    } catch (err) { }
  }

  private setCustomKey(key: string, value: string): void {
    try {
      if (this.isCordova) {
        (<any>window).FirebasePlugin?.setCrashlyticsCustomKey(key, value);
      } else {
        if (!this.globalConfigs.isProduction) {
          console.log('Cannot Set Custom Key: ' + key + ', Value: ' + value, 'Crashlytics Service');
        } else {
          this.logError('Cannot Set Custom Key: ' + key + ', Value: ' + value, 'Crashlytics Service')
        }
      }
    } catch (err) { }
  }
}
