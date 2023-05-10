import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ClassLiveSession, ClassSummary } from '../../../../data/types/class.type';
import { Unit, UnitAssignmentElement } from '../../../../data/types/unit.type';
import { first } from 'rxjs/operators';
import { UnitService } from '../../../../data/services/unit.service';
import { ZoomConcludedChats, ZoomRecording } from '../../../../data/types/meeting.type';

@Component({
  selector: 'pec-unit-assignments-list',
  templateUrl: './unit-assignments-list.component.html',
  styleUrls: ['./unit-assignments-list.component.scss'],
})
export class UnitAssignmentsListComponent implements OnInit {
  @Input() classSummary: ClassSummary;
  @Input() unit: Unit;
  @Input() isCTU: boolean;
  @Input() isPilotedCourse: boolean;
  @Input() isNewCustomCourse: boolean;
  @Input() zoomConcludedChatList: ZoomConcludedChats;
  @Output() assignmentsReady = new EventEmitter<{ hasAssignments: boolean; isSubmissionPilot: boolean }>();
  @Output() apiError = new EventEmitter<void>();

  public assignments = [];
  public showError: boolean;

  constructor(private unitService: UnitService) {}

  public ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.getUnitAssignments(this.unit);
  }

  private getUnitAssignments(unit: Unit) {
    if (!unit || !unit.UnitNumber) return;

    this.unitService
      .assignments(this.unit.ClassId, +unit.UnitNumber)
      .pipe(first())
      .subscribe(
        (unitAssignments) => {
          let assignments = [];
          const liveSessions = [];
          const zoomConcludedSession = [];
          if (unitAssignments && unitAssignments.Assignments) {
            assignments = unitAssignments.Assignments;
          }

          unit.IsSubmissionsPilot = unitAssignments.IsSubmissionsPilot;
          const minDate = new Date(unit.StartDate);
          const maxDate = new Date(unit.EndDate);
          if (this.classSummary.LiveSessionList) {
            this.classSummary.LiveSessionList.forEach((element) => {
              const startDate = new Date(element.StartDateTime);

              if (startDate >= minDate && startDate <= maxDate) {
                if (element.MeetingTypeId === 2) {
                  if (element.ShowMiniLesson) {
                    liveSessions.push(element);
                  }
                } else {
                  liveSessions.push(element);
                }
              }
            });
          }

          if (this.zoomConcludedChatList && this.zoomConcludedChatList.Recordings) {
            this.zoomConcludedChatList.Recordings.forEach((element) => {
              const startDate = new Date(element.StartDateTime);
              if (
                startDate >= minDate &&
                startDate <= maxDate &&
                (element.MeetingRecordedStatusId === 4 || element.MeetingRecordedStatusId === 5)
              ) {
                zoomConcludedSession.push(element);
              }
            });
          }

          this.assignments = this.groupAssignmentsAndMeetings(assignments, liveSessions, zoomConcludedSession);
          if (this.assignments?.length) {
            this.assignmentsReady.emit({ hasAssignments: true, isSubmissionPilot: unitAssignments.IsSubmissionsPilot });
          } else {
            this.assignmentsReady.emit({
              hasAssignments: false,
              isSubmissionPilot: unitAssignments.IsSubmissionsPilot,
            });
          }
        },
        () => this.apiError.emit()
      );
  }

  private groupAssignmentsAndMeetings(
    assignmentList: UnitAssignmentElement[],
    liveSessionList: ClassLiveSession[],
    zoomConcludedChatsList: ZoomRecording[]
  ) {
    const list = [];
    if (liveSessionList && liveSessionList.length) {
      liveSessionList.map((o) => {
        o.IsAssignment = false;
        o.IsArchive = false;
        if (!o.HideMeetingForStudent) {
          list.push(o);
        }
      });
    }

    if (zoomConcludedChatsList && zoomConcludedChatsList.length) {
      zoomConcludedChatsList.map((o) => {
        o.IsAssignment = false;
        o.IsArchive = true;

        list.push(o);
      });
    }

    if (assignmentList && assignmentList.length) {
      assignmentList.map((o) => {
        o.IsAssignment = true;
        list.push(o);
      });
    }

    return list.sort(this.sortList);
  }

  private sortList(a, b) {
    if (a && !b) return -1;
    if (!a && b) return 1;
    if (!a && !b) return 0;

    const dateA = a.DueDate || a.StartDateTime;
    const dateB = b.DueDate || b.StartDateTime;

    if (dateA && !dateB) return -1;
    if (!dateA && dateB) return 1;

    let r = 0;

    if (dateA && dateB) {
      r = new Date(dateA).getTime() - new Date(dateB).getTime();
    }

    if (r) return r;

    r = (a.AssignmentName || '').toLowerCase().localeCompare((b.AssignmentName || '').toLowerCase());

    if (r) return r;

    return 0;
  }
}
