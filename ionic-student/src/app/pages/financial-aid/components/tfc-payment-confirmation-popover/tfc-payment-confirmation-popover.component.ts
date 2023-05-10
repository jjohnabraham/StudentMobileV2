import { Component, Input } from '@angular/core';
import { BaseComponent } from '../../../../shared/components/base-component/base.component';
import { PopoverController } from '@ionic/angular';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';

@Component({
  selector: 'pec-tfc-payment-confirmation-popover',
  templateUrl: './tfc-payment-confirmation-popover.component.html',
  styleUrls: ['./tfc-payment-confirmation-popover.component.scss'],
})
export class TfcPaymentConfirmationPopoverComponent extends BaseComponent {
  @Input() buttons: [];

  public message: string;

  constructor(private popoverController: PopoverController, private globalConfigs: GlobalConfigsService) {
    super();

    this.message = `Your payment plan with ${globalConfigs.brandName} is being serviced by TFC on our behalf. You’re being redirected to the TFC website to access your account information and setup payment arrangements.<br/><br/><strong>Note:</strong> It may take up to 7 days after you’ve signed your payment agreement for your information to be available on TFC’s website.<br/><br/>Select ‘Continue’ to be redirected to TFC’s website.`;
  }

  public onPopoverCloseClick() {
    this.popoverController.dismiss();
  }
}
