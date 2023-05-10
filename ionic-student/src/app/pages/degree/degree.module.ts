import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DegreePageRoutingModule } from './degree-routing.module';
import { DegreePage } from './degree.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { DegreeCourseExpanderComponent } from './components/degree-course-expander/degree-course-expander.component';
import { FtExamCardComponent } from './components/ft-exam-card/ft-exam-card.component';
import { GradedAssignmentDetailPage } from './components/graded-assignment-detail/graded-assignment-detail.page';
import { GradedAssignmentsPage } from './components/graded-assignments/graded-assignments.page';
import { NoAssignmentPopoverComponent } from './components/no-assignment-popover/no-assignment-popover.component';
import { UnofficialTransferCreditPage } from './components/unofficial-transfer-credit/unofficial-transfer-credit.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, DegreePageRoutingModule, SharedModule],
  providers: [DecimalPipe],
  declarations: [
    DegreePage,
    DegreeCourseExpanderComponent,
    FtExamCardComponent,
    GradedAssignmentsPage,
    GradedAssignmentDetailPage,
    NoAssignmentPopoverComponent,
    UnofficialTransferCreditPage,
  ],
})
export class DegreePageModule {}
