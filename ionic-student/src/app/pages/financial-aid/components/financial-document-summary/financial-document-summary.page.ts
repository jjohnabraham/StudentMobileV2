import { Component } from '@angular/core';
import { FinancialAidService } from 'src/app/data/services/financial-aid.service';
import { RequiredAction, TimeToComplete } from 'src/app/data/types/financial-aid.type';
import { BasePageComponent } from 'src/app/shared/components/base-page-component/base-page.component';
import { first } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { FinancialAidSortingModalComponent } from '../financial-aid-sorting-modal/financial-aid-sorting-modal.component';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'pec-financial-document-summary',
  templateUrl: './financial-document-summary.page.html',
  styleUrls: ['./financial-document-summary.page.scss'],
})
export class FinancialDocumentSummaryPage extends BasePageComponent {
  public showLoading = false;
  public errorCodeMessage: string;
  public filteredActions: RequiredAction[] = [];
  public documentsCount: number;
  public overviewDescription: string;
  public selectedDocStatus: 'outstanding' | 'submitted' = 'outstanding';
  public submittedDocsList: RequiredAction[] = [];
  public outstandingDocsList: RequiredAction[] = [];
  public sortOrder: 'due date' | 'time' | 'type' = 'due date';

  private sortingModal: HTMLIonModalElement;

  constructor(
    private financialAidService: FinancialAidService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute
  ) {
    super();

    this.route.queryParams.subscribe((params) => {
      if (params.viewType) {
        this.selectedDocStatus = params.viewType;
      }
    });
  }

  public doRefresh(event) {
    this.clearSubscriptions();
    this.beginLoadData(true);
    setTimeout(() => {
      if (event) event.target.complete();
    }, 500);
  }

  public setDocumentsTab() {
    this.applySortOrder();

    if (this.selectedDocStatus === 'outstanding') {
      this.filteredActions = this.outstandingDocsList;
      if (this.filteredActions && this.filteredActions.length > 0) {
        this.overviewDescription =
          'Below are the documents that are required for your current or future academic year.';
      } else {
        this.overviewDescription = 'You have no outstanding documents at this time.';
      }
    } else {
      this.filteredActions = this.submittedDocsList;

      if (this.filteredActions && this.filteredActions.length > 0) {
        this.overviewDescription =
          'Below are the documents that have been submitted for your current or future academic year.';
      } else {
        this.overviewDescription = 'You have no submitted documents at this time.';
      }
    }
  }

  public presentSortModal() {
    this.modalCtrl
      .create({
        component: FinancialAidSortingModalComponent,
        componentProps: {
          sortOrder: this.sortOrder,
          backDropDismissed: (order) => (this.sortOrder = order),
        },
        cssClass: 'bookshelf-modal',
        backdropDismiss: true,
        mode: 'md',
      })
      .then((modal) => {
        this.sortingModal = modal;

        this.sortingModal.onWillDismiss().then((data) => {
          if (data && data.data) {
            this.sortOrder = data.data.sortOrder;
            this.setDocumentsTab();
          }
        });

        this.sortingModal.present();
      });
  }

  protected beginLoadData(refresh?: boolean) {
    this.showLoading = true;

    this.financialAidService
      .financialAidAction(2, refresh)
      .pipe(first())
      .subscribe(
        (data) => {
          const requiredActions = data.RequiredActions;

          if (requiredActions) {
            this.outstandingDocsList = requiredActions
              ?.filter((d) => d.DocumentSubmissionDate == null)
              .sort(this.sortByDueDate);

            //sort by date and by alphabetic order
            this.submittedDocsList = requiredActions
              ?.filter((d) => d.DocumentSubmissionDate != null)
              .sort((a, b) => {
                const adate = moment(a.DocumentSubmissionDate).hour(0).minute(0).second(0).millisecond(0).toDate();
                const bdate = moment(b.DocumentSubmissionDate).hour(0).minute(0).second(0).millisecond(0).toDate();
                if (adate < bdate) {
                  return 1;
                } else if (adate > bdate) {
                  return -1;
                }
                if (a.Summary < b.Summary) {
                  return -1;
                } else if (a.Summary > b.Summary) {
                  return 1;
                }
                return 0;
              });

            if (this.outstandingDocsList.length === 0 && this.submittedDocsList.length > 0) {
              this.selectedDocStatus = 'submitted';
            }

            this.setDocumentsTab();
          }

          this.clearLoading();
        },
        () => {
          setTimeout(() => {
            this.errorCodeMessage = 'CONTCTINFO';
            this.showLoading = false;
          }, 0);
        }
      );
  }

  private clearLoading() {
    if (this.showLoading) {
      this.showLoading = false;
    }
  }

  private sortByDueDate(a, b) {
    if (a.DateDue === null && b.DateDue === null) {
      if (a.Summary < b.Summary) {
        return -1;
      } else if (a.Summary > b.Summary) {
        return 1;
      }
    }

    if (a.DateDue === null) {
      return 1;
    }

    if (b.DateDue === null) {
      return -1;
    }

    const adate = moment(a.DateDue).hour(0).minute(0).second(0).millisecond(0).toDate();
    const bdate = moment(b.DateDue).hour(0).minute(0).second(0).millisecond(0).toDate();

    if (adate > bdate) {
      return 1;
    } else if (adate < bdate) {
      return -1;
    }

    if (a.Summary < b.Summary) {
      return -1;
    } else if (a.Summary > b.Summary) {
      return 1;
    }

    return 0;
  }

  private applySortOrder() {
    if (this.sortOrder === 'due date') {
      this.outstandingDocsList = this.outstandingDocsList.sort(this.sortByDueDate);
    } else if (this.sortOrder === 'type') {
      this.outstandingDocsList = this.outstandingDocsList.sort((a, b) => {
        if (a.Department > b.Department) {
          return 1;
        } else if (a.Department < b.Department) {
          return -1;
        }

        if (a.Summary < b.Summary) {
          return -1;
        } else if (a.Summary > b.Summary) {
          return 1;
        }

        return 0;
      });
    } else if (this.sortOrder === 'time') {
      const noTimeList = this.outstandingDocsList
        .filter(
          (d) =>
            d.TimeToComplete === null ||
            d.TimeToComplete === TimeToComplete.None ||
            d.TimeToComplete === TimeToComplete.NA
        )
        .sort(this.sortByDueDate);

      const timeList = this.outstandingDocsList
        .filter(
          (d) =>
            d.TimeToComplete !== null &&
            d.TimeToComplete !== TimeToComplete.None &&
            d.TimeToComplete !== TimeToComplete.NA
        )
        .sort((a, b) => {
          if (a.TimeToComplete > b.TimeToComplete) {
            return 1;
          } else if (a.TimeToComplete < b.TimeToComplete) {
            return -1;
          }

          if (a.Summary < b.Summary) {
            return -1;
          } else if (a.Summary > b.Summary) {
            return 1;
          }

          return 0;
        });

      this.outstandingDocsList = timeList.concat(noTimeList);
    }
  }
}
