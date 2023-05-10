import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewDidEnter, NavParams } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { BasePageComponent } from 'src/app/shared/components/base-page-component/base-page.component';
import { TrackingService } from 'src/app/shared/services/tracking.service';
import { TransferPendingClass } from 'src/app/data/types/enrollment.type';
import { Subscription } from 'rxjs';
import { StorageService } from '../../../../shared/services/storage.service';
import { ContactService } from '../../../../data/services/contact.service';
import { ContactInfo } from 'src/app/data/types/contact.type';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';

@Component({
  selector: 'pec-transfer-credit-page',
  templateUrl: './unofficial-transfer-credit.page.html',
  styleUrls: ['./unofficial-transfer-credit.page.scss'],
})
export class UnofficialTransferCreditPage extends BasePageComponent {
  public showError = false;
  public showLoading = true;
  public registrarContact: ContactInfo;

  private transferCourses: TransferPendingClass;
  private storageSub: Subscription;

  constructor(
    private trackingService: TrackingService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private storage: StorageService,
    private contactService: ContactService,
    private globalConfigsService: GlobalConfigsService
  ) {
    super();
  }

  public ionViewWillEnter() {
    if (this.storage.getItem<TransferPendingClass>('transferCourses')) {
      this.storageSub = this.storage
        .getItem<TransferPendingClass>('transferCourses')
        .subscribe((_transferCourses: TransferPendingClass) => {
          this.transferCourses = _transferCourses;
          this.showLoading = false;
        });
    }

    if (!this.subscriptions.allcontacts) {
      this.contactService
        .allContacts(0, true)
        .pipe(first())
        .subscribe(
          (list) => {
            if (list) {
              this.registrarContact = list.find(
                (contact) => contact.ContactGroup === "Registrar's Office" || contact.ContactGroup === 'Registrar'
              );
            }
          },
          (error) => {}
        );
    }
  }

  public ionViewWillLeave() {
    this.storageSub.unsubscribe();
  }
}
