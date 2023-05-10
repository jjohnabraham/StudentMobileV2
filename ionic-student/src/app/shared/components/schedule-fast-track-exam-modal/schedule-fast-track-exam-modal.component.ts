import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavController, NavParams, ModalController } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { EnrollmentService } from 'src/app/data/services/enrollment.service';
import { FastTrackInfo, NextAvailableDate } from 'src/app/data/types/enrollment.type';
import { PecDatePipe } from 'src/app/shared/pipes/date.pipe';
import { PecLoaderService } from 'src/app/shared/services/pec-loader.service';
import { TrackingService } from 'src/app/shared/services/tracking.service';

@Component({
  selector: 'pec-schedule-fast-track-exam-modal',
  templateUrl: './schedule-fast-track-exam-modal.component.html',
  styleUrls: ['./schedule-fast-track-exam-modal.component.scss'],
})
export class ScheduleFastTrackExamModalComponent implements OnInit, OnDestroy {
  @Input() syStudentId: number;
  @Input() ssid: number;
  @Input() syCampusId: number;
  @Input() termCode: string;
  @Input() courseCode: string;
  @Input() dateResponse: FastTrackInfo;
  @Input() selectedDate: NextAvailableDate;
  @Input() showError = false;

  availableDates: NextAvailableDate[];
  showLoading = false;
  showNoDatesMessage = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private trackingService: TrackingService,
    private enrollmentService: EnrollmentService,
    private loadingCtrl: PecLoaderService,
    private datePipe: PecDatePipe,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.loadingCtrl.dismiss();
  }

  public dissmissModal(data: any = null) {
    this.modalController.dismiss(data);
  }

  onDateSelectionChanged(item) {
    this.selectedDate = item;
  }

  reloadDates() {
    this.onSchedulingDateDone(null, true);
  }

  scheduleNow() {
    this.onSchedulingDates();
    const request = {
      syStudentId: this.syStudentId,
      ssid: this.ssid,
      syCampusId: this.syCampusId,
      termCode: this.termCode,
      courseCode: this.courseCode,
      AdCourseId: this.selectedDate.FTCourseId,
      AdTermId: this.selectedDate.FTTermId,
      SourcePlatform: 0,
    };

    this.enrollmentService
      .scheduleFastTrack(request)
      .pipe(first())
      .subscribe(
        (result) => {
          this.onSchedulingDateDone(result);
        },
        (error) => {
          this.onSchedulingDateDone(null);
        }
      );
  }

  private loadData() {
    this.showLoading = true;
    if (this.dateResponse) {
      this.showLoading = false;
      this.showError = false;
      if (this.dateResponse.ResultCode === 7) {
        this.availableDates = [];
        this.selectedDate = null;
        this.showNoDatesMessage = true;
      } else if (this.dateResponse.NextAvailableDates == null || this.dateResponse.NextAvailableDates.length === 0) {
        this.availableDates = [];
        this.selectedDate = null;
        this.showError = true;
      } else {
        this.showError = false;
        this.availableDates = this.dateResponse.NextAvailableDates;
        if (this.selectedDate) {
          this.selectedDate = this.availableDates.filter((a) => a.FTTermId === this.selectedDate.FTTermId)[0];
        } else if (!this.selectedDate) {
          if (this.checkForAvailableDates() === true) {
            this.showNoDatesMessage = true;
          } else {
            for (const dateItem of this.availableDates) {
              if (dateItem.FTTermId !== -1) {
                this.selectedDate = dateItem;
                break;
              }
            }
          }
        }
      }
      if (this.showNoDatesMessage) {
        this.trackingService.trackEvent({
          view: 'Degree Plan View',
          category: 'Degree Plan View',
          action: 'Tapped FastTrack Icon',
          label: 'Already has 2 exams scheduled in all available terms',
          value: '',
        });
      }
    } else {
      this.showError = true;
      this.showLoading = false;
      this.availableDates = [];
    }
  }

  private onSchedulingDates() {
    this.loadingCtrl.show('Please wait...');
  }

  private onSchedulingDateDone(result: any, retry: boolean = false) {
    this.loadingCtrl.dismiss();

    if (result && (result.ResultCode === 1 || result.ResultCode === 8)) {
      this.datePipe
        .transform(result.Message, 'MMMM d, yyyy')
        .pipe(first())
        .subscribe((date) => {
          const data = {
            selectedDate: this.selectedDate,
            params: date,
            code: result ? result.ResultCode : null,
            retry,
          };
          this.dissmissModal(data);
        });
    } else {
      const data = { selectedDate: this.selectedDate, params: null, code: result ? result.ResultCode : null, retry };
      this.dissmissModal(data);
    }
  }

  private checkForAvailableDates(): boolean {
    for (const dateItem of this.availableDates) {
      if (dateItem.FTTermId !== -1) {
        return false;
      }
    }
    return true;
  }
}
