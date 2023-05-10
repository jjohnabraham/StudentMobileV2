import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { first, take } from 'rxjs/operators';
import { MobileService } from 'src/app/data/services/mobile.service';
import { UserService } from 'src/app/data/services/user.service';
import { BasePageComponent } from 'src/app/shared/components/base-page-component/base-page.component';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import { FrameComponent } from 'src/app/shared/components/iframe/iframe.component';
import { PecPopOverService } from 'src/app/shared/services/pec-popover.service';
import { InfoPopoverComponent } from 'src/app/shared/components/info-popover/info-popover.component';
import { PhoneLinkPipe } from 'src/app/shared/pipes/phone-link.pipe';
import { interval, Subscription } from 'rxjs';
import { PecNavigationService } from 'src/app/shared/services/pec-navigation.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@Component({
  selector: 'pec-discussion-board',
  templateUrl: './discussion-board.page.html',
  styleUrls: ['./discussion-board.page.scss'],
})
export class DiscussionBoardPage extends BasePageComponent implements OnInit {
  @ViewChild(FrameComponent) frame: FrameComponent;
  @ViewChild('alink') linkAnchor;
  @ViewChild('dlink') downloadLinkAnchor;

  public url?: SafeResourceUrl;
  public showLoading = false;
  public showError = false;
  public showPage = false;

  private DB_DELAY_THRESHOLD = 30;
  private supportPhone: string;
  private postId?: string;
  private classId: number;
  private assignmentId: number;
  private keyboardShown = false;
  private isLoaded = false;
  private blankIframeURL = 'data:text/html;charset=utf-8,%3Chtml%3E%3Cbody%3E%3C/body%3E%3C/html%3E';
  private closePromptPromise: any;
  private dirty: any;
  private _dbTimeoutSub: Subscription;
  private onKeyboardShowEvent = {
    handleEvent: (event) => {
      this.zone.run(() => {
        if (this.globalConfigs.isAndroid) {
          this.keyboardShown = true;
          document.getElementsByClassName('scroll-content')[1].setAttribute('style', 'margin-bottom:15px;');
        }
      });
    },
  };

  private onKeyboardHideEvent = {
    handleEvent: (event) => {
      this.zone.run(() => {
        if (this.globalConfigs.isAndroid) {
          this.keyboardShown = false;
          document.getElementsByClassName('scroll-content')[1].setAttribute('style', 'margin-bottom:56px;');
        }
      });
    },
  };

  constructor(
    private zone: NgZone,
    private mobileService: MobileService,
    public sanitizer: DomSanitizer,
    public globalConfigs: GlobalConfigsService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private popoverService: PecPopOverService,
    private navCtrl: NavController,
    private pecPhoneLink: PhoneLinkPipe,
    private keyboard: Keyboard,
    private pecNavService: PecNavigationService
  ) {
    super();
    this.classId = +this.activatedRoute.snapshot.params.classId;
    this.assignmentId = this.activatedRoute.snapshot.params.assignmentId;
    this.postId = this.activatedRoute.snapshot.params.postId;
    this.keyboard.hideFormAccessoryBar(false);
  }

  ngOnInit() {}

  ionViewDidEnter() {
    if (this.dirty) {
      return;
    }
  }

  ionViewWillEnter() {
    if (this.dirty) {
      return;
    }

    this.showPage = true;
    this.setTechSupportNumber(false);
    this.loadDiscussionBoard();
  }

  public canPageLeave(): Promise<boolean> {
    if (!this.dirty) {
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    }
    if (this.closePromptPromise) {
      return this.closePromptPromise;
    }
    const p = (resolve, reject) => {
      const message: string = this.dirty.title;
      const title: string = this.dirty.message;
      const buttonStayText = this.dirty.buttons.cancel; //Stay
      const buttonLeaveText = this.dirty.buttons.ok; //leave
      this.globalConfigs.disableConnectMenuClick = true;
      this.popoverService.show({
        component: InfoPopoverComponent,
        componentProps: {
          Title: title,
          Message: message,
          buttons: [
            {
              label: buttonStayText,
              action: () => {
                this.popoverService.dismiss().then(() => {
                  delete this.closePromptPromise;
                  resolve(false);
                });
              },
            },
            {
              label: buttonLeaveText,
              action: () => {
                this.popoverService.dismiss().then(() => {
                  delete this.closePromptPromise;
                  this.dirty = null;
                  this.globalConfigs.disableConnectMenuClick = false;
                  resolve(true);
                });
              },
            },
          ],
        },
      });
    };
    this.closePromptPromise = new Promise(p);
    return this.closePromptPromise;
  }

  ionViewWillLeave() {
    if (this.dirty) {
      return;
    }
    this.showPage = false;
    this._dbTimeoutSub.unsubscribe();
    this.clearSubscriptions();
  }

