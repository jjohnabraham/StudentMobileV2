import { Component, Input, OnInit } from '@angular/core';
import { GlobalConfigsService } from '../../services/global-configs.service';
import { ThemeId } from '../../enums/theme-id.enum';

@Component({
  selector: 'pec-school-info',
  templateUrl: './school-info.component.html',
  styleUrls: ['./school-info.component.scss'],
})
export class SchoolInfoComponent implements OnInit {
  @Input() info: SchoolInfo;

  public schoolData: string;

  constructor(private globalConfigs: GlobalConfigsService) {}

  ngOnInit() {
    switch (this.info) {
      case 'themeId': {
        this.schoolData = this.globalConfigs.themeId.toString();
        break;
      }
      case 'brand': {
        this.schoolData = this.globalConfigs.brandName;
        break;
      }
      case 'fullName': {
        this.schoolData =
          this.globalConfigs.themeId === ThemeId.CTU
            ? 'Colorado Technical University'
            : 'American InterContinental University';
        break;
      }
      default: {
        this.schoolData = this.globalConfigs.brandName;
        break;
      }
    }
  }
}

export type SchoolInfo = 'themeId' | 'brand' | 'fullName';
