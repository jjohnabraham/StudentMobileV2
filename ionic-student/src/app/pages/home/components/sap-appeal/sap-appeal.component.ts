import { Component, OnDestroy, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { PopoverController } from '@ionic/angular';
import { PecDatePipe } from 'src/app/shared/pipes/date.pipe';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';

@Component({
  selector: 'pec-sap-appeal',
  templateUrl: './sap-appeal.component.html',
  styleUrls: ['./sap-appeal.component.scss'],
  providers: [PecDatePipe],
})
export class SapAppealComponent extends BaseComponent implements OnInit, OnDestroy {
  public sapAppeal: any;
  public ready = false;
  subscriptions: any = {};
  dueDate: any;

  constructor(
    private popoverController: PopoverController,
    private datePipe: PecDatePipe,
    private globalConfigs: GlobalConfigsService,
    private browserTab: BrowserTab
  ) {
    super();
  }

  ngOnInit() {
    if (this.sapAppeal) {
      if (this.sapAppeal.DueDate) {
        this.dueDate = this.datePipe.transform(this.sapAppeal.DueDate, 'MMMM d, yyyy');
        this.datePipe
          .transform(this.sapAppeal.DueDate, 'MMMM d, yyyy')
          .pipe(first())
          .subscribe((date) => {
            this.dueDate = date;
            this.sapAppeal.Message = this.sapAppeal.Message.toString().replace('{dueDate}', this.dueDate);
            this.ready = true;
          });
      } else {
        this.ready = true;
      }
    }
    if (!this.sapAppeal) {
      this.onPopoverCloseClick();
    }
  }

  onButtonClick(buttonLabel: string) {
    this.onPopoverCloseClick();
    if (this.globalConfigs.isCordova) {
      this.browserTab.openUrl(this.sapAppeal.AdditionalInformationLink);
      return;
    } else {
      this.globalConfigs.openUrlOutOfApp(this.sapAppeal.AdditionalInformationLink);
    }
  }

  onPopoverCloseClick() {
    this.popoverController.dismiss();
  }
}
