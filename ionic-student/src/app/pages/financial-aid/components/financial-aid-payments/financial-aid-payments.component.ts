import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FinancialAidService } from 'src/app/data/services/financial-aid.service';
import { Payment } from 'src/app/data/types/financial-aid.type';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import { TrackingService } from 'src/app/shared/services/tracking.service';
import { PecPopOverService } from '../../../../shared/services/pec-popover.service';
import { TfcPaymentConfirmationPopoverComponent } from '../tfc-payment-confirmation-popover/tfc-payment-confirmation-popover.component';
import { ViewDidLeave } from '@ionic/angular';

@Component({
  selector: 'pec-financial-aid-payments',
  templateUrl: './financial-aid-payments.component.html',
  styleUrls: ['./financial-aid-payments.component.scss'],
})
export class FinancialAidPaymentsComponent extends BaseComponent implements OnInit, ViewDidLeave {
  @Input() refresh: boolean;
  @Input() isPackaged: boolean;
  @Output() loadingFinished: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() errorOnLoad: EventEmitter<string> = new EventEmitter<string>();

  public showLoading: boolean;
  public paymentInfo: PaymentInfoModel;

  constructor(
    public globalConfigs: GlobalConfigsService,
    private financialAidService: FinancialAidService,
    private trackingService: TrackingService,
    private popoverCtrl: PecPopOverService
  ) {
    super();
  }

  public ionViewDidLeave() {
    this.popoverCtrl.dismiss();
  }

  public showPaymentModal() {
    this.popoverCtrl.show({
      component: TfcPaymentConfirmationPopoverComponent,
      componentProps: {
        buttons: [
          {
            label: 'Cancel',
            action: () => {
              this.popoverCtrl.dismiss();
            },
          },
          {
            label: 'Continue',
            action: () => {
              this.popoverCtrl.dismiss().then(() => this.globalConfigs.openUrlOutOfApp(this.paymentInfo.tfcPaymentUrl));
            },
          },
        ],
      },
    });
  }

  public ngOnInit() {
    this.beginLoad(this.refresh);
  }

  private beginLoad(refresh: boolean) {
    if (!this.subscriptions.payment) {
      this.showLoading = true;
      this.subscriptions.payment = this.financialAidService.financialAidPayment(refresh).subscribe(
        (payment) => {
          this.bindPaymentInfo(payment);
          this.showLoading = false;
          this.loadingFinished.emit(true);
        },
        (error) => {
          this.errorOnLoad.emit('PAYMENTINFO');
          this.trackingService.trackEvent({
            view: 'Financial Aid View',
            category: 'System Errors',
            action: 'ErrorCode : PAYMENTINFO',
            label: 'Financial Page',
            value: '',
          });

          setTimeout(() => {
            if (this.subscriptions.payment) {
              this.subscriptions.payment.unsubscribe();
              delete this.subscriptions.payment;
            }
          }, 0);
        }
      );
    }
  }

  private bindPaymentInfo(payment: Payment) {
    this.paymentInfo = {} as any;
    this.paymentInfo.showPaymentInfo = payment.DisplayFaPaymentInfoCard;
    this.paymentInfo.paymentPortalUrl = payment.StudentPortalPaymentURL;
    this.paymentInfo.showMakePayment = payment.NextPaymentDueAmount > 0 || payment.PastDuePaymentAmount > 0;
    this.paymentInfo.nextDueDate = payment.NextPaymentDueDate ? this.formatDate(payment.NextPaymentDueDate) : '';
    this.paymentInfo.nextDueAmount = payment.NextPaymentDueAmount.toFixed(2);
    this.paymentInfo.pastDueAmount = payment.PastDuePaymentAmount.toFixed(2);
    this.paymentInfo.tfcPaymentUrl = payment.TfcPaymentUrl;
    this.paymentInfo.useTfcSiteForPayment = payment.UseTfcSiteForPayment;
  }

  private formatDate(date) {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const d = new Date(date);
    let day = d.getDate().toString();
    day = day.length === 1 ? '0' + day : day;

    return `${monthNames[d.getMonth()]} ${day}`;
  }
}

interface PaymentInfoModel {
  useTfcSiteForPayment: boolean;
  tfcPaymentUrl: string;
  showPaymentInfo: boolean;
  paymentPortalUrl: string;
  showMakePayment: boolean;
  nextDueDate: string;
  nextDueAmount: string;
  pastDueAmount: string;
}
