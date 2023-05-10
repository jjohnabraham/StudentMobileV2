import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
import { BaseComponent } from '../base-component/base.component';

@Component({
  selector: 'pec-info-popover',
  templateUrl: './info-popover.component.html',
})
export class InfoPopoverComponent extends BaseComponent {
  public title: string;
  public message: string;
  public buttons = [
    {
      label: 'OK',
      action: () => {
        this.popoverController.dismiss();
      },
    },
  ];

  constructor(private popoverController: PopoverController, public navParams: NavParams) {
    super();
    this.title = this.navParams.data.Title;
    this.message = this.navParams.data.Message;
    if (this.navParams.data.buttons) {
      this.buttons = this.navParams.data.Buttons;
    }
  }

  onPopoverCloseClick() {
    if (this.buttons && this.buttons.length === 1) {
      this.buttons[0].action();
    } else {
      this.popoverController.dismiss();
    }
  }
}
