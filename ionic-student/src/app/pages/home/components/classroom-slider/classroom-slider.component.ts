import { Component, Input, Output, ViewChild, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../../../../shared/components/base-component/base.component';
import { ClassInfo, ClassStatus, ClassSummary } from '../../../../data/types/class.type';
import { Unit, UnitInfo } from '../../../../data/types/unit.type';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { ThemeId } from '../../../../shared/enums/theme-id.enum';
import { IonItemSliding, IonList, IonSlides } from '@ionic/angular';
import { ZoomConcludedChats } from '../../../../data/types/meeting.type';
import { UnitInfoComponent } from '../unit-info/unit-info.component';

@Component({
  selector: 'pec-classroom-slider',
  templateUrl: './classroom-slider.component.html',
  styleUrls: ['./classroom-slider.component.scss'],
})
export class ClassroomSliderComponent extends BaseComponent implements AfterViewInit {
  @Input() classId: number;
  @Input() isAccelerated: boolean;
  @Input() isOrientation: boolean;
  @Input() isStandardClass: boolean;
  @Input() isPilotedCourse: boolean;
  @Input() showOverview: boolean;
  @Input() visitedCourseOverview = false;
  @Input() classStatus: ClassStatus;
  @Input() unitsInfo: Unit[];
  @Input() classSummary: ClassSummary;
  @Input() classInfo: ClassInfo;
  @Input() assignmentList: [];
  @Input() zoomConcludedChatList: ZoomConcludedChats;
  @Input() isNewCustomCourse = false;
  @Output() visitedCourseOverviewChanged = new EventEmitter<boolean>();
  @Output() apiError = new EventEmitter<void>();

  @ViewChild(IonSlides) slides: IonSlides;
  @ViewChild('assignmentsList') assignmentsList: IonList;

  public overviewName: string;
  public isCTU: boolean;
  public hideSlides = true;
  public displayCourseOverview = false;
  public currentUnitInfo: UnitInfo;
  public slidesOptions = {
    effect: 'slide',
    loop: true,
    speed: 500,
    spaceBetween: 25,
    slidesPerView: 1,
    noSwipingClass: 'swiper-no-swiping',
    autoHeight: true,
  };

  private sliding = false;
  private slideIndex = 0;
  private slideCount = 0;
  private sliderInitialized = false;

  constructor(private globalConfigs: GlobalConfigsService, private cdr: ChangeDetectorRef) {
    super();

    this.isCTU = this.globalConfigs.themeId === ThemeId.CTU;
  }

  public ngAfterViewInit() {
    this.initSlides();

    if (this.globalConfigs.themeId === ThemeId.CTU) {
      this.overviewName = 'OVERVIEW';
    } else {
      this.overviewName = 'INTRODUCTION';
    }
  }

  public goToPrevSlide() {
    if (this.sliding) return;

    this.slideIndex--;
    if (this.slideIndex < 0) {
      this.slideIndex = this.slideCount - 1;
    }

    this.clickToSlide(() => {
      this.slides.slidePrev();
    });
  }

  public goToNextSlide() {
    if (this.sliding) return;

    this.slideIndex++;
    if (this.slideIndex >= this.slideCount) {
      this.slideIndex = 0;
    }

    this.clickToSlide(() => {
      this.slides.slideNext();
    });
  }

  public ionSlideDidChange() {
    this.sliding = false;

    // somehow it fixes #250220
    this.slides.slideTo(this.slideIndex + 1, 0);
  }

  public ionSlideWillChange() {
    this.setHeader();
  }

  public onAssignmentsReady($event: { hasAssignments: boolean; isSubmissionPilot: boolean }, unit: Unit) {
    unit.HasAssignments = $event.hasAssignments;
    unit.IsSubmissionsPilot = $event.isSubmissionPilot;
  }

  public onUnitOverviewReady($event: UnitInfo, unit: Unit) {
    unit.UnitOverview = $event;
    this.setHeader();
  }

  public onError() {
    this.apiError.emit();
  }

  private clickToSlide(callback) {
    this.sliding = true;
    this.assignmentsList.closeSlidingItems();

    if (callback) callback();
  }

  private initSlides() {
    if (this.sliderInitialized) {
      return;
    }

    if (this.slides) {
      this.sliderInitialized = true;

      let unitSlideDefaultIndex = -1;

      this.slideCount = this.unitsInfo.length + (this.showOverview ? 1 : 0);

      if (
        this.showOverview &&
        (!this.visitedCourseOverview ||
          (this.classInfo && this.classInfo.StartDate > new Date()) ||
          (this.classSummary && this.classSummary.StartDate > new Date())) &&
        !this.globalConfigs.isImpersonatedUser
      ) {
        this.visitedCourseOverviewChanged.emit(true);
        this.slideIndex = 0;
        this.hideSlides = false;
      } else {
        unitSlideDefaultIndex = this.unitsInfo.findIndex((o) => {
          return o.IsCurrent;
        });

        this.slides.getSwiper().then(() => {
          if (unitSlideDefaultIndex > -1) {
            this.slideIndex = unitSlideDefaultIndex + (this.showOverview ? 1 : 0);

            this.slides.slideTo(this.slideIndex + 1, 0).then(() => {
              this.setHeader();
              this.hideSlides = false;
            });
          } else {
            this.hideSlides = false;
          }

          setTimeout(() => {
            this.slides.updateAutoHeight();
          }, 1500);
        });
      }
    }
  }

  private setHeader() {
    this.displayCourseOverview = false;

    if (this.showOverview && this.slideIndex === 0) {
      this.displayCourseOverview = true;
    } else {
      const units = this.unitsInfo[this.slideIndex - (this.showOverview ? 1 : 0)];
      if (units && (this.unitsInfo.length === 1 || !units.UnitOverview)) {
        this.currentUnitInfo = {
          ClassId: units.ClassId,
          LmsTopicId: units.LmsTopicId,
          UnitNumber: units.UnitNumber,
          UnitTitle: units.UnitTitle,
          StartDate: units.StartDate,
          EndDate: units.EndDate,
          UnitDescription: units.UnitTitle,
          UnitIntroduction: units.UnitTitle,
        };
      } else if (units && units.UnitOverview) {
        this.currentUnitInfo = units.UnitOverview;
      }
    }

    this.cdr.markForCheck();

    this.slides.updateAutoHeight();
  }
}
