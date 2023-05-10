import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContactService } from 'src/app/data/services/contact.service';
import { ContactInfo } from 'src/app/data/types/contact.type';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { TrackingService } from 'src/app/shared/services/tracking.service';

@Component({
  selector: 'pec-financial-aid-advisor',
  templateUrl: './financial-aid-advisor.component.html',
  styleUrls: ['./financial-aid-advisor.component.scss'],
})
export class FinancialAidAdvisorComponent extends BaseComponent implements OnInit {
  @Input() refresh: boolean;
  @Input() eventCategory: string;
  @Output() loadingFinished: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() errorOnLoad: EventEmitter<string> = new EventEmitter<string>();

  public showLoading: boolean;
  public isFinancialAidAdvisor: boolean;
  public allcontacts: ContactInfo[];

  constructor(private contactService: ContactService, private trackingService: TrackingService) {
    super();
  }

  ngOnInit() {
    this.beginLoad(this.refresh);
  }

  private beginLoad(refresh: boolean) {
    if (!this.subscriptions.allcontacts) {
      this.showLoading = true;

      this.subscriptions.allcontacts = this.contactService.allContacts(null, refresh).subscribe(
        (allcontacts) => {
          this.allcontacts = allcontacts;
          for (const item of this.allcontacts) {
            if (item.ContactGroup === 'Financial Aid Advisor') {
              this.isFinancialAidAdvisor = true;
            }
          }
          this.showLoading = false;
          this.loadingFinished.emit(true);
        },
        (error) => {
          this.errorOnLoad.emit('CONTCTINFO');
          this.trackingService.trackEvent({
            view: 'Financial Aid View',
            category: 'System Errors',
            action: 'ErrorCode : CONTCTINFO',
            label: 'Financial Page',
            value: '',
          });

          setTimeout(() => {
            if (this.subscriptions.allcontacts) {
              this.subscriptions.allcontacts.unsubscribe();
              delete this.subscriptions.allcontacts;
            }
          }, 0);
        }
      );
    }
  }
}
