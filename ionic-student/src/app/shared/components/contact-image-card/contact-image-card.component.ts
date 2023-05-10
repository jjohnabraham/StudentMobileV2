import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ContactInfo } from 'src/app/data/types/contact.type';
import { UserService } from 'src/app/data/services/user.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Office365Service } from 'src/app/data/services/office365.service';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import { CrashlyticsService } from 'src/app/shared/services/crashlytics.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'pec-contact-image-card',
  templateUrl: './contact-image-card.component.html',
  styleUrls: ['./contact-image-card.component.scss'],
})
export class ContactImageCardComponent implements OnInit {
  @Input() contactInfo: ContactInfo;
  @Input() imageClass: string;
  public pecImage: SafeUrl =
    this.globalConfigService.contentUrl +
    'assets/' +
    this.globalConfigService.brandName.toLowerCase() +
    '/images/school-logo-icon.png';
  public name: string;
  public ionImgClass = 'imgmodal';
  private contactAltTxt: string = this.globalConfigService.brandName + ' School Logo';
  private prevUrl: string;

  constructor(
    private userService: UserService,
    private globalConfigService: GlobalConfigsService,
    private sanitizer: DomSanitizer,
    private office365Service: Office365Service,
    private crashlyticsService: CrashlyticsService,
    private readonly router: Router
  ) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(x => this.prevUrl = JSON.stringify(x));
  }

  ngOnInit() {
    this.loadData();
  }

  public getFacultyImage() {
    let facultyImg;

    if (this.contactInfo.DisplayName.toLowerCase() === 'faculty') {
      this.userService
        .facultyProfileImage({ SourceSystemId: this.contactInfo.SourceSystem, SyStaffId: this.contactInfo.SyStaffId })
        .pipe()
        .subscribe(
          (url: string) => {
            facultyImg = this.sanitizer.bypassSecurityTrustUrl(url);
          },
          (error) => {
            facultyImg = this.geto365ProfileImage();
          }
        );
    } else {
      facultyImg = this.geto365ProfileImage();
    }

    return facultyImg;
  }

  private loadData() {
    if (this.imageClass) {
      this.ionImgClass = this.imageClass;
    }

    if (this.getFacultyImage()) {
      this.pecImage = this.getFacultyImage();
      this.contactAltTxt = 'Faculty Profile Image'; //TO DO: dynamic Faculty name
    }
  }

  private geto365ProfileImage() {
    let o365ProfileImg;
    if (this.contactInfo.DisplayName.toLowerCase() !== 'faculty') {
      if (this.contactInfo && this.contactInfo.EmailAddress) {
        this.office365Service.outlookToken().subscribe((o365token) => {
          if (o365token && o365token.Token) {
            this.office365Service
              .getProfileImageCec('Bearer ' + o365token.Token, this.contactInfo.EmailAddress)
              .subscribe(
                (data) => {
                  o365ProfileImg = this.sanitizer.bypassSecurityTrustUrl(data);
                },
                (error) => {
                  const errorQ = JSON.stringify(error);
                  //console.log('Get o365 error: ' + errorQ);
                  this.crashlyticsService.logError('Get o365 Error - Contact Image Card Component: ' + errorQ, this.router.url, this.prevUrl);
                }
              );
          }
        });
      }
    }

    return o365ProfileImg;
  }
}
