import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { GlobalConfigsService } from '../../services/global-configs.service';
import { PhoneLinkPipe } from '../../pipes/phone-link.pipe';
import { ThemeId } from '../../enums/theme-id.enum';
import { EmailComposerService } from '../../services/email-composer.service';
import { CrashlyticsService } from '../../services/crashlytics.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'pec-error-api',
  templateUrl: './error-api.component.html',
  styleUrls: ['./error-api.component.scss'],
  providers: [PhoneLinkPipe],
})
export class ErrorApiComponent implements OnInit {
  @Input() errCode: string;
  @Input() errorDetails: any;

  public errHeaderImg: string;
  public errHeaderImgAlt: string;
  public errTitle: string;
  public errMessage: string;
  public errTrackingViewName: string;

  private supportPhone: string;
  private prevUrl: string;

  constructor(
    private globalConfigs: GlobalConfigsService,
    private pecPhoneLink: PhoneLinkPipe,
    private emailComposer: EmailComposerService,
    private crashlyticsService: CrashlyticsService,
    private readonly router: Router
  ) {

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(x => this.prevUrl = JSON.stringify(x));
  }

  public ngOnInit() {
    this.loadData();
  }

  public reloadPage() {
    window.location.reload();
  }

  public emailComposerCall() {
    this.emailComposer.composeErrorReport(null, this.errCode, JSON.stringify(this.errorDetails));
  }

  private setContent() {
    this.setErrHeaderImg();
    this.errTrackingViewName = 'Connectivity Error View';
    this.errTitle = 'Sorry!';
    this.errMessage =
      "We're having technical difficulties. Please try again later. If this problem persists, please contact tech support at " +
      this.pecPhoneLink.transform(this.supportPhone);

    if (this.errCode) {
      this.crashlyticsService.logError('In-page API Error: ' + this.errCode, this.router.url, this.prevUrl);
    }
  }

  private setErrHeaderImg() {
    this.errHeaderImg =
      this.globalConfigs.themeId === ThemeId.CTU ? 'pec-icon-ctu-logo-horizontal' : 'pec-icon-aiu-logo-compact';
    this.errHeaderImgAlt =
      this.globalConfigs.themeId === ThemeId.CTU
        ? 'Colorado Technical University&reg;'
        : 'American Intercontinental University&trade;';
  }

  private loadData() {
    // getting tech support from globalconfigs instead of API
    this.supportPhone = this.globalConfigs.getTechSupportNumber(false);
    this.setContent();
    /*this.schoolService
      .techSupportContact()
      .pipe(first())
      .subscribe((techSupportContact) => {
        this.supportPhone = techSupportContact.Phone;
        this.setContent();
      });*/
  }
}
