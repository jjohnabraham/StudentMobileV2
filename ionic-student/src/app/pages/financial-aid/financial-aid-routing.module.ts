import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FinancialAidPage } from './financial-aid.page';
import { AwardLettersComponent } from './components/award-letters/award-letters.component';
import { FinancialDocumentSummaryPage } from './components/financial-document-summary/financial-document-summary.page';
import { FinancialDocumentUploadPage } from './components/financial-document-upload/financial-document-upload.page';
import { FinancialDocumentUploadConfirmationPage } from './components/financial-document-upload-confirmation/financial-document-upload-confirmation.page';

const routes: Routes = [
  {
    path: '',
    component: FinancialAidPage,
  },
  {
    path: 'award-letters',
    component: AwardLettersComponent,
  },
  {
    path: 'document-summary',
    component: FinancialDocumentSummaryPage,
  },
  {
    path: 'document-upload',
    component: FinancialDocumentUploadPage,
  },
  {
    path: 'document-upload-confirmation',
    component: FinancialDocumentUploadConfirmationPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinancialAidPageRoutingModule {}
