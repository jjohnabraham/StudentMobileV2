import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AlertButton } from '@ionic/core';

@Injectable({
  providedIn: 'root',
})
export class PecAlertService {
  constructor(private alertCtrl: AlertController) {}

  async show(opts: PecAlertOptions) {
    const alert = await this.alertCtrl.create({
      cssClass: opts.cssClass,
      header: opts.header,
      subHeader: opts.subHeader,
      message: opts.message,
      backdropDismiss: opts.enableBackdropDismiss,
      buttons: opts.buttons.map((a) => {
        if (a.action) {
          return {
            text: a.text,
            handler: a.action,
          } as AlertButton;
        } else {
          return {
            text: a.text,
            role: 'cancel',
          } as AlertButton;
        }
      }),
    });

    await alert.present();

    alert.onDidDismiss().then((data) => {
      if (opts.onDismiss) {
        opts.onDismiss(data);
      }
    });

    return alert;
  }
}

export interface PecAlertOptions {
  header?: string;
  cssClass?: string;
  subHeader?: string;
  message?: string;
  buttons: Array<{ text: string; action?: () => void }>;
  onDismiss?: (data: any) => void;
  enableBackdropDismiss?: boolean;
}
