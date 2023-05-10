import { Component, Input } from '@angular/core';
import { BaseComponent } from '../../../../shared/components/base-component/base.component';
import { PopoverController } from '@ionic/angular';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';

@Component({
  selector: 'pec-page-leave-popover',
  templateUrl: './page-leave-popover.component.html',
  styleUrls: ['./page-leave-popover.component.scss'],
})
export class PageLeavePopoverComponent extends BaseComponent {
  @Input() buttons: [];
  private closePromptPromise: Promise<boolean>;

  constructor(public globalConfigs: GlobalConfigsService, private popoverController: PopoverController) {
    super();
  }

  public onPopoverCloseClick() {
    this.popoverController.dismiss();
    this.globalConfigs.requireNavigationConfirmation = false;
  }
}
