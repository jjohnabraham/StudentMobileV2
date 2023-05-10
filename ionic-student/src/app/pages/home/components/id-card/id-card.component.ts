import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { ActionSheetController, NavController } from '@ionic/angular';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { AuthService } from '../../../../data/services/auth.service';
import { AuthGuard } from '../../../../shared/guards/auth.guard';
import { User } from '../../../../data/types/user.type';
import { TrackingService } from '../../../../shared/services/tracking.service';
import { UserService } from '../../../../data/services/user.service';
import { StorageService } from '../../../../shared/services/storage.service';
import { PecHttpService } from '../../../../shared/services/pec-http.service';
import { GetPictureService, ImageData } from '../../../../shared/services/get-picture.service';
import { PecDatePipe } from '../../../../shared/pipes/date.pipe';
import { AssetBase64Pipe } from '../../../../shared/pipes/asset-base64.pipe';
import { first, filter } from 'rxjs/operators';
import { CrashlyticsService } from '../../../../shared/services/crashlytics.service';

@Component({
  selector: 'pec-id-card',
  templateUrl: './id-card.component.html',
  styleUrls: ['./id-card.component.scss'],
  providers: [],
})
export class IdCardComponent implements OnInit {
  // public schoolLogo: string = this.globalConfigs.assetsUrl + '/images/profile-default.png';
  public schoolLogo: string = this.globalConfigs.assetsUrl + '/images/logo-full-2.png';

  //content variables
  public showLoading = true;

  public avatar: string | Blob = this.userService.defaultImage;
  public name: string;
  public studentID: string;
  public validThrough: Date;
  public idFooter: string;
  public isAlumni = false;
  public gradDate: Date;
  private actionSheet: any;

  //subscriptions
  private _params: Subscription;
  private subscriptions: Subscription[] = [];

  private userInfo: User;
  private file: any;

  private prevUrl: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public globalConfigs: GlobalConfigsService,
    private location: Location,
    private authService: AuthService,
    private authGuard: AuthGuard,
    private userService: UserService,
    private getPictureService: GetPictureService,
    private trackingService: TrackingService,
    private datePipe: PecDatePipe,
    private storage: StorageService,
    private base64Pipe: AssetBase64Pipe,
    private http: PecHttpService,
    private actionSheetController: ActionSheetController,
    private navCtrl: NavController,
    private crashlyticsService: CrashlyticsService
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((x) => (this.prevUrl = JSON.stringify(x)));
  }

  public ngOnInit() {}

  public ionViewWillEnter() {
    this.showLoading = true;
    if (this.globalConfigs) {
      this.subscriptions.push(
        this.authService.getUserInfo().subscribe(
          (user) => {
            this.userInfo = user as User;
            this._params = this.activatedRoute.params.subscribe((routeParams) => {
              this.isAlumni = routeParams.idType === 'alumni';
              this.setContent();
            });
          },
          (error) => {
            //console.log(error);
            this.crashlyticsService.logError(
              'Get User Info Error - ID Card: ' + JSON.stringify(error),
              this.router.url,
              this.prevUrl
            );
          }
        )
      );
    }
  }

  public ionViewWillLeave() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public setImage() {
    this.presentActionSheet();
  }

  public close() {
    if (!this.isAlumni) {
      //this.location.back();
      this.navCtrl.pop();
    } else {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  private setContent() {
    this.subscriptions.push(
      this.userService.studentProfileImage(true).subscribe((url) => {
        this.avatar = url;
      })
    );
    this.name = this.userInfo.FirstName + ' ' + this.userInfo.LastName;
    this.studentID = this.userInfo.StudentNumber;
    this.validThrough = this.userInfo.StudentIdValidUntil;
    this.idFooter = this.isAlumni ? 'Alumni' : 'Student ID Card';
    if (this.isAlumni) {
      this.gradDate = this.userInfo.StudentGradDate;
    }
    this.showLoading = false;
  }

  private presentActionSheet() {
    this.actionSheet = this.actionSheetController
      .create({
        header: 'Select Image Source',
        buttons: [
          {
            text: 'Load from Library',
            handler: () => {
              this.file = this.getPictureService.getPicture('library').then((value: ImageData) => {
                this.uploadProfileImage(value);
              });
            },
          },
          {
            text: 'Use Camera',
            handler: () => {
              this.file = this.getPictureService.getPicture('camera').then((value: ImageData) => {
                this.uploadProfileImage(value);
              });
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ],
      })
      .then((actionSheet) => actionSheet.present());
  }

  private uploadProfileImage(value: ImageData) {
    this.showLoading = true;
    const formData: FormData = new FormData();
    formData.append('userProfileImageFile', value.file, value.file.name);
    this.subscriptions.push(
      this.userService
        .profileImageUpload({ formData })
        .pipe(first())
        .subscribe(() => {
          this.avatar = value.imagePreview;
          this.userService.setProfileImageUploadedDateTime();
          this.showLoading = false;
        })
    );
  }
}
