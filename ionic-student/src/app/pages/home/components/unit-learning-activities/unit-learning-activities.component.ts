import { Component, Input, OnInit } from '@angular/core';
import { BasePageComponent } from '../../../../shared/components/base-page-component/base-page.component';
import {
  AssignmentDetails,
  AssignmentSummary,
  ClassAssignment,
  CourseBook,
} from '../../../../data/types/assignment.type';
import { UnitInfo, UnitLearningMaterials } from '../../../../data/types/unit.type';
import { UnitService } from '../../../../data/services/unit.service';
import { AssignmentService } from '../../../../data/services/assignment.service';
import { MobileService } from '../../../../data/services/mobile.service';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { ThemeId } from '../../../../shared/enums/theme-id.enum';
import { first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'pec-unit-learning-activities',
  templateUrl: './unit-learning-activities.component.html',
  styleUrls: ['./unit-learning-activities.component.scss'],
})
export class UnitLearningActivitiesComponent extends BasePageComponent implements OnInit {
  public isStandard: boolean;
  public unitLearningActivitiesView: boolean;
  public groundLearningActivitiesView: boolean;
  public classId: number;
  public unitNumber: number;
  public assignment: ClassAssignment;
  public currentUnitInfo: UnitInfo;

  public lrnActUnitType: string;
  public showLoading: boolean;
  public showError: boolean;
  public unitLearningMaterial: UnitLearningMaterials[];
  public bookshelf: CourseBook[];
  public uniquePMIArray: string[];
  public ebookMessage: string;
  public readingMaterial: AssignmentSummary[];
  public hasLrnAct: boolean;
  public isCtu: boolean;
  public readingAssignment: ClassAssignment[];

