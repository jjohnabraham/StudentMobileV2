import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { GlobalConfigsService } from './global-configs.service';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { HashProviderService } from './hash-provider.service';

@Injectable({
  providedIn: 'root',
})
export class BiometricsService {
  private readonly fingerprintRegisteredKey = 'fingerprintRegistered';

  constructor(
    private fingerPrintService: FingerprintAIO,
    private storage: StorageService,
    private globalConfigs: GlobalConfigsService,
    private hashService: HashProviderService
  ) {}

  public getAuthTypeNameFromType(type: string) {
    if (this.globalConfigs.isAndroid) {
      return 'Fingerprint';
    }

    if (this.globalConfigs.isIos) {
      if (type === 'face') {
        return 'Face ID';
      } else {
        return 'Touch ID';
      }
    }

    return null;
  }

  // when biometrics are present but not available on iOS plugin won't tell whether it's Touch ID or Face ID device
  // we have to detect Face ID manually
  public getAuthTypeFromDeviceModel(): 'fingerprint' | 'face' {
    if (this.globalConfigs.isAndroid) {
      return 'fingerprint';
    }

    const devicesWithTouch = [
      'iPhone12,8',
      'iPhone10,5',
      'iPhone10,2',
      'iPhone10,4',
      'iPhone10,1',
      'iPhone9,',
      'iPhone8,',
      'iPhone7,',
      'iPhone6,',
      'iPhone5,',
      'iPhone4,',
      'iPhone3,',
      'iPhone2,',
      'iPhone1,',
      'iPad11,1',
      'iPad11,2',
      'iPad14,1',
      'iPad11,2',
      'iPad7,',
      'iPad6,',
      'iPad5,',
      'iPad4,',
      'iPad3,',
      'iPad2,',
      'iPad1,',
    ];

    const model = this.globalConfigs.deviceModel;
    let type: 'fingerprint' | 'face' = 'face';

    devicesWithTouch.forEach((m) => {
      if (model.toLowerCase().indexOf(m.toLowerCase()) !== -1) {
        type = 'fingerprint';
      }
    });

    return type;
  }

  public fingerprintSupport() {
    return new Promise<FingerprintResult>((resolve, reject) => {
      try {
        if (!this.globalConfigs.isCordova) {
          reject('Cordova not available');
          return;
        }

        this.isFingerprintAvailable().then(
          (type) => {
            if (this.globalConfigs.isIos) {
              resolve({ os: 'ios', type: type === 'face' ? 'face' : 'fingerprint' });
            } else if (this.globalConfigs.isAndroid) {
              resolve({ os: 'android', type: 'fingerprint' });
            }
          },
          (error) => reject(error)
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  public storeFingerprint(dialogTitle?: string, dialogMessage?: string, dialogHint?: string) {
    return new Promise<string>((resolve, reject) => {
      try {
        const hash = this.hashService.getHash();

        this.fingerprintSupport().then(
          () => {
            if (this.globalConfigs.isIos) {
              // iOS requires to explicitly show biometrics dialog before registering secret
              this.fingerPrintService
                .show({
                  description: dialogMessage || 'Scan your fingerprint please',
                  disableBackup: true,
                  title: dialogTitle,
                  subtitle: dialogHint,
                })
                .then(
                  () => {
                    // on iOS registerBiometricSecret won't show biometrics prompt
                    this.fingerPrintService
                      .registerBiometricSecret({
                        description: dialogMessage || 'Scan your fingerprint please',
                        disableBackup: true,
                        title: dialogTitle,
                        subtitle: dialogHint,
                        secret: hash,
                        invalidateOnEnrollment: true,
                      })
                      .then(() => {
                        resolve(hash);
                      })
                      .catch((error) => reject(error));
                  },
                  (error) => reject(error)
                );
            } else {
              this.fingerPrintService
                .registerBiometricSecret({
                  description: dialogMessage || 'Scan your fingerprint please',
                  disableBackup: true,
                  title: dialogTitle,
                  subtitle: dialogHint,
                  secret: hash,
                  invalidateOnEnrollment: true,
                })
                .then(() => {
                  resolve(hash);
                })
                .catch((error) => reject(error));
            }
          },
          (error) => reject(error)
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  public getFingerprintRegistered() {
    return this.storage.getItem<number>(this.fingerprintRegisteredKey);
  }

  public setFingerprintRegistered() {
    return this.storage.setItem(this.fingerprintRegisteredKey, 1, true);
  }

  public clearFingerprintRegistered() {
    return new Promise<boolean>((resolve, reject) => {
      try {
        this.fingerprintSupport().then(
          (data) => {
            if (!data || !data.os) {
              reject();
              return;
            }

            this.storage.removeItem(this.fingerprintRegisteredKey).then(
              (result) => resolve(result),
              (err) => reject(err)
            );
          },
          (err) => reject(err)
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  public validateFingerprint(dialogTitle?: string, dialogMessage?: string, dialogHint?: string) {
    return new Promise<string>((resolve, reject) => {
      this.fingerPrintService
        .loadBiometricSecret({
          description: dialogMessage || 'Scan your fingerprint please',
          disableBackup: true,
          title: dialogTitle,
          subtitle: dialogHint,
        })
        .then((hash: string) => resolve(hash))
        .catch((error) => reject(error));
    });
  }

  private isFingerprintAvailable() {
    return new Promise<string>((resolve, reject) => {
      try {
        this.fingerPrintService.isAvailable().then(
          (type) => {
            if (type && type === 'face') {
              resolve('face');
            } else {
              resolve('fingerprint');
            }
          },
          (msg) => reject(msg)
        );
      } catch (err) {
        reject(err);
      }
    });
  }
}

export interface FingerprintResult {
  os: string;
  type: string;
}
