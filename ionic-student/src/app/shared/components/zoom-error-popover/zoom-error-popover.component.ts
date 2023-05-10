import { Component, Input, OnInit } from '@angular/core';
import { SchoolService } from '../../../data/services/school.service';
import { GlobalConfigsService } from '../../services/global-configs.service';
import { PopoverController } from '@ionic/angular';
import { ThemeId } from '../../enums/theme-id.enum';

@Component({
  selector: 'pec-zoom-error-popover',
  templateUrl: './zoom-error-popover.component.html',
  styleUrls: ['./zoom-error-popover.component.scss'],
})
export class ZoomErrorPopoverComponent implements OnInit {
  @Input() title: string;
  @Input() message: string;
  @Input() errorCode: string;

  public techSupportContactPhone: string;
  public redirectUrl: string;
  public htmlMessage: string;

  constructor(
    private schoolService: SchoolService,
    private globalConfigs: GlobalConfigsService,
    public popoverCtrl: PopoverController
  ) {}

  public ngOnInit() {
    this.techSupportContactPhone = this.globalConfigs.getTechSupportNumber(false);

    this.redirectUrl = 'ConexusRedirect/LaunchFromNavigation?NavigationTitle=Tech%20Support';

    this.htmlMessage = ``;
  }

  public onPopoverCloseClick() {
    this.popoverCtrl.dismiss();
  }
}
