import { Component, Input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { first } from 'rxjs/operators';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Subscription } from 'rxjs';
import {
  ActionSheetController,
  AlertController,
  ModalController,
  NavController,
  PopoverController,
  ViewDidEnter,
  ViewWillLeave,
} from '@ionic/angular';
import { GaEvent, TrackingService } from '../../services/tracking.service';
import { PhoneLinkPipe } from '../../pipes/phone-link.pipe';
import { MobileSettings } from '../../../data/types/mobile-settings.type';
import { User } from '../../../data/types/user.type';
import { GlobalConfigsService } from '../../services/global-configs.service';
import { MobileService } from '../../../data/services/mobile.service';
import { AuthService } from '../../../data/services/auth.service';
import { ResourceService } from '../../../data/services/resource.service';
import { AuthGuard } from '../../guards/auth.guard';
import { UserService } from '../../../data/services/user.service';
import { EmailComposerService } from '../../services/email-composer.service';
import { CrashlyticsService } from '../../services/crashlytics.service';
import { filter } from 'rxjs/operators';

interface ErrorBtns {
  action: string;
  text: string;
  tracking: GaEvent;
}

@Component({
  selector: 'pec-error',
  templateUrl: './pec-error.component.html',
  styleUrls: ['./pec-error.component.scss'],
  providers: [TitleCasePipe, PhoneLinkPipe],
})
export class PECErrorComponent implements ViewDidEnter, ViewWillLeave {
  @Input() errType: string;
  @Input() errCode: string;

  //Content Vars
  public schoolName: string = this.globalConfigs.brandName;
  public errHeader = false;
  public errHeaderName: string = this.schoolName + ' Student';
  public errHeaderImg: string;
  public errHeaderImgAlt: string;
  public errImg: string;
  public errImgAlt: string;
  public smallErrTitle = false;
  public errTitle: string;
  public errMessage: string;
  public errBtns: ErrorBtns[];
  public errTrackingViewName: string;
  public isOnline = true;

  private mobileSettings: MobileSettings;
  private studentAppUrl: string;
  private supportPhone: string;
  private userInfo: User;
  private userInfoSub: Subscription;
  private paramsSub: Subscription;
  private facultyAppUrl: string;
  private errData: string;

  private prevUrl: string;

