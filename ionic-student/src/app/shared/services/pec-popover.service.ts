import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { PopoverOptions } from '@ionic/core';

@Injectable({
  providedIn: 'root',
})
export class PecPopOverService {
  private alert: HTMLIonPopoverElement;

  constructor(private popoverCtrl: PopoverController) {}

  async show(opts: PopoverOptions<any>) {
    this.alert = await this.popoverCtrl.create(opts);

    await this.alert.present();

    return this.alert;
  }

  async dismiss(data = null) {
    if (this.alert) {
      await this.alert.dismiss(data);
    }
  }
}
