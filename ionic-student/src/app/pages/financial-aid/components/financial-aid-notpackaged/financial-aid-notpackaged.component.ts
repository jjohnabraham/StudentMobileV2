import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'pec-financial-aid-notpackaged',
  templateUrl: './financial-aid-notpackaged.component.html',
  styleUrls: ['./financial-aid-notpackaged.component.scss'],
})
export class FinancialAidNotpackagedComponent {
  @Input() isPackaged: boolean;
  @Input() notYetPackagedActions: any;
  constructor() {}
}
