import { Component, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { AssignmentService } from 'src/app/data/services/assignment.service';

import {
  AssignmentFile,
  AssignmentPart,
  AssignmentSummary,
  DetailsOfAssignment,
} from 'src/app/data/types/assignment.type';
import { BasePageComponent } from 'src/app/shared/components/base-page-component/base-page.component';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import { PecNavigationService } from 'src/app/shared/services/pec-navigation.service';

@Component({
  selector: 'pec-graded-assignment-detail',
  templateUrl: './graded-assignment-detail.page.html',
  styleUrls: ['./graded-assignment-detail.page.scss'],
})
export class GradedAssignmentDetailPage extends BasePageComponent {
  public classId: number;
  public previousView: string;
  public assignmentId: number;
  public assignment: AssignmentSummaryModel;
  public assignmentDetail: DetailsOfAssignment;
  public instructorFeedbackUrl: string;

  public pageTrackTitle: string;

  public gradeLetter = 'N/A';
  public hasParts: boolean;
  public assignmentParts: AssignmentPart[];
  public attachments: AssignmentFileModel[];

  public showError = false;
  public showLoading = false;
  public showFeedbackLoading = false;
  public showAttachmentLoading = false;

  //Grade Mask
  public gradeMasked: boolean;
  public gradeHeader: string;
  public pointsTitle: string;
  public pointsValue: string;
  public maxProg = 0;
  public currentProg = 0;
  public errCode = '';

  constructor(
    private globalConfigs: GlobalConfigsService,
    private assignmentService: AssignmentService,
    private navCtrl: NavController,
    public pecNavService: PecNavigationService,
    private router: Router
  ) {
    super();

    document.addEventListener(
      'backbutton',
      () => {
        this.onBack();
      },
      false
    );
  }

  public onBack() {
    if (this.previousView === this.pecNavService.getCurrentUrl()) {
      this.previousView = 'tabs/connect/notifications';
    }
    if (this.previousView) {
      this.router.navigateByUrl(this.previousView);
    } else {
      this.pecNavService.goBack();
    }
  }

  protected beginLoadData() {
    this.showAllLoading();

    const state = history.state;
    this.classId = Number(state.classId);
    this.assignmentId = Number(state.assignmentId);
    this.assignment = state.assignment;
    this.pageTrackTitle = state.pageTrackTitle;

    if (state && state.previousurl) {
      this.previousView = state.previousurl;
    }

    if (!this.assignment && this.classId && this.assignmentId) {
      this.getAssignment(this.classId, this.assignmentId);
    } else {
      this.showLoading = false;
    }

    this.getAssignmentDetail();
    this.getAssignmentFeedback();
    this.setAssignmentData();
    this.setDateFormat();
    this.setContentVariables();
  }

  private showAllLoading() {
    this.showLoading = true;
    this.showFeedbackLoading = true;
    this.showAttachmentLoading = true;
  }

  private getAssignment(classId: number, assignmentId: number) {
    this.subscriptions.assignmentSummary = this.assignmentService.summaryList(classId).subscribe(
      (assignmentList) => {
        if (assignmentList) {
          this.assignment = assignmentList.find((element) => {
            return element.AssignmentId === assignmentId;
          });
          this.setDateFormat();
        }

        this.setAssignmentData();
        this.setContentVariables();
        this.showLoading = false;
      },
      (error) => {
        this.showError = true;
        this.errCode = error.status;
        this.showLoading = false;

        setTimeout(() => {
          if (this.subscriptions.assignmentSummary) {
            this.subscriptions.assignmentSummary.unsubscribe();
            delete this.subscriptions.assignmentSummary;
          }
        }, 0);
      }
    );
  }

  private setAssignmentData() {
    this.assignmentParts = this.sortAssignmentParts();
    this.hasParts = this.assignment?.AssignmentPart && this.assignment.AssignmentPart.length > 0;
    if (this.assignment) this.gradeLetter = this.assignment.GradeLetter.toUpperCase();
  }

  private setDateFormat() {
    const currentTime = new Date();
    const currentYear = currentTime.getFullYear();
    if (this.assignment) {
      if (new Date(this.assignment.DueDate).getFullYear() === currentYear) {
        this.assignment.IsCurrentYear = true;
      } else {
        this.assignment.IsCurrentYear = false;
      }
    }
  }

  private getAssignmentDetail() {
    if (!this.subscriptions.assignmentDetail) {
      this.assignmentService
        .detail(this.classId, this.assignmentId, 0)
        .pipe(first())
        .subscribe(
          (assignmentDetail: DetailsOfAssignment) => {
            if (assignmentDetail) {
              this.assignmentDetail = assignmentDetail;
              const currentTime = new Date();
              const currentYear = currentTime.getFullYear();
              const assignments: AssignmentFileModel[] = this.assignmentDetail.AssignmentFiles;
              if (assignments && assignments.length > 0) {
                for (const assignmentFile of assignments) {
                  if (new Date(assignmentFile.CreateDate).getFullYear() === currentYear) {
                    assignmentFile.isCurrentYear = true;
                  } else {
                    assignmentFile.isCurrentYear = false;
                  }
                }
              }
            }

            this.attachments = this.sortAttachments();
            this.addAttachmentUrls();

            this.showAttachmentLoading = false;
          },
          (error) => {
            this.showError = true;
            this.errCode = error.status;
            this.showAttachmentLoading = false;

            setTimeout(() => {
              if (this.subscriptions.assignmentDetail) {
                this.subscriptions.assignmentDetail.unsubscribe();
                delete this.subscriptions.assignmentDetail;
              }
            }, 0);
          }
        );
    }
  }

  private getAssignmentFeedback() {
    if (!this.subscriptions.assignmentFeedback) {
      this.subscriptions.assignmentFeedback = this.assignmentService.info(this.classId, this.assignmentId).subscribe(
        (assignmentFeedback) => {
          if (assignmentFeedback) {
            this.instructorFeedbackUrl = assignmentFeedback.InstructorFeedbackUrl;
          }

          this.showFeedbackLoading = false;
        },
        (error) => {
          this.showError = true;
          this.errCode = error.status;
          this.showFeedbackLoading = false;

          setTimeout(() => {
            if (this.subscriptions.assignmentFeedback) {
              this.subscriptions.assignmentFeedback.unsubscribe();
              delete this.subscriptions.assignmentFeedback;
            }
          }, 0);
        }
      );
    }
  }

  private sortAttachments(): AssignmentFile[] {
    if (
      this.assignmentDetail &&
      this.assignmentDetail.AssignmentFiles &&
      this.assignmentDetail.AssignmentFiles.length > 0
    ) {
      return this.assignmentDetail.AssignmentFiles.sort((a, b) => {
        if (a.CreateDate < b.CreateDate) return -1;
        else if (a.CreateDate > b.CreateDate) return 1;
        else return 0;
      });
    }
    return [];
  }

  private addAttachmentUrls() {
    const classId = this.classId;
    if (this.attachments) {
      this.attachments.forEach((element) => {
        element.attachmentUrl =
          '{{lmsUrl}}/lms/class/' + classId + '/document/' + element.LMSDocumentID + '/open?slt={{token}}';
      });
    }
  }

  private sortAssignmentParts() {
    if (this.assignment && this.assignment.AssignmentPart && this.assignment.AssignmentPart.length > 0) {
      return this.assignment.AssignmentPart.sort((a, b) => {
        if (a.DisplayOrder < b.DisplayOrder) return -1;
        else if (a.DisplayOrder > b.DisplayOrder) return 1;
        else return 0;
      });
    }
    return [];
  }

  private setContentVariables() {
    if (this.assignment) {
      //set variable if available
      this.gradeMasked = this.assignment.HasGradeMaskedAssignment;
      //set grade letter
      if (!this.assignment.IsExtraCredit && !this.gradeMasked) {
        this.gradeHeader = this.gradeLetter;
      } else if (this.assignment.IsExtraCredit && !this.gradeMasked) {
        this.gradeHeader = 'N/A';
      } else if (this.gradeMasked) {
        this.gradeHeader = 'NOT YET PARTICIPATED';
      }

      //set circle progress indicator
      this.maxProg = this.assignment.PossiblePoints;
      if (!this.gradeMasked) {
        this.currentProg = this.assignment.EarnedPoints ? this.assignment.EarnedPoints : 0;
      }

      //set points title & points value
      if (!this.gradeMasked) {
        this.pointsTitle = 'Points Earned';
        this.pointsValue =
          (this.assignment.EarnedPoints ? this.assignment.EarnedPoints : 0) + '/' + this.assignment.PossiblePoints;
      } else {
        this.pointsTitle = 'Points Possible';
        this.pointsValue = this.assignment.PossiblePoints.toString();
      }
    }
  }
}

interface AssignmentSummaryModel extends AssignmentSummary {
  attachmentUrl?: string;
  gradeMasked?: boolean;
  IsCurrentYear?: boolean;
}

interface AssignmentFileModel extends AssignmentFile {
  isCurrentYear?: boolean;
  attachmentUrl?: string;
}
