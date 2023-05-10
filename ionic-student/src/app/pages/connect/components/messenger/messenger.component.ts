import { ChangeDetectorRef, Component, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { BasePageComponent } from '../../../../shared/components/base-page-component/base-page.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StorageService } from '../../../../shared/services/storage.service';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { MobileService } from '../../../../data/services/mobile.service';
import { UserService } from '../../../../data/services/user.service';
import { first } from 'rxjs/operators';
import { Platform, ViewDidLeave } from '@ionic/angular';
import { PecHttpService } from '../../../../shared/services/pec-http.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Router, ActivatedRoute } from '@angular/router';
import { ContactInfo } from 'src/app/data/types/contact.type';

@Component({
  selector: 'pec-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.scss'],
})
export class MessengerComponent extends BasePageComponent implements OnDestroy, ViewDidLeave {
  @ViewChild('if') iframe;
  @ViewChild('alink') linkAnchor;
  @ViewChild('dlink') downloadLinkAnchor;

  public url: string;
  public showLoading = false;
  public showError = false;
  public showPage = false;
  public keyboardHeight = 0;
  public keyboardShownIos = false;

  private messengerUrl: string;
  private keyboardShown = false;
  private student: any;
  private staff: ContactInfo;
  private canLeave = true;
  private cancelTitle = '';
  private cancelText = '';
  private isLoaded = false;
  private blankIframeURL = 'data:text/html;charset=utf-8,%3Chtml%3E%3Cbody%3E%3C/body%3E%3C/html%3E';
  private _useCamera = true;
  private _useExternalStorage = true;
  private _useMicrophone = true;
  private boundReceiveMessage = this.receiveMessage.bind(this);

  private onKeyboardShowEvent = {
    handleEvent: () => {
      this.zone.run(() => {
        if (this.globalConfigs.isAndroid) {
          this.keyboardShown = true;
          document.getElementsByClassName('scroll-content')[1].setAttribute('style', 'margin-bottom:15px;');
        } else if (this.globalConfigs.isIos) {
          this.keyboardShownIos = true;
        }
      });
    },
  };

  private onKeyboardHideEvent = {
    handleEvent: () => {
      this.zone.run(() => {
        if (this.globalConfigs.isAndroid) {
          this.keyboardShown = false;
          document.getElementsByClassName('scroll-content')[1].setAttribute('style', 'margin-bottom:56px;');
        } else if (this.globalConfigs.isIos) {
          this.keyboardShownIos = false;
        }
      });
    },
  };

  private get useCamera(): boolean {
    return this._useCamera;
  }

  private set useCamera(useCa: boolean) {
    this._useCamera = useCa;
    this.storage.setItem('useCamera', useCa, true);
  }

  private get useExternalStorage(): boolean {
    return this._useExternalStorage;
  }

  private set useExternalStorage(useES: boolean) {
    this._useExternalStorage = useES;
    this.storage.setItem('useExternalStorage', useES, true);
  }

  private get useMicrophone(): boolean {
    return this._useMicrophone;
  }

  private set useMicrophone(useMic: boolean) {
    this._useMicrophone = useMic;
    this.storage.setItem('useMicrophone', useMic, true);
  }

  constructor(
    private platform: Platform,
    private zone: NgZone,
    private http: PecHttpService,
    private mobileService: MobileService,
    public sanitizer: DomSanitizer,
    public globalConfigs: GlobalConfigsService,
    private storage: StorageService,
    private router: Router,
    private userService: UserService,
    private diagnostic: Diagnostic,
    private keyboard: Keyboard,
    private route: ActivatedRoute
  ) {
    super();
    this.route.queryParams.subscribe((params) => {
      if (this.router.getCurrentNavigation().extras.state) {
        if (this.router.getCurrentNavigation().extras.state.staff) {
          this.staff = this.router.getCurrentNavigation().extras.state.staff;
        }
        if (this.router.getCurrentNavigation().extras.state.student) {
          this.student = this.router.getCurrentNavigation().extras.state.staff;
        }
      }
    });

    this.storage.getItem<boolean>('useCamera').subscribe((useCamera) => {
      if (useCamera != null) {
        this._useCamera = useCamera;
      }
    });

    this.storage.getItem<boolean>('useExternalStorage').subscribe((useExternalStorage) => {
      if (useExternalStorage != null) {
        this._useExternalStorage = useExternalStorage;
      }
    });

    this.storage.getItem<boolean>('useMicrophone').subscribe((useMicrophone) => {
      if (useMicrophone != null) {
        this._useMicrophone = useMicrophone;
      }
    });
  }

