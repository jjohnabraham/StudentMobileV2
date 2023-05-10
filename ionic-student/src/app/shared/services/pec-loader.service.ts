import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class PecLoaderService {
  private loader: HTMLIonLoadingElement;

  constructor(private loadingCtrl: LoadingController) { }

  modalInst = [];
  i = 0;

  async show(message: string) {
    if (!this.loader) {
      this.loader = await this.loadingCtrl.create({ message });
      this.modalInst[this.i] = this.loader;
      this.i++;
      //console.log('show modal, add to array: ', this.modalInst, ', i: ', this.i);
      await this.loader.present();
    }

    return this.loader;
  }

  async dismiss() {
    if (this.loader) {
      for (var i = 0; i < this.modalInst.length; i++) {
        //await this.loader.dismiss();
        await this.modalInst[i].dismiss();
        //console.log('hide modal: ', this.modalInst, ', i: ', this.i);
        this.loader = null;
      }
    }
  }
}
