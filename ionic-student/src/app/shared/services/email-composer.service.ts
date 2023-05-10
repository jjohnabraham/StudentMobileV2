import { Injectable } from '@angular/core';
import { GlobalConfigsService } from './global-configs.service';
import { User } from '../../data/types/user.type';

@Injectable({
  providedIn: 'root',
})
export class EmailComposerService {
  constructor(private globalConfigs: GlobalConfigsService) {}

  public composeErrorReport(userInfo: User, errCode: string, errData: string) {
    const d = new Date().toTimeString();
    const emailTo = 'MobileAppConnectionError@careered.com';
    const emailSubject = 'Error: Request Failed';
    let emailBody = 'Error Message Data%0A' + 'DateTime: ' + d + '%0A%0A';

    if (this.globalConfigs.isCordova) {
      emailBody +=
        'Device Info:%0A' +
        'UUID: ' +
        encodeURIComponent(this.globalConfigs.deviceSpecificId) +
        '%0A' +
        'Device Manufacturer: ' +
        encodeURIComponent(this.globalConfigs.deviceManufacturer) +
        '%0A' +
        'Device Model: ' +
        encodeURIComponent(this.globalConfigs.deviceModel) +
        '%0A' +
        'Platform: ' +
        encodeURIComponent(this.globalConfigs.devicePlatform) +
        '%0A' +
        'Device Version Number: ' +
        encodeURIComponent(this.globalConfigs.deviceVersion) +
        '%0A%0A';
    }

    emailBody += 'App Version: ' + this.globalConfigs.version + '%0A%0A';

    if (userInfo) {
      emailBody +=
        'User Info:%0A' +
        'Name: ' +
        userInfo.FirstName +
        ' ' +
        userInfo.LastName +
        '%0A' +
        'ID: ' +
        userInfo.StudentNumber +
        '%0A%0A';
    }

    if (errCode) {
      emailBody += 'Error Details: %0A' + 'Error Code: ' + errCode + '%0A';
    }

    if (errData) {
      emailBody += 'Error Data: ' + errData + '%0A';
    }

    this.globalConfigs.openUrlOutOfApp('mailto:' + emailTo + '?subject=' + emailSubject + '&body=' + emailBody);
  }
}
