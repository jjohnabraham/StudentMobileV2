import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BaseComponent } from '../../../../shared/components/base-component/base.component';

@Component({
  selector: 'pec-bookshelf-modal',
  templateUrl: './bookshelf-modal.component.html',
  styleUrls: ['./bookshelf-modal.component.scss'],
})
export class BookshelfModalComponent extends BaseComponent implements OnDestroy {
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
