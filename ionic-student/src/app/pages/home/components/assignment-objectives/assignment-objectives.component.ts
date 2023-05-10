import { Component } from '@angular/core';
import { BasePageComponent } from '../../../../shared/components/base-page-component/base-page.component';
import { ClassAssignment } from '../../../../data/types/assignment.type';
import { Router } from '@angular/router';

@Component({
  selector: 'pec-assignment-objectives',
  templateUrl: './assignment-objectives.component.html',
  styleUrls: ['./assignment-objectives.component.scss'],
})
export class AssignmentObjectivesComponent extends BasePageComponent {
  public assignment: ClassAssignment;

  constructor(private router: Router) {
    super();

    const state = router.getCurrentNavigation().extras.state;
    this.assignment = state.assignment;
  }
}
