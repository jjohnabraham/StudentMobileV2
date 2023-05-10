import { Component } from '@angular/core';
import { BasePageComponent } from '../../../../shared/components/base-page-component/base-page.component';
import { Router } from '@angular/router';

@Component({
  selector: 'pec-meeting-overview',
  templateUrl: './meeting-overview.component.html',
  styleUrls: ['./meeting-overview.component.scss'],
})
export class MeetingOverviewComponent extends BasePageComponent {
  public title: string;
  public description: string;
  public chatDescription: string;

  constructor(private router: Router) {
    super();

    const state = router.getCurrentNavigation().extras.state;

    this.title = state.title;
    this.description = state.description;
    this.chatDescription = state.chatDescription;
  }
}
