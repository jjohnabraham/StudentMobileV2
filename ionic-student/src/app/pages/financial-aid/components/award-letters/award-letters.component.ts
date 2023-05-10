import { Component, OnInit } from '@angular/core';
import { BasePageComponent } from '../../../../shared/components/base-page-component/base-page.component';
import { FinancialAidService } from '../../../../data/services/financial-aid.service';
import { ViewDidEnter } from '@ionic/angular';
import { AwardLetter } from '../../../../data/types/financial-aid.type';
import { first } from 'rxjs/operators';

@Component({
  selector: 'pec-award-letters',
  templateUrl: './award-letters.component.html',
  styleUrls: ['./award-letters.component.scss'],
})
export class AwardLettersComponent extends BasePageComponent implements OnInit {
  public showLoading: boolean;
  public awardLetters: AwardLetter[];

  constructor(private financialAidService: FinancialAidService) {
    super();
  }

  public ngOnInit() {
    this.showLoading = true;

    this.financialAidService
      .myDocuments(0)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data && data.length > 0) {
            this.awardLetters = data
              .filter((a) => a.CmDocTypeDescrip === 'Financial Aid Award Letter')
              .sort((a, b) => new Date(b.DateReceived).getTime() - new Date(a.DateReceived).getTime());
          } else {
            this.awardLetters = [];
          }

          this.showLoading = false;
        },
        () => {
          this.showLoading = false;
        }
      );
  }
}
