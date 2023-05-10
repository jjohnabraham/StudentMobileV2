import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Observable, Subscription, zip } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { PecHttpService } from '../services/pec-http.service';
import { MobileService } from '../../data/services/mobile.service';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'pecUrlToken',
})
export class UrlTokenPipe implements PipeTransform, OnDestroy {
  private subscription: Subscription;

  constructor(private sanitized: DomSanitizer, private mobileService: MobileService, private http: PecHttpService) {}

  public transform(value: string) {
    return new Observable<string>((subscriber) => {
      const appId = 5;
      const combinedObservables = zip(
        this.mobileService.campusSettings(),
        this.http.request({
          url: `api/slt?oa=${appId}`,
          signature: 'api/slt?oa=${appId}',
          method: 'Get',
          config: {
            cache: false,
          },
        })
      );

      this.subscription = combinedObservables
        .pipe(
          map(([settings, token]) => {
            if (!settings || !settings.Settings || !settings.Settings.LmsUrl) {
              return;
            }

            const lmsUrl =
              settings.Settings.LmsUrl.substr(-settings.Settings.LmsUrl.length) === '/'
                ? settings.Settings.LmsUrl
                : `${settings.Settings.LmsUrl}/`;

            const sanitized = this.sanitized.bypassSecurityTrustHtml(value).toString();

            subscriber.next(this.lmsLink(sanitized, lmsUrl, token));
          })
        )
        .subscribe();
    });
  }

  public ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private lmsLink(htmlText, lmsUrl: string, token: string) {
    let replacedText = htmlText.toString();
    let patternUnifiedPortal = new RegExp('UnifiedPortal/', 'i');
    const replacePatternTop = 'SafeValue must use [property]=binding:';
    const replacePatternBottom = '(see https://g.co/ng/security#xss)';
    const lmsUrlNoUP = lmsUrl.replace(patternUnifiedPortal, '');
    const replacePatternAllUrls = new RegExp(
      '(?:(?:https?|ftp|file)://|www.|ftp.)(?:([-A-Z0-9+&@#/%=~_|$?!:,.]*)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:([-A-Z0-9+&@#/%=~_|$?!:,.]*)|[A-Z0-9+&@#/%=~_|$])',
      'igm'
    );

    const hasURL = replacePatternAllUrls.test(htmlText);
    if (!hasURL) {
      return htmlText;
    }

    // Check if html has any LMS urls
    replacedText = replacedText.replace(replacePatternAllUrls, (match) => {
      let newUrl;
      patternUnifiedPortal = new RegExp('/UnifiedPortal/', 'i');
      const patternLms = new RegExp(lmsUrlNoUP, 'igm');

      const patternQMark = new RegExp('\\?', 'i');
      const isQMark = patternQMark.test(match);

      const patternHashMark = new RegExp('#', 'i');
      const isHashMark = patternHashMark.test(match);

      const hasUPUrl: boolean = patternUnifiedPortal.test(match);
      const hasProperUrl: boolean = patternLms.test(match);

      if (hasUPUrl) {
        if (isQMark && !isHashMark) {
          newUrl = match + '&slt=' + encodeURIComponent(token) + '&refApp=mobile';
        } else if (!isQMark && isHashMark) {
          const matchArray = match.split(patternHashMark);
          newUrl = matchArray[0] + '?slt=' + encodeURIComponent(token) + '&refApp=mobile' + '#' + matchArray[1];
        } else if (isQMark && isHashMark) {
          const matchArray = match.split(patternHashMark);
          newUrl = matchArray[0] + '&slt=' + encodeURIComponent(token) + '&refApp=mobile' + '#' + matchArray[1];
        } else {
          newUrl = match + '?slt=' + encodeURIComponent(token) + '&refApp=mobile';
        }
      } else if (hasProperUrl) {
        newUrl =
          lmsUrl +
          'ConexusRedirect?url=' +
          encodeURIComponent(match) +
          '&slt=' +
          encodeURIComponent(token) +
          '&refApp=mobile';
      } else {
        newUrl = match;
      }

      return newUrl;
    });

    replacedText = replacedText.replace(replacePatternTop, '');
    replacedText = replacedText.replace(replacePatternBottom, '');

    return replacedText;
  }
}
