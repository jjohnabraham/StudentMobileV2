import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePage } from './home.page';
import { ClassroomComponent } from './components/classroom/classroom.component';
import { UnitInfoComponent } from './components/unit-info/unit-info.component';
import { CourseOverviewComponent } from './components/course-overview/course-overview.component';
import { AssignmentOverviewComponent } from './components/assignment-overview/assignment-overview.component';
import { AssignmentObjectivesComponent } from './components/assignment-objectives/assignment-objectives.component';
import { UnitLearningActivitiesComponent } from './components/unit-learning-activities/unit-learning-activities.component';
import { IdCardComponent } from './components/id-card/id-card.component';
import { MeetingOverviewComponent } from './components/meeting-overview/meeting-overview.component';
import { GroupLiveChatsComponent } from './components/group-live-chats/group-live-chats.component';
import { DiscussionBoardPage } from './components/discussion-board/discussion-board.page';
import { DiscussionBoardGuard } from './guards/discussion-board.guard';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'discussion-board/:classId/:assignmentId',
    component: DiscussionBoardPage,
    canDeactivate: [DiscussionBoardGuard],
  },
  {
    path: 'discussion-board/:classId/:assignmentId/:postId',
    component: DiscussionBoardPage,
    canDeactivate: [DiscussionBoardGuard],
  },
  {
    path: 'classroom/:classId',
    component: ClassroomComponent,
  },
  {
    path: 'classroom/:classId/unit-info/:unitId',
    component: UnitInfoComponent,
  },
  {
    path: 'classroom/:classId/unit-objectives/:unitId',
    component: UnitInfoComponent,
  },
  {
    path: 'classroom/:classId/unit-steps/:unitId',
    component: UnitInfoComponent,
  },
  {
    path: 'classroom/:classId/learning-activities/:unitId',
    component: UnitLearningActivitiesComponent,
  },
  {
    path: 'classroom/:classId/ground-learning-activities/:unitId',
    component: UnitLearningActivitiesComponent,
  },
  {
    path: 'classroom/:classId/course-overview',
    component: CourseOverviewComponent,
  },
  {
    path: 'classroom/:classId/course-objectives',
    component: CourseOverviewComponent,
  },
  {
    path: 'classroom/:classId/assignment-overview/:assignmentId',
    component: AssignmentOverviewComponent,
  },
  {
    path: 'classroom/:classId/assignment-objectives/:assignmentId',
    component: AssignmentObjectivesComponent,
  },
  {
    path: 'classroom/:classId/meeting-overview',
    component: MeetingOverviewComponent,
  },
  {
    path: 'classroom/:classId/group-live-chats',
    component: GroupLiveChatsComponent,
  },
  {
    path: 'id/:idType',
    component: IdCardComponent,
  },
  {
    path: 'alumni/:idType',
    component: IdCardComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
