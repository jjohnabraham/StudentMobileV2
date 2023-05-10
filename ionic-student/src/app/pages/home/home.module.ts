import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { ClassHoldComponent } from './components/class-hold/class-hold.component';
import { SharedModule } from '../../shared/shared.module';
import { ClassroomComponent } from './components/classroom/classroom.component';
import { ClassroomFilterModalComponent } from './components/classroom-filter-modal/classroom-filter-modal.component';
import { ClassroomListComponent } from './components/classroom-list/classroom-list.component';
import { ClassroomSliderComponent } from './components/classroom-slider/classroom-slider.component';
import { ClassroomOverviewCardComponent } from './components/classroom-overview-card/classroom-overview-card.component';
import { UnitInfoComponent } from './components/unit-info/unit-info.component';
import { CourseOverviewComponent } from './components/course-overview/course-overview.component';
import { AssignmentOverviewComponent } from './components/assignment-overview/assignment-overview.component';
import { AssignmentObjectivesComponent } from './components/assignment-objectives/assignment-objectives.component';
import { UnitLearningActivitiesComponent } from './components/unit-learning-activities/unit-learning-activities.component';
import { SapAppealComponent } from './components/sap-appeal/sap-appeal.component';
import { IdCardComponent } from './components/id-card/id-card.component';
import { GroupLiveChatsComponent } from './components/group-live-chats/group-live-chats.component';
import { MeetingOverviewComponent } from './components/meeting-overview/meeting-overview.component';
import { AppAvailability } from '@ionic-native/app-availability/ngx';
import { MeetingCardComponent } from './components/meeting-card/meeting-card.component';
import { UnitAssignmentsListComponent } from './components/unit-assignments-list/unit-assignments-list.component';
import { MiniIdCardComponent } from './components/mini-id/mini-id-card.component';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { DiscussionBoardPage } from './components/discussion-board/discussion-board.page';
import { DiscussionBoardGuard } from './guards/discussion-board.guard';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, HomePageRoutingModule, SharedModule],
  providers: [DecimalPipe, DatePipe, AppAvailability, FingerprintAIO, DiscussionBoardGuard],
  declarations: [
    HomePage,
    DiscussionBoardPage,
    ClassHoldComponent,
    ClassroomComponent,
    ClassroomFilterModalComponent,
    ClassroomListComponent,
    ClassroomSliderComponent,
    ClassroomOverviewCardComponent,
    UnitInfoComponent,
    CourseOverviewComponent,
    AssignmentOverviewComponent,
    AssignmentObjectivesComponent,
    IdCardComponent,
    UnitLearningActivitiesComponent,
    SapAppealComponent,
    GroupLiveChatsComponent,
    MeetingOverviewComponent,
    MeetingCardComponent,
    UnitAssignmentsListComponent,
    MiniIdCardComponent,
  ],
})
export class HomePageModule {}
