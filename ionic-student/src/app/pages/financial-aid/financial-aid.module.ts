import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FinancialAidPageRoutingModule } from './financial-aid-routing.module';
import { FinancialAidPage } from './financial-aid.page';
import { FinancialAidTipsComponent } from './components/financial-aid-tips/financial-aid-tips.component';
import { FinancialAidAdvisorComponent } from './components/financial-aid-advisor/financial-aid-advisor.component';
import { FinancialAidDocumentComponent } from './components/financial-aid-document/financial-aid-document.component';
import { FinancialAidNotpackagedComponent } from './components/financial-aid-notpackaged/financial-aid-notpackaged.component';
import { FinancialAidPaymentsComponent } from './components/financial-aid-payments/financial-aid-payments.component';
import { FinancialAidAwardComponent } from './components/financial-aid-award/financial-aid-award.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FinancialAidOverviewComponent } from './components/financial-aid-overview/financial-aid-overview.component';
import { AwardLettersComponent } from './components/award-letters/award-letters.component';
import { FinancialDocumentSummaryPage } from './components/financial-document-summary/financial-document-summary.page';
import { FinancialDocumentUploadPage } from './components/financial-document-upload/financial-document-upload.page';
import { FinancialDocumentUploadConfirmationPage } from './components/financial-document-upload-confirmation/financial-document-upload-confirmation.page';
import { TfcPaymentConfirmationPopoverComponent } from './components/tfc-payment-confirmation-popover/tfc-payment-confirmation-popover.component';
import { FinancialAidDocumentItemComponent } from './components/financial-aid-document-item/financial-aid-document-item.component';
import { FinancialAidDocumentSlideupComponent } from './components/financial-aid-document-slideup/financial-aid-document-slideup.component';
import { FinancialAidDocumentContactComponent } from './components/financial-aid-document-contact/financial-aid-document-contact.component';
import { FinancialAidSortingModalComponent } from './components/financial-aid-sorting-modal/financial-aid-sorting-modal.component';
import { NonRequiredFaDocumentsComponent } from './components/non-required-fa-documents/non-required-fa-documents.component';
import { FinancialDocumentUploadModalComponent } from './components/financial-document-upload-modal/financial-document-upload-modal.component';
import { SwiperModule } from 'swiper/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinancialAidPageRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    SwiperModule,
  ],
  providers: [DecimalPipe],
  declarations: [
    FinancialAidPage,
    FinancialDocumentSummaryPage,
    FinancialDocumentUploadPage,
    FinancialDocumentUploadConfirmationPage,
    FinancialAidTipsComponent,
    FinancialAidAdvisorComponent,
    FinancialAidDocumentComponent,
    FinancialAidNotpackagedComponent,
    FinancialAidPaymentsComponent,
    FinancialAidAwardComponent,
    FinancialAidOverviewComponent,
    AwardLettersComponent,
    TfcPaymentConfirmationPopoverComponent,
    FinancialAidDocumentItemComponent,
    FinancialAidDocumentSlideupComponent,
    FinancialAidDocumentContactComponent,
    FinancialAidSortingModalComponent,
    NonRequiredFaDocumentsComponent,
    FinancialDocumentUploadModalComponent,
  ],
})
export class FinancialAidPageModule {}
