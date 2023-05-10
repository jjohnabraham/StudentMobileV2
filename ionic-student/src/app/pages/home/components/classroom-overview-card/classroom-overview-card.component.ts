import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BaseComponent } from '../../../../shared/components/base-component/base.component';
import { ClassStatus, ClassSummary } from '../../../../data/types/class.type';
import { Unit, UnitInfo } from '../../../../data/types/unit.type';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { ThemeId } from '../../../../shared/enums/theme-id.enum';
import { first } from 'rxjs/operators';
import { UnitService } from '../../../../data/services/unit.service';

@Component({
  selector: 'pec-classroom-overview-card',
  templateUrl: './classroom-overview-card.component.html',
  styleUrls: ['./classroom-overview-card.component.scss'],
})
export class ClassroomOverviewCardComponent extends BaseComponent implements OnInit {
  @Input() overviewType: string;
  @Input() isStandard: boolean;
  @Input() isNewCustomCourse: boolean;
  @Input() unitInfo: Unit;
  @Input() classInfo: ClassSummary;
  @Input() isListView = false;
  @Input() classStatus: ClassStatus;
  @Output() unitOverviewReady: EventEmitter<UnitInfo> = new EventEmitter<UnitInfo>();

  public isCourse: boolean;
  public isUnit: boolean;
  public overviewDescription: string;
  public classId: number;
  public isAiu: boolean;
  public unitOverview: UnitInfo;
  public overviewName: string;
  public unitInfoName: string;
  public learningActivityName: string;
  public unitHasObjectives: boolean;

  constructor(private globalConfigs: GlobalConfigsService, private unitService: UnitService) {
    super();

    this.isAiu = globalConfigs.themeId === ThemeId.AIU;
  }

  public ngOnInit() {
    this.loadData();
  }

  private loadData() {
    if (this.overviewType.toUpperCase() === ClassroomOverviewType.COURSE) {
      this.isCourse = true;
      if (this.classInfo) {
        this.classId = this.classInfo.ClassId;
      }

      if (this.classInfo && this.classInfo.StudentSpecific) {
        this.overviewDescription =
          this.classInfo.StudentSpecific.CourseOverview || this.classInfo.StudentSpecific.CourseDescription;
      }
    } else if (this.overviewType.toUpperCase() === ClassroomOverviewType.UNIT) {
      this.isUnit = true;

      if (this.unitInfo) {
        this.classId = this.unitInfo.ClassId;
        this.getUnitOverview(this.unitInfo);
      }
    }

    if (this.globalConfigs.themeId === ThemeId.CTU) {
      this.overviewName = 'OVERVIEW';
      this.unitInfoName = 'INFO';
      this.learningActivityName = 'LEARNING ACTIVITIES';
    } else {
      this.overviewName = 'INTRODUCTION';
      this.unitInfoName = 'INTRO';
      this.learningActivityName = 'LEARNING MATERIALS';
    }
  }

  private getUnitOverview(unit: Unit) {
    if (!unit || !unit.UnitNumber) return;

    this.unitService
      .unitInfo(this.classId, +unit.UnitNumber)
      .pipe(first())
      .subscribe((overview) => {
        this.unitOverview = overview;
        this.overviewDescription = overview.UnitDescription || overview.UnitIntroduction;
        this.unitOverviewReady.emit(overview);
      });

    this.unitService
      .unitObjectives(this.classId, +unit.UnitNumber)
      .pipe(first())
      .subscribe((unitObjectives) => {
        this.unitHasObjectives = !!unitObjectives;
      });
  }
}

export enum ClassroomOverviewType {
  COURSE = 'COURSE',
  UNIT = 'UNIT',
}

export enum TemplateType {
  Original = 1,
  Granular = 2,
  Grouped = 3,
}
