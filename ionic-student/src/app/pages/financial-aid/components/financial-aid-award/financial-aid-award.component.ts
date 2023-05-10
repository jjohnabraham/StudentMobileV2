import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FinancialAidService } from 'src/app/data/services/financial-aid.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { TrackingService } from 'src/app/shared/services/tracking.service';

@Component({
  selector: 'pec-financial-aid-award',
  templateUrl: './financial-aid-award.component.html',
  styleUrls: ['./financial-aid-award.component.scss'],
})
export class FinancialAidAwardComponent extends BaseComponent implements OnInit {
  @Input() awardLetters: any[]; //optional
  @Input() refresh: boolean;
  @Output() loadingFinished: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() errorOnLoad: EventEmitter<string> = new EventEmitter<string>();
  @Output() viewAllAwardClicked = new EventEmitter();
  public showLoading: boolean;
  constructor(private financialAidService: FinancialAidService) {
    super();
  }

  public ngOnInit() {
    this.beginLoad(this.refresh);
  }

  get awardsLength() {
    return Math.min(this.awardLetters.length, 1);
  }

  private beginLoad(refresh: boolean) {
    this.subscriptions.faawards = this.financialAidService.financialAidStatus(3).subscribe(
      (data: any) => {
        if (!data.FinancialAidStatuses) {
          return;
        }

        data.FinancialAidStatuses.forEach((a) => {
          a.detailhash = `/financialaid/awardletter?fastudentayid=${a.FaStudentAyId}`;
        });
        this.awardLetters = data.FinancialAidStatuses.sort(
          (a, b) => new Date(b.AcademicYearStartDate).getTime() - new Date(a.AcademicYearStartDate).getTime()
        );
      },
      (error) => {
        setTimeout(() => {
          if (this.subscriptions.faawards) {
            this.subscriptions.faawards.unsubscribe();
            delete this.subscriptions.faawards;
          }
        }, 0);
      }
    );
  }
}