  public ngOnDestroy() {
    this.clearPage();
  }

  public ionViewDidLeave() {
    this.clearPage();
  }

  public ionViewDidEnter() {
    if (!this.subscriptions.appStatus) {
      this.subscriptions.appStatus = this.globalConfigs.appStatus.subscribe((v: string) => {
        if (v) {
          if (this.iframe) {
            const o = this.iframe;

            if (
              o.nativeElement &&
              o.nativeElement.contentWindow &&
              o.nativeElement.contentWindow.postMessage &&
              o.nativeElement.contentWindow.location &&
              o.nativeElement.contentWindow.location.href
            ) {
              let frameDomain = o.nativeElement.contentWindow.location.hostname;
              if (o.nativeElement.contentWindow.location.href.substring(0, 5) === 'https') {
                frameDomain = 'https://' + frameDomain;
              } else frameDomain = 'http://' + frameDomain;

              if (v === 'resume') {
                o.nativeElement.contentWindow.postMessage({ type: 'resume' }, frameDomain);
              } else if (v === 'pause') {
                o.nativeElement.contentWindow.postMessage({ type: 'pause' }, frameDomain);
              }
            }
          }
        }
      });
    }

    if (this.globalConfigs.isIos) {
      if (!this.subscriptions.kbShow) {
        this.subscriptions.kbShow = this.platform.keyboardDidShow.subscribe((ev) => {
          const { keyboardHeight } = ev;
          this.keyboardHeight = keyboardHeight;
        });
      }

      if (!this.subscriptions.kbHide) {
        this.subscriptions.kbHide = this.platform.keyboardDidHide.subscribe((ev) => {
          this.keyboardHeight = 0;
        });
      }
    }
  }

  public ionViewWillEnter() {
    this.showPage = true;
    this.loadChatPage();
  }

  public ionViewWillLeave() {
    this.showPage = false;

    this.clearSubscriptions();
  }

