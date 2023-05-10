import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ClassHoldProps } from '../../services/exam.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

@Component({
  selector: 'pec-class-hold',
  templateUrl: './class-hold.component.html',
  styleUrls: ['./class-hold.component.scss'],
})
export class ClassHoldComponent extends BaseComponent implements OnInit {
  @Input() holds: ClassHoldProps;

  constructor(public popoverCtrl: PopoverController) {
    super();
  }

  public ngOnInit() {
    if (!this.holds) {
      this.onPopoverCloseClick();
    }
  }

  public onButtonClick(buttonLabel: string) {
    this.onPopoverCloseClick();
  }

  public onPopoverCloseClick() {
    this.popoverCtrl.dismiss();
  }
}
