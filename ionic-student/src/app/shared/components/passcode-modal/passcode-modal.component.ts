import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { PecLoaderService } from '../../services/pec-loader.service';
import { StorageService } from '../../services/storage.service';
import { GlobalConfigsService } from '../../services/global-configs.service';
import { BaseComponent } from '../base-component/base.component';
import { ThemeId } from '../../enums/theme-id.enum';
import { first } from 'rxjs/operators';
import { TrackingService } from '../../services/tracking.service';
import { PecPasscodeOptions } from '../passcode/passcode.component';
import { Observable } from 'rxjs';
import { RegisterSecAuthObject, SecondaryAuthStorageObject } from '../../../data/types/auth.type';

@Component({
  selector: 'pec-passcode-modal',
  templateUrl: './passcode-modal.component.html',
  styleUrls: ['./passcode-modal.component.scss'],
})
export class PasscodeModalComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() secondaryAuthStorageObject: SecondaryAuthStorageObject;
  @Input() completeCallback: (input: RegisterSecAuthObject) => Observable<boolean>;
  public passcodeOptions: PecPasscodeOptions;

  private passcode = '';
  private changePasscode = false;
  private isPasscodeTgl = false;
  private toast: HTMLIonToastElement;

  constructor(
    private router: Router,
    private loadingCtrl: PecLoaderService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private storage: StorageService,
    private globalConfigs: GlobalConfigsService,
    private trackingService: TrackingService
  ) {
    super();
  }

  public gotoLogin() {
    this.router.navigate(['/login']);
  }

  public ngOnDestroy() {
    this.loadingCtrl.dismiss();
  }

  public ngOnInit() {
    this.passcodeOptions = {
      title: `For convenience, you can create a <br/ > passcode to sign into ${
        this.globalConfigs.themeId === ThemeId.AIU ? 'AIU' : 'CTU'
      } Student Mobile.<br/ > <br/ > Set a new passcode.`,
      onComplete: (passcode: string) => {
        return new Promise<void>((resolve, reject) => {
          if (this.passcode) {
            if (this.passcode !== passcode) {
              this.passcodeOptions.passcodeError = '* The passcodes did not match, please re-enter.';
              reject();
            } else {
              if (!this.globalConfigs.deviceSpecificId) {
                this.showToast('Device specific identifier cannot be found.');

                reject();
              }

              const r = new RegisterSecAuthObject();
              r.DeviceSpecificId = this.globalConfigs.deviceSpecificId;
              r.AppSpecificId = this.globalConfigs.appSpecificId;
              r.AuthToken = passcode;
              r.AuthType = 2;

              this.showLoadingModal();

              this.completeCallback(r)
                .pipe(first())
                .subscribe(
                  (success) => {
                    this.loadingCtrl.dismiss();

                    if (success) {
                      if (this.isPasscodeTgl) {
                        this.trackingService.trackEvent({
                          view: 'Settings View',
                          category: 'Settings View',
                          action: 'Toggled Passcode',
                          label: 'On',
                          value: '',
                        });
                      }

                      this.showToast('Passcode has been saved.');

                      resolve();

                      this.closeModal();
                    } else {
                      this.showToast('Passcode save was not successful. Please try again');

                      reject();
                    }
                  },
                  () => {
                    this.loadingCtrl.dismiss();

                    this.showToast('Passcode save was not successful. Please try again');

                    reject();
                  }
                );
            }
          } else {
            this.passcode = passcode;

            if (this.changePasscode) {
              this.passcodeOptions.title = `Please re-enter your passcode.`;
            } else {
              this.passcodeOptions.title = `For convenience, you can create a <br/ > passcode to sign into ${
                this.globalConfigs.themeId === ThemeId.AIU ? 'AIU' : 'CTU'
              } Student Mobile.<br/ ><br/ > Please re-enter your passcode.`;
            }
            resolve();
          }
        });
      },
    };

    if (this.secondaryAuthStorageObject && this.secondaryAuthStorageObject.AuthType === 2) {
      this.changePasscode = true;
      this.passcodeOptions.title = `Set a new passcode.`;
    }
  }

  public closeModal() {
    this.storage.setItem('isSecAuthSetupScreenDisplayed', true, true);
    this.modalCtrl.dismiss();
  }

  private showToast(message: string) {
    this.toastCtrl
      .create({
        message,
        duration: 3000,
        position: 'bottom',
        cssClass: 'pec-toast-message',
      })
      .then((toast) => {
        this.toast = toast;
        toast.present();
      });
  }

  private showLoadingModal() {
    this.loadingCtrl.show('Please wait...');
  }
}
