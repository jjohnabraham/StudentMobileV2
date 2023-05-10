import { Component, OnInit } from '@angular/core';
import { BasePageComponent } from '../../../../shared/components/base-page-component/base-page.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AssignmentService } from '../../../../data/services/assignment.service';
import { Class, GroupMembersSubmission } from '../../../../data/types/class.type';
import { first } from 'rxjs/operators';
import { ClassService } from '../../../../data/services/class.service';
import { AssignmentDetails, ClassAssignment } from '../../../../data/types/assignment.type';

@Component({
  selector: 'pec-assignment-overview',
  templateUrl: './assignment-overview.component.html',
  styleUrls: ['./assignment-overview.component.scss'],
})
export class AssignmentOverviewComponent extends BasePageComponent implements OnInit {
  public classId: number;
  public assignment: ClassAssignment;
  public showLoading: boolean;
  public classInfo: Class;
  public assignmentModelOverview: AssignmentDetails;
  public assignmentOverview: AssignmentDetails;
  public activeMemberList: GroupMembersSubmission[];
  public inactiveMemberList: GroupMembersSubmission[];
  public showLess = false;
  public isNewCustomCourse = false;

  private assignmentId: number;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private assignmentService: AssignmentService,
    private classService: ClassService
  ) {
    super();

    const state = router.getCurrentNavigation().extras.state;

    this.classId = +this.activatedRoute.snapshot.params.classId;
    this.assignmentId = this.activatedRoute.snapshot.params.assignmentId;
    this.assignment = state?.assignment;
    this.isNewCustomCourse = state?.isNewCustomCourse;
  }

  public ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.showLoading = true;

    this.getClass();
    this.getAssignmentInfo();
  }

  private getClass() {
    if (this.classId && !this.classInfo) {
      this.classService
        .classList('Current')
        .pipe(first())
        .subscribe(
          (classList) => {
            if (classList && classList.length) {
              this.classInfo = classList.find((o) => {
                return o.ClassId === this.classId;
              });
            }

            this.clearLoading();
          },
          () => {
            this.showLoading = false;
          }
        );
    }
  }

  private getAssignmentInfo() {
    if (this.assignmentId && !this.assignment) {
      this.assignmentService
        .info(this.classId, this.assignmentId)
        .pipe(first())
        .subscribe(
          (assignment) => {
            this.assignment = assignment;
            this.getAssignmentDetails();
            this.clearLoading();
          },
          () => {
            this.showLoading = false;
          }
        );
    } else {
      this.getAssignmentDetails();
    }
  }

  private getAssignmentDetails() {
    if (this.classId && this.assignment && this.assignment.AssignmentTypeId === 3) {
      this.assignmentService
        .assignmentModelOverview(this.classId, this.assignment.AssignmentId)
        .pipe(first())
        .subscribe(
          (assignmentModelOverview) => {
            this.assignmentOverview = this.assignmentModelOverview = assignmentModelOverview;

            if (this.assignmentModelOverview.AssignmentDetails[0]) {
              this.assignment = this.assignmentModelOverview.AssignmentDetails[0];
            }

            if (this.assignmentModelOverview.AssignmentDetails[0].Description) {
              this.assignmentModelOverview.AssignmentDetails[0].Description = this.pdfLinkFix(
                this.assignmentOverview.AssignmentDetails[0].Description
              );
            }

            if (this.assignmentModelOverview.AssignmentDetails[0].GroupMembersSubmissions) {
              this.assignmentModelOverview.AssignmentDetails[0].GroupMembersSubmissions.sort(this.alphaNameCompare);
            }

            // Active and Inactive member
            this.activeMemberList = this.assignmentModelOverview.AssignmentDetails[0].GroupMembersSubmissions.filter(
              (element) => element.IsActive === true
            );

            this.inactiveMemberList = this.assignmentModelOverview.AssignmentDetails[0].GroupMembersSubmissions.filter(
              (element) => element.IsActive === false
            );

            this.clearLoading();
          },
          () => {
            this.showLoading = false;
          }
        );
    } else if (this.classId && this.assignment) {
      this.assignmentService.assignmentOverview(this.classId, this.assignment.AssignmentId).subscribe(
        (assignmentOverview) => {
          this.assignmentOverview = assignmentOverview;
          if (this.assignmentOverview.AssignmentDetails[0].Description) {
            this.assignmentOverview.AssignmentDetails[0].Description = this.pdfLinkFix(
              this.assignmentOverview.AssignmentDetails[0].Description
            );
          }

          this.clearLoading();
        },
        () => {
          this.showLoading = false;
        }
      );
    }
  }

  private pdfLinkFix(description) {
    description = description.replace('\\Resources\\AdobePDF\\', '/Resources/AdobePDF/');
    return description;
  }

  private alphaNameCompare(a, b) {
    if (a.FirstName < b.FirstName) return -1;
    if (a.FirstName > b.FirstName) return 1;
    return 0;
  }

  private clearLoading() {
    if (this.classInfo && this.assignment) {
      this.showLoading = false;
    }
  }
}
