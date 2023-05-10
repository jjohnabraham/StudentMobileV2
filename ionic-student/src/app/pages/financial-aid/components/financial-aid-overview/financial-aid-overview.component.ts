import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { TrackingService } from 'src/app/shared/services/tracking.service';

@Component({
  selector: 'pec-financial-aid-overview',
  templateUrl: './financial-aid-overview.component.html',
  styleUrls: ['./financial-aid-overview.component.scss'],
})
export class FinancialAidOverviewComponent extends BaseComponent implements AfterViewInit {
  @Input() faStatuses: any;
  @Input() displayOrder: number;
  @Input() isPackagedMessage: string;
  @ViewChild(IonSlides) slides: IonSlides;

  public visibleState = true;
  public sliderInitialized = false;
  public initialLoad = true;
  public lockSlides = false;
  public hideSlides: boolean;

  public slideTitle: any = [];
  public faStatusTitle: string;

  constructor(private trackingService: TrackingService) {
    super();
    this.hideSlides = true;
  }

  public ngAfterViewInit() {
    this.loadData();
  }

  public getSlideInfo() {
    for (const faStatusItem of this.faStatuses) {
      const startDateYear = new Date(faStatusItem.AcademicYearStartDate).getFullYear() % 100;
      const endDateYear = new Date(faStatusItem.AcademicYearEndDate).getFullYear() % 100;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const startDateMonth = months[new Date(faStatusItem.AcademicYearStartDate).getMonth()];
      const endDateMonth = months[new Date(faStatusItem.AcademicYearEndDate).getMonth()];
      this.faStatusTitle =
        'Academic Year: ' +
        startDateMonth +
        ' ' +
        "'" +
        startDateYear +
        ' -  ' +
        endDateMonth +
        ' ' +
        "'" +
        endDateYear;
      faStatusItem.Title = this.faStatusTitle;
    }
  }

  public slideChanged() {
    this.trackingService.trackEvent({
      view: 'Financial Aid View',
      category: 'Financial Aid View',
      action: 'Swiped to Change Academic Year',
      label: '',
      value: '',
    });
  }

  public ionSlideWillChange() {
    if (!this.sliderInitialized) {
      this.hideSlides = true;
      this.sliderInitialized = true;
      this.watchUnitsInfoLength();

      setTimeout(() => {
        this.slides.update();
        this.hideSlides = false;
      }, 10);
    } else {
      this.slides.update();
    }
  }

  public reload() {
    this.loadData();
  }

  private initSlides() {
    if (this.sliderInitialized) {
      return;
    }

    if (this.slides && this.faStatuses.length) {
      this.hideSlides = true;
      this.sliderInitialized = true;

      if (this.faStatuses) {
        if (this.faStatuses.length <= 1) {
          setTimeout(() => {
            this.lockSlides = true;
          }, 0);
        }
      }
    }
  }

  private loadData() {
    if (!this.slides) {
      this.initSlides();
    }
    this.watchUnitsInfoLength();
    this.getSlideInfo();
  }

  private watchUnitsInfoLength(): any {
    if (!this.slides && this.slides.length() < this.faStatuses.length) {
      return setTimeout(() => {
        return this.watchUnitsInfoLength();
      }, 50);
    } else {
      return setTimeout(() => {
        if (this.displayOrder > -1) {
          this.slides.slideTo(this.displayOrder, 0);
          this.slides.update();

          setTimeout(() => {
            this.hideSlides = false;
          }, 150);
        }
      }, 50);
    }
  }
}
