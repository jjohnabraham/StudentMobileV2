import { Component, Input } from '@angular/core';
import { AssignmentAction } from '../assignment-card/assignment-card.component';

@Component({
  selector: 'pec-assignment-action-button',
  templateUrl: './assignment-action-button.component.html',
  styleUrls: ['./assignment-action-button.component.scss'],
})
export class AssignmentActionButtonComponent {
  @Input() currentAction: AssignmentAction;

  constructor() {}
}
