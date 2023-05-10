import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GradedAssignmentDetailPage } from './components/graded-assignment-detail/graded-assignment-detail.page';
import { GradedAssignmentsPage } from './components/graded-assignments/graded-assignments.page';
import { DegreePage } from './degree.page';
import { UnofficialTransferCreditPage } from './components/unofficial-transfer-credit/unofficial-transfer-credit.page';

const routes: Routes = [
  {
    path: '',
    component: DegreePage,
  },
  {
    path: 'graded-assignments',
    component: GradedAssignmentsPage,
  },
  {
    path: 'graded-assignments/detail',
    component: GradedAssignmentDetailPage,
  },
  {
    path: 'unoffical-transfer-credit',
    component: UnofficialTransferCreditPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DegreePageRoutingModule {}