  private getSlt() {
    this.userService
      .getSlt(5)
      .pipe(first())
      .subscribe(
        (token) => {
          if (!token) {
            this.showError = true;
            delete this.url;
            return;
          }

          let u = '';
          let hasQs = false;

          if (this.messengerUrl.indexOf('?') >= 0) {
            hasQs = true;
          }

          if (this.messengerUrl.indexOf('ssid=') < 0) {
            if (hasQs) {
              u = `${this.messengerUrl}&ssid=${this.globalConfigs.ssid}`;
            } else {
              u = `${this.messengerUrl}?ssid=${this.globalConfigs.ssid}`;
            }
          } else {
            u = this.messengerUrl;
          }

          if (this.student) {
            u = `${u}#/chat?ssid=${this.student.SourceSystem}&systudentid=${
              this.student.SyStudentId
            }&sltt=${encodeURIComponent(token)}`;
          } else if (this.staff) {
            u = `${u}#/chat?ssid=${this.staff.SourceSystem}&systaffid=${this.staff.SyStaffId}&sltt=${encodeURIComponent(
              token
            )}`;
          } else {
            u = `${u}#/chat?sltt=${encodeURIComponent(token)}`;
          }

          this.url = u;

          if (!this.subscriptions.appStatus) {
            this.subscriptions.appStatus = this.globalConfigs.appStatus.subscribe((v: string) => {
              if (v) {
                if (this.iframe) {
                  const o = this.iframe;

                  if (
                    o.nativeElement &&
                    o.nativeElement.contentWindow &&
                    o.nativeElement.contentWindow.postMessage &&
                    o.nativeElement.contentWindow.location &&
                    o.nativeElement.contentWindow.location.href
                  ) {
                    let frameDomain = o.nativeElement.contentWindow.location.hostname;
                    if (o.nativeElement.contentWindow.location.href.substring(0, 5) === 'https') {
                      frameDomain = 'https://' + frameDomain;
                    } else frameDomain = 'http://' + frameDomain;

                    if (v === 'resume') {
                      o.nativeElement.contentWindow.postMessage({ type: 'resume' }, frameDomain);
                    } else if (v === 'pause') {
                      o.nativeElement.contentWindow.postMessage({ type: 'pause' }, frameDomain);
                    }
                  }
                }
              }
            });
          }

          window.addEventListener('message', this.boundReceiveMessage, false);

          this.isLoaded = true;
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

  private setExternalStorageAuthUse() {
    this.diagnostic.requestExternalStorageAuthorization().then(
      (available) => {
        this._useExternalStorage = false;
        this.useExternalStorage = false;
        if (available) {
          this.setMicrophoneAuth();
        } else {
          this.getSlt();
        }
      },
      () => this.getSlt()
    );
  }

  private setMicrophoneAuth() {
    this.diagnostic.isMicrophoneAuthorized().then(
      (available) => {
        if (available) {
          this._useMicrophone = false;
          this.useMicrophone = false;
          this.messengerUrl = this.messengerUrl + '&mp=3';
          this.getSlt();
        } else if (this.useMicrophone) {
          this._useMicrophone = false;
          this.useMicrophone = false;
          this.diagnostic.requestMicrophoneAuthorization().then(
            (auth) => {
              if (auth === 'GRANTED') {
                // Microphone is available and camera
                this.messengerUrl = this.messengerUrl + '&mp=3';
              } else {
                // Microphone is not available, only camera
                this.messengerUrl = this.messengerUrl + '&mp=1';
              }

              this.getSlt();
            },
            () => this.getSlt()
          );
        } else {
          // Microphone is not available, only camera
          this.messengerUrl = this.messengerUrl + '&mp=1';
          this.getSlt();
        }
      },
      () => this.getSlt()
    );
  }

  private loadChatPage() {
    window.addEventListener('keyboardDidShow', this.onKeyboardShowEvent, false);
    window.addEventListener('keyboardDidHide', this.onKeyboardHideEvent, false);

    this.showPage = true;

    if (!this.isLoaded) {
      this.showLoading = true;
      this.showError = false;

      if (!this.messengerUrl) {
        this.mobileService
          .campusSettings()
          .pipe(first())
          .subscribe(
            (o) => {
              if (!o || !o.Settings || !o.Settings.MessengerUrl) {
                this.showError = true;
                return;
              }

              this.messengerUrl = o.Settings.MessengerUrl;
              if (this.globalConfigs.messengerUrl) {
                this.messengerUrl = this.globalConfigs.messengerUrl;
              }

              if (this.globalConfigs.isAndroid) {
                this.diagnostic.isCameraAuthorized().then(
                  (available) => {
                    if (available) {
                      this.diagnostic.isExternalStorageAuthorized().then(
                        (available2) => {
                          if (available2) {
                            this.setMicrophoneAuth();
                          } else if (this.useExternalStorage) {
                            this.setExternalStorageAuthUse();
                          } else {
                            this.getSlt();
                          }
                        },
                        () => this.getSlt()
                      );
                    } else if (this.useCamera) {
                      // request camera authorozation
                      // parameter is set to "true" for Android devices this will ask for external storage authorization as well
                      this.diagnostic.requestCameraAuthorization(true).then(
                        () => {
                          this._useCamera = false;
                          this.useCamera = false;
                          this.diagnostic.isExternalStorageAuthorized().then(
                            (auth) => {
                              if (auth) {
                                this.setMicrophoneAuth();
                              } else {
                                this.getSlt();
                              }
                            },
                            () => this.getSlt()
                          );
                        },
                        () => this.getSlt()
                      );
                    } else this.getSlt();
                  },
                  () => this.getSlt()
                );
              } else {
                // end isAndroid
                this.getSlt();
              }

              this.showLoading = false;
            },
            () => {
              this.showError = true;
              this.showLoading = false;
            }
          );
      } else {
        this.getSlt();
        this.showLoading = false;
      }
    }
  }

  private receiveMessage(e) {
    if (e && e.data && e.data.type) {
      const type = e.data.type.toLowerCase();

      if (e.data.url) {
        switch (type) {
          case 'link':
            this.globalConfigs.openUrlOutOfApp(e.data.url);
            break;
          case 'download':
            this.downloadLinkAnchor.nativeElement.setAttribute('download', e.data.file);
            this.downloadLinkAnchor.nativeElement.href = e.data.url;
            this.downloadLinkAnchor.nativeElement.click();
            break;
        }
      }
    }
  }

  private clearPage() {
    if (this.isLoaded) {
      this.isLoaded = false;

      if (this.iframe) {
        const o = this.iframe;

        if (o.nativeElement && o.nativeElement.src) {
          o.nativeElement.src = this.blankIframeURL;
        }
      }

      if (this.globalConfigs.isCordova) {
        this.keyboard.hide();
      }

      this.url = this.blankIframeURL;
      this.showPage = false;
      this.cancelText = '';
      this.cancelTitle = '';
      this.canLeave = true;

      this.clearSubscriptions();

      window.removeEventListener('message', this.boundReceiveMessage, false);
    }
  }
}
