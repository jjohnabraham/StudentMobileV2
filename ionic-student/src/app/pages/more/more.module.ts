import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MorePageRoutingModule } from './more-routing.module';
import { MorePage } from './more.page';
import { SettingsComponent } from './components/settings/settings.component';
import { SharedModule } from '../../shared/shared.module';
import { ContactsComponent } from './components/contacts/contacts.component';
import { BookshelfComponent } from './components/bookshelf/bookshelf.component';
import { GraduateFileComponent } from './components/graduate-file/graduate-file.component';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { GraduateFileStatusCardComponent } from './components/graduate-file-status-card/graduate-file-status-card.component';
import { EmploymentFormComponent } from './components/employment-form/employment-form.component';
import { GradFileSubmitPopoverComponent } from './components/grad-file-submit-popover/grad-file-submit-popover.component';
import { PageLeavePopoverComponent } from './components/page-leave-popover/page-leave-popover.component';
import { BookshelfModalComponent } from './components/bookshelf-modal/bookshelf-modal.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, MorePageRoutingModule, SharedModule, ReactiveFormsModule],
  declarations: [
    MorePage,
    SettingsComponent,
    BookshelfComponent,
    ContactsComponent,
    GraduateFileComponent,
    GraduateFileStatusCardComponent,
    EmploymentFormComponent,
    GradFileSubmitPopoverComponent,
    PageLeavePopoverComponent,
    BookshelfModalComponent,
  ],
  providers: [FingerprintAIO],
})
export class MorePageModule {}
