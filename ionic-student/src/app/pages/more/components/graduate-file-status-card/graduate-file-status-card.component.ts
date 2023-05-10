import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BaseComponent } from '../../../../shared/components/base-component/base.component';
import { GraduateFileStatus } from '../graduate-file/graduate-file.component';

@Component({
  selector: 'pec-graduate-file-status-card',
  templateUrl: './graduate-file-status-card.component.html',
  styleUrls: ['./graduate-file-status-card.component.scss'],
})
export class GraduateFileStatusCardComponent extends BaseComponent implements OnInit {
  @Input() status: GraduateFileStatus;
  @Input() contactGroup: string;
  @Output() retry = new EventEmitter();

  public contactString: string;
  public statusHeader: string;
  public statusDescription: string;
  public startFileButton: string;

  constructor() {
    super();
  }

  public retryFormSubmission() {
    this.retry.emit();
  }

  public ngOnInit() {
    this.contactString = this.contactGroup === 'Success Coach' ? `your ${this.contactGroup}` : this.contactGroup;
    this.statusHeader = '';
    this.statusDescription = '';

    switch (this.status) {
      case GraduateFileStatus.NotSubmitted:
        this.startFileButton = 'Start Now';
        this.statusHeader = 'Graduate File Not Submitted';
        this.statusDescription = `In order to complete your Graduate File, please use the Start Now button below to begin. Once all the steps are completed, the information will be securely stored in your Graduate File. If you have any questions, please contact ${this.contactString}.`;
        break;
      case GraduateFileStatus.Submitted:
        this.startFileButton = 'Start a New Grad File';
        this.statusHeader = 'Graduate File Submitted';
        this.statusDescription = `You have previously submitted at least one Graduate File. You can start a new Graduate File using the button below. If you have any questions, please contact ${this.contactString}.`;
        break;
      case GraduateFileStatus.SuccessfullySubmitted:
        this.startFileButton = 'Start a New Grad File';
        this.statusHeader = 'Graduate File Submitted';
        this.statusDescription = `Thank you for submitting your Graduate File. The Student Advising team will review the information and contact you to finalize processing your Graduate File. If you have any questions, please contact ${this.contactString}.`;
        break;
      case GraduateFileStatus.Error:
        this.statusHeader = 'Graduate File Could Not Be Submitted';
        this.statusDescription = `Something went wrong and your Graduate File could not be submitted at this time. If you have any questions, please contact ${this.contactString}.`;
        break;
    }
  }
}
