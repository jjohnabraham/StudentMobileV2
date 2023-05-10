import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewDidEnter, NavParams } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { AssignmentService } from 'src/app/data/services/assignment.service';
import { AssignmentSummary } from 'src/app/data/types/assignment.type';
import { BasePageComponent } from 'src/app/shared/components/base-page-component/base-page.component';
import { TrackingService } from 'src/app/shared/services/tracking.service';

@Component({
  selector: 'pec-graded-assignments-page',
  templateUrl: './graded-assignments.page.html',
  styleUrls: ['./graded-assignments.page.scss'],
})
export class GradedAssignmentsPage extends BasePageComponent {
  public assignments: string;
  public courseDescription: string;
  public showError = false;
  public showLoading = false;
  public assignmentList: AssignmentSummary[];

  private classId: number;
  private tabSelect = 1;

  constructor(
    private trackingService: TrackingService,
    private assignmentService: AssignmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super();
    this.route.queryParams.subscribe((params) => {
      if (params.classId !== undefined) {
        this.classId = params.classId;
      }
      if (params.description !== undefined) {
        this.courseDescription = params.description;
      }
    });
    if (this.route.snapshot.queryParams.tabSelect && this.route.snapshot.queryParams.tabSelect === '2') {
      this.tabSelect = 2;
    }
  }
  public reload() {
    this.showError = false;
    this.clearSubscriptions();
    this.beginLoadData();
  }
  public goToDetail(assignment: AssignmentSummary) {
    this.trackingService.trackEvent({
      category: 'Degree Plan View',
      action: 'Tapped to View Completed Course Info',
      label: 'Grade Details',
      value: '',
      classId: this.classId,
    });
    this.router.navigate(['/tabs/degree/graded-assignments/detail'], {
      state: { classId: this.classId, assignmentId: assignment.AssignmentId, assignment },
      queryParams: { tabSelect: this.tabSelect },
    });
  }

  protected beginLoadData() {
    if (!this.subscriptions.gradedAssignmentList) {
      this.showLoading = true;

      this.assignmentService
        .summaryList(this.classId)
        .pipe(first())
        .subscribe(
          (assignmentList) => {
            if (assignmentList) {
              this.assignmentList = assignmentList.sort(this.sortList);
            }
            this.clearLoading();
          },
          (error) => {
            this.showError = true;
            this.showLoading = false;

            setTimeout(() => {
              if (this.subscriptions.gradedAssignmentList) {
                this.subscriptions.gradedAssignmentList.unsubscribe();
                delete this.subscriptions.gradedAssignmentList;
              }
            }, 0);
          }
        );
    }
  }

  private clearLoading() {
    if (this.showLoading && this.assignmentList) {
      this.showLoading = false;
    }
  }

  private sortList(a: AssignmentSummary, b: AssignmentSummary) {
    if (a && !b) return -1;
    if (!a && b) return 1;

    if (a.DueDate && !b.DueDate) return -1;
    if (!a.DueDate && b.DueDate) return 1;

    let r = new Date(a.DueDate).getTime() - new Date(b.DueDate).getTime();
    if (r) return r;

    r = (a.AssignmentName || '').toLowerCase().localeCompare((b.AssignmentName || '').toLowerCase());
    if (r) return r;

    return 0;
  }
}
