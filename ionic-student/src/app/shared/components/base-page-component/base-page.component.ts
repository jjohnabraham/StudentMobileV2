import { Component } from '@angular/core';
import { ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { BaseComponent } from '../base-component/base.component';

@Component({
  selector: 'pec-base-page',
  templateUrl: './base-page.component.html',
})
export class BasePageComponent extends BaseComponent implements ViewDidLeave, ViewDidEnter {
  public ionViewDidLeave() {
    this.clearSubscriptions();
  }

  public ionViewDidEnter() {
    this.beginLoadData();
  }

  protected beginLoadData() {}
}
