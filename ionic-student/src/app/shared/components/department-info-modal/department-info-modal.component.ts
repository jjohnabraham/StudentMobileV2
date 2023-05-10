import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ContactInfo } from 'src/app/data/types/contact.type';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import { ThemeId } from '../../enums/theme-id.enum';

@Component({
  selector: 'pec-department-info-modal',
  templateUrl: './department-info-modal.component.html',
  styleUrls: ['./department-info-modal.component.scss'],
})
export class DepartmentInfoModalComponent implements OnInit {
  @Input() contactInfo: ContactInfo;

  public oHrs: any = [];
  public dayTimes: DayTimes[] = [];
  public is247 = false;
  public defaultImage: string;
  public message = '';
  public timeZone = '';

  constructor(public globalConfigService: GlobalConfigsService, private modalController: ModalController) {}

  ngOnInit() {
    this.loadData();
  }

  public dissmissModal() {
    this.modalController.dismiss();
  }

  private loadData() {
    this.defaultImage = `${
      this.globalConfigService.contentUrl
    }assets/${this.globalConfigService.brandName.toLowerCase()}/images/school-logo-icon.png`;
    if (this.contactInfo) {
      this.oHrs = this.contactInfo.OperationsHours;
      const p = 0;

      for (let i = 0; i < this.oHrs.length; i++) {
        const hArray1: any = [];
        const hArray2: any = [];
        let dayTwo: any;

        if (this.dayTimes.length > 0 && i <= this.oHrs.length) {
          i = this.dayTimes.reduce((sum, current) => sum + current.I, 0);
        }

        if (hArray1.length === 0 && i < this.oHrs.length) {
          hArray1.push(this.oHrs[i]);
        }

        for (let l = i; l < this.oHrs.length; l++) {
          if (hArray1[0].Start === this.oHrs[l].Start && hArray1[0].End === this.oHrs[l].End) {
            hArray2.push(this.oHrs[l]);
          } else {
            hArray1.push(this.oHrs[l]);
          }
        }

        if (hArray2.length > 0) {
          if (hArray1[0].Day === hArray2[0].Day) {
            dayTwo =
              hArray2[hArray2.length - 1].Day != null && hArray1[0].Day !== hArray2[hArray2.length - 1].Day
                ? hArray2[hArray2.length - 1].Day
                : null;
          } else if (hArray1[0].Day === hArray2[hArray2.length - 1]) {
            dayTwo = null;
          } else {
            dayTwo = hArray2[hArray2.length - 1].Day;
          }
        } else {
          dayTwo = null;
        }

        if (i < this.oHrs.length) {
          this.dayTimes.push({
            Dayone: hArray1[0].Day,
            Start: hArray1[0].Start,
            End: hArray1[0].End,
            Daytwo: dayTwo,
            I: hArray2.length,
          });
        }
      }
      if (this.contactInfo.Department === 'Learning Services' && this.globalConfigService.themeId === ThemeId.CTU) {
        this.message = 'Your point of contact for learning centers, Smarthinking tutoring clubs, and organizations.';
      }
      if (this.globalConfigService.themeId === ThemeId.CTU) {
        this.timeZone = 'CT';
      }
    }
  }
}

export interface DayTimes {
  Dayone: string;
  Start: string;
  End: string;
  Daytwo?: string;
  I?: number;
}