  private material: UnitLearningMaterials[];
  private assignmentOverview: AssignmentDetails;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private unitService: UnitService,
    private assignmentService: AssignmentService,
    private mobileService: MobileService,
    private globalConfigs: GlobalConfigsService
  ) {
    super();
    const state = router.getCurrentNavigation().extras.state;

    this.classId = +this.activatedRoute.snapshot.params.classId;
    this.groundLearningActivitiesView = state.groundLearningActivitiesView;
    this.unitLearningActivitiesView = state.unitLearningActivitiesView;
    this.currentUnitInfo = state.currentUnitInfo;
    this.isStandard = state.isStandard;
    this.assignment = state.assignment;
    this.unitNumber = +state.unitNumber;

    this.isCtu = globalConfigs.themeId === ThemeId.CTU;
  }

  public ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.showLoading = true;

    if (this.isStandard) {
      this.lrnActUnitType = 'unit';
    } else {
      this.lrnActUnitType = 'assignment';
    }

    if (this.unitLearningActivitiesView) {
      this.getUnitInfo();
      this.getAssignments();
      this.getUnitMaterial();
    }

    if (this.groundLearningActivitiesView) {
      this.getAssignmentMaterial();
    }

    this.getReading().then(() => {
      if (this.groundLearningActivitiesView && this.assignment?.AssignmentId) {
        this.assignmentService
          .assignmentOverview(this.classId, this.assignment.AssignmentId)
          .pipe(first())
          .subscribe(
            (assignmentOverview) => {
              this.assignmentOverview = assignmentOverview;
            },
            () => {
              this.showError = true;
              this.showLoading = false;
            }
          );
      }

      this.showLoading = false;
    });
  }

  private clearLoading() {
    if (this.unitLearningActivitiesView && this.currentUnitInfo) {
      this.showLoading = false;
    }

    if (this.groundLearningActivitiesView && this.assignment) {
      this.showLoading = false;
    }
  }

  private getUnitMaterial() {
    this.unitService
      .unitLearningMaterials(this.classId)
      .pipe(first())
      .subscribe(
        (material) => {
          this.material = material;
          this.addMaterialUrls(this.classId);

          let j = 0;
          this.unitLearningMaterial = [];
          this.material.forEach((item) => {
            if (+item.UnitNumber === this.unitNumber) {
              this.unitLearningMaterial[j] = item;

              j++;
            }
          });

          this.getBookshelf();
        },
        () => {
          this.showError = true;
          this.showLoading = false;
        }
      );
  }

  private getAssignments() {
    if (this.unitNumber) {
      this.assignmentService
        .listWithDescription(this.classId)
        .pipe(first())
        .subscribe(
          (assignmentOverview) => {
            this.filterAssignment(assignmentOverview.AssignmentDetails);
          },
          () => {
            this.showError = true;
            this.showLoading = false;
          }
        );
    }
  }

  private getUnitInfo() {
    if (!this.currentUnitInfo && this.unitNumber) {
      this.unitService.unitInfo(this.classId, this.unitNumber).subscribe((unitInfo) => {
        this.currentUnitInfo = unitInfo;

        this.clearLoading();
      });
    }
  }

  private getAssignmentMaterial() {
    this.unitService
      .learningMaterials(this.classId)
      .pipe(first())
      .subscribe(
        (material) => {
          this.material = material;
          this.addMaterialUrls(this.classId);

          let j = 0;
          this.unitLearningMaterial = [];
          for (const item of this.material) {
            if (+item.UnitNumber === this.unitNumber && item.AssignmentId === this.assignment?.AssignmentId) {
              this.unitLearningMaterial[j] = item;
              j++;
            }
          }

          this.getBookshelf();
        },
        () => {
          this.showError = true;
          this.showLoading = false;
        }
      );
  }

  private addMaterialUrls(classId: number) {
    if (this.material) {
      this.material.forEach((element) => {
        element.Url = `{{lmsUrl}}/lms/class/${classId}/document/${element.DocumentID}/open?slt={{token}}`;
      });
    }
  }

  private getBookshelf() {
    this.assignmentService
      .bookshelf(this.classId)
      .pipe(first())
      .subscribe(
        (bookshelf) => {
          this.bookshelf = bookshelf;

          this.filterBooks();

          if (this.bookshelf.length > 0) {
            this.addBookUrls();
            this.bookshelf.sort(this.alphaTitleCompare);
            this.getUniquePMIContent();
            this.getEBookMessage();
          } else {
            this.bookshelf = null;
          }

          if (!this.bookshelf && !this.unitLearningMaterial) {
            this.hasLrnAct = false;
          } else if (this.bookshelf || this.unitLearningMaterial) {
            this.hasLrnAct =
              (this.bookshelf && this.bookshelf.length > 0) ||
              (this.unitLearningMaterial && this.unitLearningMaterial.length > 0);
          }

          this.clearLoading();
        },
        () => {
          this.showError = true;
          this.showLoading = false;
        }
      );
  }

  private filterBooks() {
    if (this.bookshelf) {
      this.bookshelf = this.bookshelf.filter((element) => +element.ClassId === this.classId);
    }
  }

  private addBookUrls() {
    if (this.bookshelf) {
      this.bookshelf.forEach((element) => {
        element.Url = `{{lmsUrl}}/material/ebook/${element.ISBN}?slt={{token}}`;
      });
    }
  }

  private alphaTitleCompare(a, b) {
    if (a.Title < b.Title) return -1;
    if (a.Title > b.Title) return 1;
    return 0;
  }

  private getUniquePMIContent() {
    const a: string[] = [];

    let i = 0;
    this.bookshelf.forEach((elem) => {
      if (elem.BooksAndGuideText != null && elem.BooksAndGuideText.trim() !== '') {
        a[i] = elem.BooksAndGuideText;
        i++;
      }
    });

    this.uniquePMIArray = a.filter((value, index) => a.indexOf(value) === index);
  }

  private getEBookMessage() {
    const hasEBook = this.bookshelf.find(
      (a) => a.MaterialType === 'e-Book - BVD' || a.MaterialType === 'e-Book - VitalSource'
    );

    if (hasEBook) {
      this.mobileService
        .campusSettings()
        .pipe(first())
        .subscribe((o) => {
          this.ebookMessage = o.Settings.EbookMessage;
        });
    }
  }

  private getReading() {
    return new Promise<boolean>((resolve, reject) => {
      this.assignmentService
        .summaryList(this.classId)
        .pipe(first())
        .subscribe(
          (readingMaterial) => {
            this.readingMaterial = readingMaterial;

            if (this.groundLearningActivitiesView) {
              this.filterReadingMaterialsByAssignment(this.assignment?.AssignmentId);
            }

            if (this.unitLearningActivitiesView) {
              this.filterReadingMaterialsByUnit();
            }

            resolve(true);
          },
          () => {
            this.showError = true;
            this.showLoading = false;
          }
        );
    });
  }

  private filterReadingMaterialsByAssignment(assignmentId: number) {
    if (this.readingMaterial) {
      this.readingMaterial = this.readingMaterial.filter((element) => element.AssignmentId === assignmentId);
    }
  }

  private filterReadingMaterialsByUnit() {
    if (this.readingMaterial) {
      this.readingMaterial = this.readingMaterial.filter(
        (element) => +element.UnitNumber === this.unitNumber && element.AssignmentTypeName === 'Discussion Board'
      );
    }
  }

  private filterAssignment(assignments: ClassAssignment[]) {
    if (assignments) {
      this.readingAssignment = assignments.filter((element) => +element.UnitNumber === this.unitNumber);
    }
  }
}
