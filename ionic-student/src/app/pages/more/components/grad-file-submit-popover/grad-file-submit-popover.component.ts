import { Component, Input } from '@angular/core';
import { BaseComponent } from '../../../../shared/components/base-component/base.component';
import { PopoverController } from '@ionic/angular';
import { PecPopOverService } from '../../../../shared/services/pec-popover.service';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';

@Component({
  selector: 'pec-grad-file-submit-popover',
  templateUrl: './grad-file-submit-popover.component.html',
  styleUrls: ['./grad-file-submit-popover.component.scss'],
})
export class GradFileSubmitPopoverComponent extends BaseComponent {
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
