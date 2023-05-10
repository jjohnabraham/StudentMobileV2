import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BaseComponent } from '../../../../shared/components/base-component/base.component';

@Component({
  selector: 'pec-financial-aid-sorting-modal',
  templateUrl: './financial-aid-sorting-modal.component.html',
  styleUrls: ['./financial-aid-sorting-modal.component.scss'],
})
export class FinancialAidSortingModalComponent extends BaseComponent implements OnDestroy {
  @Input() sortOrder: string;
  @Input() backDropDismissed: (order) => void;

  constructor(private viewCtrl: ModalController) {
    super();
  }

  public dismissed() {
    this.backDropDismissed(this.sortOrder);

    this.viewCtrl.dismiss({
      sortOrder: this.sortOrder,
    });
  }

  public ionViewWillLeave() {
    this.dismissed();
  }

  public ngOnDestroy() {
    this.dismissed();
  }
}
