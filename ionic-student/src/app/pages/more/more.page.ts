import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/data/services/auth.service';
import { MobileService } from 'src/app/data/services/mobile.service';
import { Settings } from 'src/app/data/types/mobile-settings.type';
import { BasePageComponent } from 'src/app/shared/components/base-page-component/base-page.component';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import { GaEvent } from 'src/app/shared/services/tracking.service';

@Component({
  selector: 'pec-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
})
export class MorePage extends BasePageComponent {
  showLoading = false;
  campusId: number;
  isOnlineCampus = false;
  showGraduateFile = false;
  schoolSelector: string;
  beyondClassRoomOptions: MoreOptionItem[] = [];
  settingOptions: MoreOptionItem[];

  private emailAddress: string;
  private emailString: string;
  private campusSettings: Settings;
  private getSetUrl: string;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private authService: AuthService,
    public globalConfigs: GlobalConfigsService,
    private mobileService: MobileService
  ) {
    super();
    this.campusId = this.globalConfigs.sycampusid;
    this.isOnlineCampus = this.campusId === 5 || this.campusId === 6;
    this.schoolSelector = this.globalConfigs.brandName;
  }
  public get brandName() {
    return this.globalConfigs.brandName;
  }

  public logout() {
    this.navCtrl.setDirection('root');
    this.router.navigate(['/login'], {
      replaceUrl: true,
      queryParams: { isSignOutClicked: true },
    });
  }

  public openDefaultEmailClient() {
    this.globalConfigs.openUrlOutOfApp(this.emailString);
  }

  protected beginLoadData() {
    this.showLoading = true;
    this.mobileService
      .campusSettings()
      .pipe(first())
      .subscribe(
        (settings) => {
          if (settings && settings.Settings) {
            this.campusSettings = settings.Settings;
            this.getSetUrl =
              `{{lmsUrl}}signon/${this.globalConfigs.ssid}/${this.globalConfigs.sycampusid}/sso?slt={{token}}&returnUrl=` +
              this.campusSettings.GetSetLink;
            this.emailAddress = this.campusSettings['Feedback e-mail address'];
            this.emailString = 'mailto:' + this.emailAddress + '?subject=Feedback for Student Mobile App';
            this.showGraduateFile = this.campusSettings.ShowGradFile && this.campusSettings.ShowGradFile === 'true';
            this.loadMenuOptions();
            this.showLoading = false;
          }
        },
        (error) => {
          this.showLoading = false;
        }
      );
  }

  private loadMenuOptions() {
    this.beyondClassRoomOptions = [];
    if (this.schoolSelector !== 'CTU' && this.isOnlineCampus) {
      this.beyondClassRoomOptions.push({
        title: 'AIU Learning Center',
        pecUrlRedirect: true,
        pecOpenIn: 'browser',
        pecUrl: 'https://careered.libguides.com/AIUOLC',
        pecTrackEvent: { category: 'Menu', action: 'Tapped Success Center', label: '' },
      });
    }
    if (this.schoolSelector === 'AIU') {
      this.beyondClassRoomOptions.push({
        title: 'AIU Student Community',
        pecUrl: this.getSetUrl,
        pecUrlRedirect: true,
        pecOpenIn: 'browser',
        pecTrackEvent: { category: 'More View', action: 'Tapped Student Community', label: '' },
      });
    }
    this.beyondClassRoomOptions.push({
      title: 'Bookshelf',
      pecTrackEvent: { category: 'More View', action: 'Tapped Bookshelf', label: '' },
      routePath: '/tabs/more//bookshelf',
    });
    if (this.schoolSelector === 'CTU') {
      this.beyondClassRoomOptions.push({
        title: 'CTU Student Community',
        pecUrl: this.getSetUrl,
        pecUrlRedirect: true,
        pecOpenIn: 'browser',
        pecTrackEvent: { category: 'More View', action: 'Tapped Student Community', label: '' },
      });
    }
    if (this.showGraduateFile) {
      this.beyondClassRoomOptions.push({
        title: 'Graduate File',
        pecTrackEvent: {
          category: 'More View',
          action: 'Tapped Graduate File option',
          label: 'Launched Grad File Wizard',
        },
        routePath: '/tabs/more/graduate-file',
      });
    }
    this.beyondClassRoomOptions.push({
      title: 'Library',
      pecTrackEvent: { category: 'More View', action: 'Tapped Library', label: '' },
      pecUrlRedirect: true,
      pecOpenIn: 'browser',
      pecLmsRedirect: true,
      pecHash: '/library/',
    });
    if (this.schoolSelector === 'CTU') {
      this.beyondClassRoomOptions.push({
        title: 'META - Student Wellness',
        pecUrlRedirect: true,
        pecOpenIn: 'browser',
        pecUrl: 'https://metastudent.page.link/home',
        pecTrackEvent: { category: 'Menu', action: 'Tapped META', label: '' },
      });
      this.beyondClassRoomOptions.push({
        title: 'Student Success Center',
        pecUrlRedirect: true,
        pecOpenIn: 'browser',
        pecUrl: 'http://careered.libguides.com/ctu/success',
        pecTrackEvent: { category: 'Menu', action: 'Tapped Success Center', label: '' },
      });
    }
    this.beyondClassRoomOptions.push({
      title: 'University Contacts',
      pecTrackEvent: { category: 'More View', action: 'Tapped University Contacts', label: '' },
      routePath: '/tabs/more/contacts',
    });
    this.beyondClassRoomOptions.push({
      title: 'Upload a Document',
      disabled: this.globalConfigs.isImpersonatedUser,
      pecTrackEvent: { category: 'More View', action: 'Tapped Upload a Doc', label: '' },
      routePath: '/tabs/financial-aid/document-upload',
      queryParams: { tabSelect: '5' },
    });
  }
}

interface MoreOptionItem {
  disabled?: boolean;
  pecUrlRedirect?: boolean;
  pecLmsRedirect?: boolean;
  pecOpenIn?: string;
  pecUrl?: string;
  pecHash?: string;
  pecTrackEvent?: GaEvent;
  title: string;
  routePath?: string;
  queryParams?: any;
}
