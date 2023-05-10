import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { EmploymentFormComponent } from '../components/employment-form/employment-form.component';

@Injectable({
  providedIn: 'root',
})
export class PageLeaveConfirmationGuard implements CanDeactivate<EmploymentFormComponent> {
  constructor() {}

  canDeactivate(target: EmploymentFormComponent) {
    return target.canPageLeave();
  }
}
