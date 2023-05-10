import { Component } from '@angular/core';
import { BasePageComponent } from '../../../../shared/components/base-page-component/base-page.component';
import { ClassSummary } from '../../../../data/types/class.type';
import { ViewDidEnter } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { ClassService } from '../../../../data/services/class.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'pec-course-overview',
  templateUrl: './course-overview.component.html',
  styleUrls: ['./course-overview.component.scss'],
})
export class CourseOverviewComponent extends BasePageComponent implements ViewDidEnter {
  public classId: number;
  public isCourseOverview: boolean;
  public isCourseObjectives: boolean;
  public courseInfo: ClassSummary;
  public courseObjectives: string[];
  public courseOverview: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private globalConfigs: GlobalConfigsService,
    private classService: ClassService
  ) {
    super();

    const state = router.getCurrentNavigation().extras.state;

    this.classId = activatedRoute.snapshot.params.classId;

    this.isCourseOverview = state.isCourseOverview;
    this.isCourseObjectives = state.isCourseObjectives;
    this.courseInfo = state.courseInfo;
  }

  public ionViewDidEnter() {
    this.loadData();
  }

  private loadData() {
    if (this.isCourseOverview) {
      this.courseOverview = this.courseInfo.StudentSpecific.CourseOverview
        ? this.courseInfo.StudentSpecific.CourseOverview
        : this.courseInfo.StudentSpecific.CourseDescription;
    }

    if (this.isCourseObjectives) {
      this.classService
        .objectives(this.classId)
        .pipe(first())
        .subscribe((courseObjectives) => {
          this.courseObjectives = courseObjectives;
        });
    }
  }
}
