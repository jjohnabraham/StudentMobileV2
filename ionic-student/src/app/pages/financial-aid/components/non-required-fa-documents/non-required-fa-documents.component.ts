import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RequiredAction } from '../../../../data/types/financial-aid.type';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { TrackingService } from '../../../../shared/services/tracking.service';
import { FinancialAidService } from '../../../../data/services/financial-aid.service';
import { BaseComponent } from '../../../../shared/components/base-component/base.component';
import { first } from 'rxjs/operators';

@Component({
  selector: 'pec-non-required-fa-documents',
  templateUrl: './non-required-fa-documents.component.html',
  styleUrls: ['./non-required-fa-documents.component.scss'],
})
export class NonRequiredFaDocumentsComponent extends BaseComponent implements OnInit {
  @Input() nonRequiredActions: RequiredAction[] = [];

  constructor(public globalConfigs: GlobalConfigsService) {
    super();
  }

  public ngOnInit() {}
}