  constructor(
    public globalConfigs: GlobalConfigsService,
    private mobileService: MobileService,
    private iab: InAppBrowser,
    private pecPhoneLink: PhoneLinkPipe,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private resourceService: ResourceService,
    private authService: AuthService,
    private authGuard: AuthGuard,
    private trackingService: TrackingService,
    private titleCasePipe: TitleCasePipe,
    private userService: UserService,
    private emailComposer: EmailComposerService,
    private crashlyticsService: CrashlyticsService,
    private navCtrl: NavController,
    private popoverCtrl: PopoverController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav && nav.extras && nav.extras.state && nav.extras.state.errorData) {
      this.errData = nav.extras.state.errorData;
    }

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((x) => (this.prevUrl = JSON.stringify(x)));
  }

  public updateApp() {
    if (this.studentAppUrl) {
      if (this.globalConfigs.isCordova) {
        this.iab.create(this.studentAppUrl, '_system').show();
        return;
      } else {
        window.open(this.studentAppUrl);
        return;
      }
    }
  }

  public setErrHeaderImg() {
    this.errHeaderImg = this.schoolName === 'CTU' ? 'pec-icon-ctu-logo-horizontal' : 'pec-icon-aiu-logo-compact';
    this.errHeaderImgAlt =
      this.schoolName === 'CTU' ? 'Colorado Technical University&reg;' : 'American Intercontinental University&trade;';
  }

  public errBtnAction(action) {
    switch (action) {
      case 'update': {
        this.updateApp();
        break;
      }
      case 'login': {
        if (this.isOnline || this.errTrackingViewName === 'Timeout View') {
          this.navCtrl.navigateRoot(['/login'], {
            queryParams: { isSignOutClicked: true, isStandardLogin: true },
            replaceUrl: true,
          });
        }
        break;
      }
      case 'errReport': {
        this.emailComposer.composeErrorReport(this.userInfo, this.errCode, this.errData);
        break;
      }
      case 'faculty': {
        if (this.facultyAppUrl) {
          if (this.globalConfigs.isCordova && this.iab) {
            this.iab.create(this.facultyAppUrl, '_system').show();
            return;
          } else {
            window.open(this.facultyAppUrl);
            return;
          }
        } else {
          alert("Sorry, we're having difficulties. Please try again later.");
        }
        break;
      }
    }
  }

  public demoLogin() {
    this.userService
      .getFacultySlt(1)
      .pipe(first())
      .subscribe(
        (data) => {
          const facultyToken = data;
          if (facultyToken) {
            this.trackingService.trackEvent({
              view: 'Login Page',
              category: 'Faculty Interstitial Page',
              action: 'Tapped for Demo Student',
              label: '',
              value: '',
            });
            this.authService.sltLogin(facultyToken.SLT, this.userInfo, facultyToken.SSID, facultyToken.SyCampusId);
          } else {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        },
        (error) => {
          this.setContent('technical-difficulties', error.error);
        }
      );
  }

  public ionViewDidEnter() {
    this.popoverCtrl.getTop().then((p) => {
      if (p) p.dismiss();
    });
    this.alertCtrl.getTop().then((p) => {
      if (p) {
        this.authService.preventSecondaryStorage = true;

        p.dismiss().then(() => {
          this.authService.preventSecondaryStorage = false;
        });
      }
    });
    this.modalCtrl.getTop().then((p) => {
      if (p) p.dismiss();
    });
    this.actionSheetCtrl.getTop().then((p) => {
      if (p) p.dismiss();
    });

    this.getMobileSettings();
    this.setTechSupportNumber(false);

    if (this.globalConfigs) {
      this.userInfoSub = this.authService.getUserInfo().subscribe(
        (user) => {
          this.userInfo = user as User;
        },
        (error) => {
          console.log(error);
          this.crashlyticsService.logError(
            'Get User Info Error - Error Component: ' + JSON.stringify(error),
            this.router.url,
            this.prevUrl
          );
        }
      );
    }

    this.paramsSub = this.activatedRoute.params.subscribe((routeParams) => {
      this.errType = routeParams.errorType ? routeParams.errorType : '';
      this.errCode = routeParams.errorCode ? routeParams.errorCode : '';
      this.setContent(this.errType, this.errCode);
    });

    document.addEventListener(
      'offline',
      () => {
        this.isOnline = false;
      },
      false
    );

    document.addEventListener(
      'online',
      () => {
        this.isOnline = true;
      },
      false
    );
  }

  public ionViewWillLeave() {
    this.userInfoSub.unsubscribe();
    this.paramsSub.unsubscribe();
    this.setContent('');
  }

  private getMobileSettings() {
    this.mobileService
      .settings()
      .pipe(first())
      .subscribe((settings) => {
        this.mobileSettings = settings;
        if (
          this.globalConfigs.isIos &&
          this.mobileSettings.IosSettings &&
          this.mobileSettings.IosSettings.StudentAppUrl
        ) {
          this.studentAppUrl = this.mobileSettings.IosSettings.StudentAppUrl;
          this.facultyAppUrl = this.mobileSettings.IosSettings.FacultyAppUrl;
        } else if (
          this.globalConfigs.isAndroid &&
          this.mobileSettings.AndroidSettings &&
          this.mobileSettings.AndroidSettings.StudentAppUrl
        ) {
          this.studentAppUrl = this.mobileSettings.AndroidSettings.StudentAppUrl;
          this.facultyAppUrl = this.mobileSettings.AndroidSettings.FacultyAppUrl;
        }
      });
  }

  private setTechSupportNumber(unsupported: boolean) {
    this.supportPhone = this.globalConfigs.getTechSupportNumber(unsupported);
  }

  private setContent(err: string, code?: string) {
    if (this.userInfo && this.userInfo.FirstName) {
      this.errHeaderName = this.titleCasePipe.transform(this.userInfo.FirstName);
    }
    if (err) {
      this.crashlyticsService.logError(err + ', Code :' + code, this.router.url, this.prevUrl);
    }

    switch (err) {
      case 'force-update': {
        this.setTechSupportNumber(false);
        this.errTrackingViewName = 'Force Update View';
        this.errHeader = false;
        this.errImg = this.globalConfigs.assetsUrl + '/images/force-upgrade.png';
        this.errImgAlt = 'Time to Update; tap below to update';
        this.errTitle = 'Time to Update';
        this.smallErrTitle = false;
        this.errCode = code;
        this.errMessage =
          'There is a new version of the ' +
          this.schoolName +
          ' Student App. You must update your app in order to proceed. If you encounter any problems, please contact Tech Support at ' +
          this.pecPhoneLink.transform(this.supportPhone);
        this.errBtns = [
          {
            action: 'update',
            text: 'Update',
            tracking: null,
          },
        ];
        break;
      }
      case 'offline': {
        this.isOnline = false;
        this.setTechSupportNumber(false);
        this.errTrackingViewName = 'Offline Error View';
        this.errHeader = false;
        this.errTitle = 'No Connection';
        this.errCode = code;
        this.errMessage =
          'No internet found. Please check your connection and try again. If you think you are receiving this message in error, please contact tech support at ' +
          this.pecPhoneLink.transform(this.supportPhone);
        this.errBtns = [
          {
            action: 'login',
            text: 'Retry',
            tracking: { category: 'Connectivity Error', action: 'Tapped Retry', label: '', value: '' },
          },
          {
            action: 'errReport',
            text: 'Send Error Report',
            tracking: { category: 'Connectivity Error', action: 'Tapped Send Error Report', label: '', value: '' },
          },
        ];
        break;
      }
      case 'alumni': {
        this.setTechSupportNumber(true);
        this.setErrHeaderImg();
        this.errTrackingViewName = 'Alumni View';
        this.errHeader = false;
        this.errImg = this.globalConfigs.assetsUrl + '/images/welcome-back.png';
        this.errImgAlt = 'Welcome Back';
        this.errTitle = 'Get back on track to a college degree!';
        this.smallErrTitle = true;
        this.errCode = code;
        this.errMessage =
          "Earning a degree is important - and it's something you shouldn't give up on. Re-enrolling is simple and quick. To speak to an advisor now, call " +
          this.pecPhoneLink.transform(this.supportPhone);
        this.errBtns = [];
        break;
      }
      case 'timeout': {
        this.setTechSupportNumber(false);
        this.setErrHeaderImg();
        this.errTrackingViewName = 'Timeout View';
        this.errHeader = false;
        this.errImg = this.globalConfigs.assetsUrl + '/images/timeout-clock.png';
        this.errImgAlt = 'Where did you go?';
        this.errTitle = 'Where did you go?';
        this.smallErrTitle = false;
        this.errCode = code;
        this.errMessage = 'Your session has timed out.<br />Please sign back in.';
        this.errBtns = [
          {
            action: 'login',
            text: 'Sign In',
            tracking: null,
          },
        ];
        break;
      }
      case 'technical-difficulties': {
        this.setTechSupportNumber(false);
        this.setErrHeaderImg();
        this.errTrackingViewName = 'Technical Difficulties View';
        this.errHeader = false;
        this.errImg = this.globalConfigs.assetsUrl + '/images/lounge-closed.png';
        this.errImgAlt = 'Closed due to Technical Difficulties';
        this.errTitle = 'Sorry!';
        this.smallErrTitle = false;
        this.errCode = code;
        this.errMessage =
          "We're having technical difficulties. Please try again later. If this problem persists, please contact tech support at<br />" +
          this.pecPhoneLink.transform(this.supportPhone);
        this.errBtns = [
          {
            action: 'login',
            text: 'Retry',
            tracking: { category: 'Connectivity Error', action: 'Tapped Retry', label: '', value: '' },
          },
          {
            action: 'errReport',
            text: 'Send Error Report',
            tracking: { category: 'Connectivity Error', action: 'Tapped Send Error Report', label: '', value: '' },
          },
        ];
        break;
      }
      case 'faculty': {
        this.setTechSupportNumber(false);
        this.setErrHeaderImg();
        this.errTrackingViewName = 'Faculty Only View';
        this.errHeader = false;
        this.errImg = this.globalConfigs.assetsUrl + '/images/lounge-students-only.png';
        this.errImgAlt = 'Students Only!';
        this.errTitle = 'Oops!';
        this.smallErrTitle = false;
        this.errCode = code;
        this.errMessage = 'Looks like you may have stumbled into the wrong place. Try looking here instead:';
        this.errBtns = [
          {
            action: 'faculty',
            text: 'Faculty App',
            tracking: null,
          },
        ];
        break;
      }
      default: {
        this.setTechSupportNumber(false);
        this.setErrHeaderImg();
        this.errHeader = false;
        this.errImg = this.globalConfigs.assetsUrl + '/images/lounge-closed.png';
        this.errImgAlt = null;
        this.errTitle = 'Undefined Error Page';
        this.smallErrTitle = false;
        this.errCode = 'UNDEFINED';
        this.errMessage =
          "You've reached an undefined error page. Please return to the login page below or contact tech support if you feel you've reached this message in error: " +
          this.pecPhoneLink.transform(this.supportPhone);
        this.errBtns = [
          {
            action: 'login',
            text: 'Return to Login',
            tracking: null,
          },
        ];
        break;
      }
    }
  }
}
