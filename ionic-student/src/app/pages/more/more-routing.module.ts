import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MorePage } from './more.page';
import { SettingsComponent } from './components/settings/settings.component';
import { BookshelfComponent } from './components/bookshelf/bookshelf.component';
import { ContactsComponent } from './components/contacts/contacts.component';
import { GraduateFileComponent } from './components/graduate-file/graduate-file.component';
import { EmploymentFormComponent } from './components/employment-form/employment-form.component';
import { PageLeaveConfirmationGuard } from './guards/page-leave-confirmation.guard';

const routes: Routes = [
  {
    path: '',
    component: MorePage,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'bookshelf',
    component: BookshelfComponent,
  },
  {
    path: 'contacts',
    component: ContactsComponent,
  },
  {
    path: 'graduate-file',
    component: GraduateFileComponent,
  },
  {
    path: 'graduate-file/employment-form',
    component: EmploymentFormComponent,
    canDeactivate: [PageLeaveConfirmationGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MorePageRoutingModule {}
