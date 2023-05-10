import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnnouncementsDetailPage } from './components/announcements/announcements-detail/announcements-detail.page';
import { AnnouncementsPage } from './components/announcements/announcements/announcements.page';
import { ConnectPage } from './connect.page';
import { MessengerComponent } from './components/messenger/messenger.component';
import { NotificationsPage } from './components/notifications/notifications.page';

const routes: Routes = [
  {
    path: '',
    component: ConnectPage,
  },
  {
    path: 'announcements',
    component: AnnouncementsPage,
  },
  {
    path: 'annoucements/detail',
    component: AnnouncementsDetailPage,
  },
  {
    path: 'messenger',
    component: MessengerComponent,
  },
  {
    path: 'notifications',
    component: NotificationsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConnectPageRoutingModule {}
