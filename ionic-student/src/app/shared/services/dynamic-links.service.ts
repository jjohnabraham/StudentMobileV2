/* eslint-disable @typescript-eslint/dot-notation */
import { Injectable, NgZone } from '@angular/core';
import { GlobalConfigsService } from './global-configs.service';
import { UserService } from '../../data/services/user.service';
import { MobileService } from '../../data/services/mobile.service';
import { ClassHoldProps, ExamService } from 'src/app/pages/home/services/exam.service';
import { ClassStatus } from '../../data/types/class.type';
import { ClassService } from '../../data/services/class.service';
import { first } from 'rxjs/operators';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { TrackingService } from './tracking.service';
import { ThemeId } from '../enums/theme-id.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class DynamicLinksService {
  constructor(
    private globalConfigs: GlobalConfigsService,
    private userService: UserService,
    private mobileService: MobileService,
    private browserTab: BrowserTab,
    private iab: InAppBrowser,
    private trackingService: TrackingService,
    private classService: ClassService,
    private examService: ExamService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private platform: Platform,
    private zone: NgZone
  ) {}

  public interceptLinkClick(e) {
    let target = e.target || e.srcElement;
    if (target) {
      let el = target;
      let validRelativeLink;
      let linkEl;
      let href;
      let hrefLower;

      if (!target.getAttribute('href')) {
        target = e.target.parentNode;
      }
      if (!target) return false;
      let url = target.getAttribute('href');
      if (!url) return false;
      const isDbLink = target.classList.contains('pec-db-link');
      const isDownloadLink = target.hasAttribute('data-skip-slt');

      try {
        url = this.tryConvertUrlToDeepLink(url);
      } catch (error) {}

      if (
        url &&
        window.cecPreferences &&
        url.toLowerCase().indexOf(window.cecPreferences['com.careered.customurlscheme']) === 0
      ) {
        e.preventDefault();
        e.stopPropagation();

        if (url.toLowerCase().indexOf('sltlogin') > 0) {
          const params = decodeURIComponent(url.split('sltlogin/')[1]);
          this.router.navigate(['slt-login'], { state: { slt: params } });
        } else {
          this.processDeepLink(decodeURIComponent(url));
        }

        return false;
      }

      while (el) {
        if (!linkEl && el.nodeName && el.nodeName.toLowerCase() === 'a') {
          linkEl = el;
          href = el.getAttribute('href');

          if (href) {
            hrefLower = href.toLowerCase();

            if (hrefLower.indexOf('http') === 0) {
              break;
            }
          }
        }

        if (el.classList && el.classList.contains('pec-injected-html')) {
          validRelativeLink = true;
          e.preventDefault();
          break;
        }

        el = el.parentNode;
      }

      if (!href) {
        return;
      }

      if (hrefLower && hrefLower.indexOf('mailto:') === 0) {
        e.preventDefault();

        const emailAddress = hrefLower.split(':');
        const emailString = 'mailto:' + emailAddress[1];
        this.globalConfigs.openUrlOutOfApp(emailString);

        return;
      }

      if (
        href &&
        (hrefLower.indexOf('http') === 0 ||
          hrefLower.indexOf('//') === 0 ||
          hrefLower.indexOf('.com') >= 0 ||
          hrefLower.indexOf('.edu') >= 0 ||
          hrefLower.indexOf('.io') >= 0)
      ) {
        e.preventDefault();
        e.stopPropagation();

        if (hrefLower.indexOf('http') !== 0) {
          while (href.charAt(0) === '/' || href.charAt(0) === ':') {
            href = href.substr(1);
          }

          href = 'http://' + href;
        }
        const isSchoolLink = this.isSchoolLink(href);

        // If user is on Learning Activities - track this click
        if (location.href.toLowerCase().indexOf('learning-activities') > 0 || href.toLowerCase().indexOf('ebook') > 0) {
          this.deepLinksTracking(href);
        }

        const isCareered = href.indexOf('careeredonline.com') > 0;
        href = href.trim();
        if (isSchoolLink && !isDownloadLink) {
          const appId = 5;
          this.userService
            .getSlt(appId)
            .pipe(first())
            .subscribe((token) => {
              token = encodeURIComponent(token);
              if (!isDbLink) {
                href = `${href}${href && href.indexOf('?') < 0 ? '?' : '&'}refApp=mobile&slt=${token}`;
                this.openUrl(href);
              } else {
                this.mobileService
                  .campusSettings()
                  .pipe(first())
                  .subscribe((o) => {
                    if (!o || !o.Settings || !o.Settings.LmsUrl) {
                      return;
                    }

                    const lmsUrl =
                      o.Settings.LmsUrl.substr(-o.Settings.LmsUrl.length) === '/'
                        ? o.Settings.LmsUrl
                        : `${o.Settings.LmsUrl}/`;
                    href = `${lmsUrl}ConexusRedirect?url=${encodeURIComponent(href)}&slt=${token}&refApp=mobile`;
                    this.openUrl(href);
                  });
              }
            });
        } else if (isCareered || isDownloadLink) {
          this.openUrl(href);
        } else {
          this.globalConfigs.openUrlOutOfApp(href);
        }
      }
    }
  }

  public processDeepLink(url: string, isAirshipDeepLink: boolean = false) {
    let customUrl = url.split('://')[2];
    if (customUrl === undefined) {
      customUrl = url.split('://')[1];
    }
    let previousUrl;

    const params = customUrl.split('?')[1];

    const paramsMap = params.split('&').reduce((pc, c) => {
      const components = c.split('=');
      pc[components[0].toLocaleLowerCase()] = components[1].toLocaleLowerCase();
      return pc;
    }, new Map<string, string>());

    let gatype;
    if (url.indexOf('openinbrowser') > 0 || url.indexOf('openinapp') > 0) {
      const ps = url.split('://')[1].split('?')[1];
      const pa = ps.split('&').reduce((p, c) => {
        const components = c.split('=');
        p[components[0].toLocaleLowerCase()] = components[1].toLocaleLowerCase();
        return p;
      }, new Map<string, string>());
      gatype = pa['gatype'];
      const index = url.indexOf('url=');

      paramsMap['type'] = pa['type'];
      paramsMap['url'] = url.substring(index + 4);
    }

    if (this.platform.url().toLowerCase().indexOf('unit-info') > 0) {
      this.deepLinksTracking(paramsMap['url']);
    }

    if (isAirshipDeepLink && this.router.url.indexOf('notifications') === 0) {
      previousUrl = '/tabs/home';
    } else {
      previousUrl = this.router.url;
    }

    switch (paramsMap['type']) {
      case 'notifications':
        {
          this.zone.run(() => {
            this.router.navigate(['tabs/connect/notifications'], { queryParams: { tabSelect: 3 } });
            return;
          });
        }
        break;
      case 'home':
        {
          this.zone.run(() => {
            this.router.navigate(['tabs/home'], { queryParams: { tabSelect: 1 } });
            return;
          });
        }
        break;
      case 'classannouncements':
        {
          this.zone.run(() => {
            this.router.navigate(['tabs/connect/announcements'], {
              state: {
                previousurl: previousUrl,
              },
              queryParams: { deepLink: true, tabSelect: 3 },
            });
            return;
          });
        }
        break;
      case 'fa':
        {
          this.zone.run(() => {
            if (paramsMap['documentid']) {
              this.router.navigate(['tabs/home'], { queryParams: { tabSelect: 1 } });
            } else {
              this.router.navigate(['tabs/financial-aid'], { queryParams: { tabSelect: 4 } });
            }
            return;
          });
        }
        break;
      case 'fa-outstanding':
        {
          this.zone.run(() => {
            this.router.navigate(['tabs/financial-aid/document-summary'], {
              queryParams: { viewType: 'outstanding', tabSelect: 4 },
            });
            return;
          });
        }
        break;
      case 'contacts': {
        this.zone.run(() => {
          this.router.navigate(['tabs/more/contacts'], { queryParams: { tabSelect: 5 } });
          return;
        });
        break;
      }
      case 'messenger': {
        this.zone.run(() => {
          this.router.navigate(['tabs/connect/messenger'], { queryParams: { tabSelect: 3 } });
          return;
        });
        break;
      }
      case 'more': {
        this.zone.run(() => {
          this.router.navigate(['tabs/more'], { queryParams: { tabSelect: 5 } });
          return;
        });
        break;
      }
      case 'senddocs': {
        this.zone.run(() => {
          this.router.navigate(['tabs/financial-aid/document-upload'], { queryParams: { tabSelect: 5 } });
          return;
        });
        break;
      }
      case 'class':
      case 'classchat':
      case 'classassignment': {
        this.zone.run(() => {
          this.goToClassroom(paramsMap['classid'], previousUrl);
          return;
        });
        break;
      }
      case 'gradedassignment': {
        this.zone.run(() => {
          this.router.navigate(['/tabs/degree/graded-assignments/detail'], {
            state: {
              classId: paramsMap['classid'],
              assignmentId: paramsMap['assignmentid'],
              pageTrackTitle: 'Classroom View',
              previousurl: previousUrl,
            },
            queryParams: { tabSelect: 1 },
          });
          return;
        });
        break;
      }
      case 'assignmentoverview': {
        this.zone.run(() => {
          this.router.navigate(
            ['tabs/home/classroom/' + paramsMap['classid'] + '/assignment-overview/' + paramsMap['assignmentid']],
            { queryParams: { tabSelect: 1 } }
          );

          return;
        });
        break;
      }
      case 'degree':
      case 'tasks': {
        this.zone.run(() => {
          this.router.navigate(['tabs/degree'], { queryParams: { displaytab: paramsMap['displaytab'], tabSelect: 2 } });
          return;
        });
        break;
      }
      case 'db':
      case 'discussionboard': {
        this.zone.run(() => {
          this.router.navigate(
            [
              'tabs/home/discussion-board/' +
                paramsMap['classid'] +
                '/' +
                paramsMap['assignmentid'] +
                '/' +
                paramsMap['postid'],
            ],
            { queryParams: { tabSelect: 1 } }
          );

          return;
        });
        break;
      }
      case 'bookshelf': {
        this.zone.run(() => {
          this.router.navigate(['tabs/more/bookshelf'], { queryParams: { deepLink: true, tabSelect: 5 } });
          return;
        });
        break;
      }
      case 'graduate-file': {
        this.zone.run(() => {
          this.router.navigate(['tabs/more/graduate-file'], { queryParams: { tabSelect: 5 } });

          return;
        });
        break;
      }
      case 'employment-view': {
        this.zone.run(() => {
          this.router.navigate(['tabs/more/graduate-file/employment-form'], { queryParams: { tabSelect: 5 } });
          return;
        });
        break;
      }
      case 'learningmaterials': {
        this.zone.run(() => {
          this.router.navigate(
            ['tabs/home/classroom/' + paramsMap['classid'] + '/learning-activities/' + paramsMap['unit']],
            { queryParams: { tabSelect: 1 } }
          );
          return;
        });
        break;
      }
      case 'courseinformation': {
        this.zone.run(() => {
          this.router.navigate(['tabs/home/classroom/' + paramsMap['classid'] + '/course-overview'], {
            queryParams: { tabSelect: 1 },
          });
          return;
        });
        break;
      }
      case 'openinbrowser':
      case 'openinapp': {
        if (gatype === 'exam') {
          if (paramsMap['monitored'] === 'true') {
            this.goToQuestionMark();
            return;
          }
        }
        let href = paramsMap['url'];
        const appId: any = 5;
        this.userService.getSlt(appId).subscribe((token) => {
          token = encodeURIComponent(token);
          href = `${href}${href && href.indexOf('?') < 0 ? '?' : '&'}refApp=mobile&slt=${token}`;

          if (href.indexOf('http') !== 0) {
            while (href.charAt(0) === '/' || href.charAt(0) === ':') {
              href = href.substr(1);
            }
            href = 'https://' + href;
          }

          const isSchoolLink = this.isSchoolLink(href);

          href = href.trim();
          if (
            paramsMap['type'] === 'openinbrowser' ||
            gatype === 'lab' ||
            gatype === 'smarthinking' ||
            gatype === 'simulation' ||
            gatype === 'linkedinlearning'
          ) {
            this.globalConfigs.openUrlOutOfApp(href);
            return;
          } else if (paramsMap['type'] === 'openinapp' || isSchoolLink) {
            this.openUrl(href);
            return;
          } else {
            this.globalConfigs.openUrlOutOfApp(href);
            return;
          }
        });
        break;
      }

      default: {
        break;
      }
    }
  }

  private openUrl(href: string) {
    if (this.globalConfigs.isCordova) {
      this.browserTab
        .isAvailable()
        .then(() => {
          this.browserTab.openUrl(href);
        })
        .catch(() => {
          this.iab.create(href, '_blank').show();
        });
    } else {
      this.globalConfigs.openUrlOutOfApp(href);
    }
  }

  private goToQuestionMark() {
    this.examService.showQuestionMarkAlert();
  }

  private goToClassroom(classId: any, previousUrl: any) {
    this.classService
      .status(classId, false, 0, 0)
      .pipe(first())
      .subscribe((classStatus) => {
        if (classStatus && classStatus.HasAccess) {
          this.router.navigate(['tabs/home/classroom/' + classId], {
            state: {
              previousurl: previousUrl,
            },
            queryParams: { tabSelect: 1 },
          });
        } else {
          if (classStatus && !classStatus.HasAccess) {
            const hold: ClassHoldProps = {
              Title: 'Class Not Accessible',
              Message: classStatus.Message,
            };
            this.presentPopover(hold);
          }
        }
      });
  }

  private presentPopover(classHoldProps: ClassHoldProps) {
    this.examService.presentPopover(classHoldProps);
  }

  private deepLinksTracking(url) {
    try {
      let label: string;

      const queryParams = url.split('?')[1];
      const params = queryParams.split('&');
      let pair = null;
      let gaType;

      params.forEach((d) => {
        pair = d.split('=');
        if (pair[0].toLowerCase() === 'gatype') {
          gaType = pair[1].toLowerCase();
        }
      });

      label = 'File';
      switch (gaType) {
        case 'muse': {
          label = 'MUSE';
          break;
        }
        case 'link': {
          label = 'Link';
          break;
        }
        case 'learningmaterials': {
          label = '';
          break;
        }
        default: {
          break;
        }
      }

      const isCTU = this.globalConfigs.themeId === ThemeId.CTU;
      let view;
      let action = 'Tapped to Access a Learning Material';
      if (isCTU) {
        view = 'Books and Resources';
      } else {
        view = 'Learning Activities';
      }

      if (url.indexOf('ebook') !== -1) {
        try {
          label = url.substring(url.indexOf('ebook/'), url.indexOf('?')).split('ebook/')[1];
        } catch (ex) {}
        action = 'Tapped to Access Vital Source Book';
      }

      this.trackingService.trackEvent({ category: view, view, action, label, value: '' });
    } catch (ex) {}
  }

  private tryConvertUrlToDeepLink(url: string): string {
    let resultUrl = url;
    if (resultUrl) {
      const isSchoolLink =
        url.indexOf('careered.com') > 0 ||
        url.indexOf('aiuniv.edu') > 0 ||
        url.indexOf('coloradotech.edu') > 0 ||
        url.indexOf('ctuonline.edu') > 0 ||
        url.indexOf('aiuonline.edu') > 0;

      if (isSchoolLink) {
        const pathNameWithDomain = url.toLowerCase().trim().slice().split('//')[1];
        const pathName = pathNameWithDomain.slice(pathNameWithDomain.indexOf('/'));

        const regEx = new RegExp(
          '\\/unifiedportal/lms/class/([0-9]+)/assignment/([0-9]+)/group/([0-9]+)/discussionboard'
        );
        const matches = pathName.match(regEx);
        if (matches && matches.length > 0) {
          resultUrl =
            window.cecPreferences['com.careered.customurlscheme'] +
            `://link?Type=db&classId=${matches[1]}&assignmentid=${matches[2]}&postId=${matches[3]}`;
        }
      }
    }

    return resultUrl;
  }

  private isSchoolLink(href: string): boolean {
    return (
      href.indexOf('careered.com') > 0 ||
      href.indexOf('aiuniv.edu') > 0 ||
      href.indexOf('coloradotech.edu') > 0 ||
      href.indexOf('ctuonline.edu') > 0 ||
      href.indexOf('aiuonline.edu') > 0
    );
  }
}
