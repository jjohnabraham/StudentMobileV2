import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ConnectPageRoutingModule } from './connect-routing.module';
import { ConnectPage } from './connect.page';
import { AnnouncementsPage } from './components/announcements/announcements/announcements.page';
import { AnnouncementsListComponent } from './components/announcements/announcements-list/announcements-list.component';
import { AnnouncementsFilterComponent } from './components/announcements/announcements-filter/announcements-filter.component';
import { AnnouncementsDetailPage } from './components/announcements/announcements-detail/announcements-detail.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { MessengerComponent } from './components/messenger/messenger.component';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { NotificationsPage } from './components/notifications/notifications.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ConnectPageRoutingModule, SharedModule],
  declarations: [
    ConnectPage,
    AnnouncementsPage,
    AnnouncementsListComponent,
    AnnouncementsFilterComponent,
    AnnouncementsDetailPage,
    MessengerComponent,
    NotificationsPage,
  ],
  providers: [Diagnostic],
})
export class ConnectPageModule {}