  public receiveMessage(eData) {
    if (eData && eData.type) {
      const type = eData.type.toLowerCase();
      switch (type) {
        case 'loaded':
          setTimeout(() => {
            this.showLoading = false;
          }, 500);
          break;
        case 'back':
          this.navCtrl.pop();
          break;
        case 'link':
          this.linkAnchor.nativeElement.href = eData.url;
          this.linkAnchor.nativeElement.click();
          break;
        case 'download':
          this.downloadLinkAnchor.nativeElement.setAttribute('download', eData.file);
          this.downloadLinkAnchor.nativeElement.href = eData.url;
          this.downloadLinkAnchor.nativeElement.click();
          break;
        case 'dirty':
          this.onDirtyChanged(eData.unsavedmessage);
          break;
        case 'clean':
          this.onDirtyChanged();
          break;
      }
    }
  }
  private setTechSupportNumber(unsupported: boolean) {
    // Tech Support number - need to update for campus id, only correct for online
    if (unsupported) {
      this.supportPhone = this.globalConfigs.unsupportedPhone;
    } else {
      if (this.globalConfigs.sycampusid === 5 || this.globalConfigs.sycampusid === 6) {
        //if online campus
        this.supportPhone =
          this.globalConfigs.themeId === 18
            ? this.globalConfigs.aiuOnlineTechSupportPhone
            : this.globalConfigs.ctuTechSupportPhone;
      } else {
        //if ground campus
        this.supportPhone =
          this.globalConfigs.themeId === 18
            ? this.globalConfigs.aiuGroundTechSupportPhone
            : this.globalConfigs.ctuTechSupportPhone;
      }
    }
  }

  private getLmsUrl() {
    const appId = 5;
    this.subscriptions.token = this.userService.getSlt(appId).subscribe(
      (token) => {
        token = encodeURIComponent(token);
        const verDtTm = new Date().getTime();

        const dbUrl =
          'discussionboard/?ssid=' +
          this.globalConfigs.ssid +
          '&c=' +
          '5' +
          '&cid=' +
          this.classId +
          '&aid=' +
          this.assignmentId;

        this.mobileService
          .campusSettings()
          .pipe(first())
          .subscribe((o) => {
            if (!o || !o.Settings || !o.Settings.LmsUrl) {
              return;
            }
            if (this.postId) {
              this.url = `${o.Settings.LmsUrl}/${dbUrl}&oa=5&ver=${verDtTm}#/db/post/${this.postId}?slt=${token}`;
            } else {
              this.url = `${o.Settings.LmsUrl}/${dbUrl}&oa=5&ver=${verDtTm}#/db?slt=${token}`;
            }
            this.isLoaded = true;
            this.listenIfDiscussionBoardLoadDelayed(parseInt(o.Settings.DiscussionBoardNotAvailable));
            //console.log(this.url);
            return;
          });
      },
      (error) => {
        setTimeout(() => {
          if (this.subscriptions.token) {
            this.subscriptions.token.unsubscribe();
            delete this.subscriptions.token;
          }
        }, 0);
        this.showError = true;
        delete this.url;
        return;
      }
    );
  }
  private listenIfDiscussionBoardLoadDelayed(delay?: number) {
    const dbDelay = delay ? delay : this.DB_DELAY_THRESHOLD;
    this._dbTimeoutSub = interval(dbDelay * 1000)
      .pipe(take(1))
      .subscribe(() => {
        if (this.showLoading) {
          this.url = null;
          this.showLoading = false;
          this.showPage = false;
          this.popoverService
            .show({
              component: InfoPopoverComponent,
              componentProps: {
                Title: 'Discussion Board Not Available',
                Message:
                  'We’re having technical difficulties and your discussion board cannot be accessed at this time. If this problem persists, please contact tech support at ' +
                  this.pecPhoneLink.transform(this.supportPhone),
                buttons: [
                  {
                    label: 'OK',
                    action: () => {
                      this.popoverService.dismiss();
                    },
                  },
                ],
              },
            })
            .then((data) => {
              this.zone.run(() => {
                this.pecNavService.goBack();
              });
            });
        }
      });
  }

  private loadDiscussionBoard() {
    window.addEventListener('keyboardDidShow', this.onKeyboardShowEvent, false);
    window.addEventListener('keyboardDidHide', this.onKeyboardHideEvent, false);

    this.showPage = true;

    if (!this.isLoaded) {
      this.showLoading = true;
      this.showError = false;
      this.getLmsUrl();
    }
  }

  private onDirtyChanged(dirty: any = null) {
    this.dirty = dirty;
    this.globalConfigs.disableConnectMenuClick = dirty ? true : false;
  }
  private clearPage() {
    if (this.isLoaded) {
      this.isLoaded = false;
      // this.frame.clearPage();
      // if (this.iframe) {
      //   const o = this.iframe;

      //   if (o.nativeElement && o.nativeElement.src) {
      //     //o.nativeElement.src = 'about:;';
      //     o.nativeElement.src = this.blankIframeURL;
      //   }
      // }

      // if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      //   this.keyboard = window.cordova.plugins.Keyboard;
      // } else if (window.Keyboard && window.Keyboard.disableScroll) {
      //   this.keyboard = window.Keyboard;
      // }

      // if (this.keyboard) {
      //   if (this.keyboard.hide) {
      //     this.keyboard.hide();
      //   } else if (this.keyboard.close) {
      //     this.keyboard.close();
      //   }
      // }

      // this.url = this.sanitizer.bypassSecurityTrustResourceUrl('about:;');
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.blankIframeURL);

      this.showPage = false;
      this.dirty = null;
      this.clearSubscriptions();
    }
  }
}
