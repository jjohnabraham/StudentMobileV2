import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { ClassInfo, ClassStatus, ClassSummary } from '../../../../data/types/class.type';
import { Unit, UnitInfo } from '../../../../data/types/unit.type';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { BaseComponent } from '../../../../shared/components/base-component/base.component';
import { ThemeId } from '../../../../shared/enums/theme-id.enum';
import { ZoomConcludedChats } from '../../../../data/types/meeting.type';

@Component({
  selector: 'pec-classroom-list',
  templateUrl: './classroom-list.component.html',
  styleUrls: ['./classroom-list.component.scss'],
})
export class ClassroomListComponent extends BaseComponent implements AfterViewInit {
  @Input() classId: number;
  @Input() isAccelerated: boolean;
  @Input() isOrientation: boolean;
  @Input() isPilotedCourse: boolean;
  @Input() isStandardClass: boolean;
  @Input() showOverview: boolean;
  @Input() classStatus: ClassStatus;
  @Input() unitsInfo: Unit[];
  @Input() classSummary: ClassSummary;

  @Input() classInfo: ClassInfo;
  @Input() zoomConcludedChatList: ZoomConcludedChats;
  @Input() visitedCourseOverview = false;
  @Input() isNewCustomCourse = false;
  @Output() visitedCourseOverviewChanged = new EventEmitter<boolean>();
  @Output() apiError = new EventEmitter<void>();

  public isCTU: boolean;

  constructor(public globalConfigs: GlobalConfigsService) {
    super();

    this.isCTU = this.globalConfigs.themeId === ThemeId.CTU;
  }

  public onAssignmentsReady($event: { hasAssignments: boolean; isSubmissionPilot: boolean }, unit: Unit) {
    unit.HasAssignments = $event.hasAssignments;
    unit.IsSubmissionsPilot = $event.isSubmissionPilot;
  }

  public onUnitOverviewReady($event: UnitInfo, unit: Unit) {
    unit.UnitOverview = $event;
  }

  public ngAfterViewInit(): void {
    this.setVisitedCourseOverview();
  }

  public onError() {
    this.apiError.emit();
  }

  private setVisitedCourseOverview() {
    if (
      this.showOverview &&
      (!this.visitedCourseOverview || new Date(this.classSummary.StartDate) > new Date()) &&
      !this.globalConfigs.isImpersonatedUser
    ) {
      this.visitedCourseOverviewChanged.emit(true);
    }
  }
}
