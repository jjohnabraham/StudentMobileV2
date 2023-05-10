import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewDidEnter } from '@ionic/angular';
import { UnitInfo, UnitObjective, UnitObjectives, UnitSteps } from '../../../../data/types/unit.type';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { BasePageComponent } from '../../../../shared/components/base-page-component/base-page.component';
import { UnitService } from '../../../../data/services/unit.service';
import { first } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { ClassAssignment } from '../../../../data/types/assignment.type';
import { ThemeId } from '../../../../shared/enums/theme-id.enum';

@Component({
  selector: 'pec-unit-info',
  templateUrl: './unit-info.component.html',
  styleUrls: ['./unit-info.component.scss'],
})
export class UnitInfoComponent extends BasePageComponent implements ViewDidEnter {
  public unitInfoView: boolean;
  public currentUnitInfo: UnitInfo;
  public unitObjectivesView: boolean;
  public unitStepsView: boolean;
  public pageTitle: string;
  public unitObjectives: UnitObjective[];
  public learningActivities: UnitSteps;
  public unitNumber: string;
  public assignment: ClassAssignment;
  public classId: number;
  public isStandard: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private globalConfigs: GlobalConfigsService,
    private unitService: UnitService,
    private sanitizer: DomSanitizer
  ) {
    super();

    const state = router.getCurrentNavigation().extras.state;

    this.classId = this.activatedRoute.snapshot.params.classId;
    this.unitInfoView = state.unitInfoView;
    this.unitObjectivesView = state.unitObjectivesView;
    this.unitStepsView = state.unitStepsView;
    this.currentUnitInfo = state.currentUnitInfo;
    this.isStandard = state.isStandard;
    this.assignment = state.assignment;

    if (this.currentUnitInfo) {
      this.unitNumber = this.currentUnitInfo.UnitNumber;
    } else {
      this.unitNumber = this.activatedRoute.snapshot.params.unitId;
    }

    this.createPageTitle();
  }

  public ionViewDidEnter() {
    this.loadData();
  }

  private loadData() {
    if (!this.currentUnitInfo) {
      this.unitService
        .unitInfo(this.classId, +this.unitNumber)
        .pipe(first())
        .subscribe((unitInfo) => {
          this.currentUnitInfo = unitInfo;
        });
    }

    if (this.unitObjectivesView) {
      this.unitService
        .unitObjectives(this.classId, +this.unitNumber)
        .pipe(first())
        .subscribe((unitObjectives) => {
          this.unitObjectives = this.filterDuplicates(unitObjectives);
        });
    }

    if (this.unitStepsView) {
      this.unitService
        .steps(this.classId, +this.unitNumber)
        .pipe(first())
        .subscribe((learningActivities) => {
          this.learningActivities = this.getLearningActivities(learningActivities);
        });
    }
  }

  private filterDuplicates(itemList: UnitObjectives[]) {
    const objectivesList: string[] = [];

    const result: UnitObjective[] = [];

    if (itemList) {
      for (const item of itemList) {
        for (const item1 of item.ObjectiveList) {
          const haveDuplicates = objectivesList.toString().indexOf(item1.ObjectiveTitle);
          if (haveDuplicates === -1) {
            objectivesList.push(item1.ObjectiveTitle);
            result.push(item1);
          }
        }
      }
    }
    return result;
  }

  private getLearningActivities(itemList: UnitSteps[]) {
    if (itemList) {
      for (const item of itemList) {
        if (item.Step.DerivedShortTitle === '2') {
          if (item.SubSteps) {
            for (const item1 of item.SubSteps) {
              item1.Html = this.sanitizer.bypassSecurityTrustHtml(item1.Body);
            }
          }

          return item;
        }
      }
    }
  }

  private createPageTitle() {
    if (this.unitInfoView) {
      if (this.globalConfigs.themeId === ThemeId.CTU) {
        this.pageTitle = 'Unit Info';
      } else {
        this.pageTitle = 'Unit Intro';
      }
    } else if (this.unitObjectivesView) {
      this.pageTitle = 'Unit Objectives';
    } else if (this.unitStepsView) {
      if (this.learningActivities?.Step?.ShortTitle) {
        this.pageTitle = this.learningActivities.Step.ShortTitle;
      } else if (!this.learningActivities) {
        this.pageTitle = this.globalConfigs.themeId === ThemeId.CTU ? 'Learning Activities' : 'Learning Materials';
      }
    }
  }
}
