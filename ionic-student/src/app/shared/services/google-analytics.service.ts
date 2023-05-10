/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { Injectable } from '@angular/core';
import { GlobalConfigsService } from './global-configs.service';
import { HashProviderService } from './hash-provider.service';
import { ThemeId } from '../enums/theme-id.enum';
import { GaEvent, GaException, GaTiming, GaUser, GaView } from './tracking.service';

// eslint-disable-next-line @typescript-eslint/ban-types
declare let ga: Function;

// eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/naming-convention
declare let ga_dev: Function;

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsService {
  public isGaReady = false;
  public lastView: GaView;
  public currentUser: GaUser;

  constructor(private globalConfigs: GlobalConfigsService, private hashService: HashProviderService) {}

  public initAnalytics() {
    const gaPecId = 'UA-58507729-';
    let gaCtu;
    let gaAiu;

    if (this.globalConfigs.environment === 'dev') {
      gaCtu = '33';
      gaAiu = '34';
    }

    if (this.globalConfigs.environment === 'int') {
      gaCtu = '35';
      gaAiu = '36';
    }

    if (this.globalConfigs.environment === 'reg') {
      gaCtu = '37';
      gaAiu = '38';
    }

    let uaPropertyId;
    if (this.globalConfigs.environment === 'prod') {
      if (this.globalConfigs.themeId === ThemeId.CTU) {
        uaPropertyId = 'UA-54437226-13';
      } else if (this.globalConfigs.themeId === ThemeId.AIU) {
        uaPropertyId = 'UA-56976903-6';
      }
    } else {
      if (this.globalConfigs.themeId === ThemeId.CTU) {
        uaPropertyId = gaPecId + gaCtu;
      } else if (this.globalConfigs.themeId === ThemeId.AIU) {
        uaPropertyId = gaPecId + gaAiu;
      }
    }

    let uuid = this.globalConfigs.deviceSpecificId;
    if (!uuid) {
      try {
        const uuidStorage = window.localStorage.getItem('uuidStorage');
        if (uuidStorage === null) {
          uuid = this.hashService.getHash();
          window.localStorage.setItem('uuidStorage', uuid);
        } else {
          uuid = uuidStorage;
        }
      } catch (err) {
        console.log('error: ' + err);
      }
    }

    (function (i, s, o: 'script', g, r: 'ga_dev', a?: HTMLScriptElement, m?: Element) {
      // @ts-ignore
      i.GoogleAnalyticsObject = r;
      i[r] =
        i[r] ||
        function () {
          (i[r].q = i[r].q || []).push(arguments);
        };
      i[r].l = new Date().getTime();
      a = s.createElement(o);
      m = s.getElementsByTagName(o)[0];
      a.async = true;
      a.src = g;
      if (m.parentNode !== null) {
        m.parentNode.insertBefore(a, m);
      }
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga_dev');

    (function (i, s, o: 'script', g, r: 'ga', a?: HTMLScriptElement, m?: Element) {
      // @ts-ignore
      i.GoogleAnalyticsObject = r;
      i[r] =
        i[r] ||
        function () {
          (i[r].q = i[r].q || []).push(arguments);
        };
      i[r].l = new Date().getTime();
      a = s.createElement(o);
      m = s.getElementsByTagName(o)[0];
      a.async = true;
      a.src = g;
      if (m.parentNode !== null) {
        m.parentNode.insertBefore(a, m);
      }
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    ga_dev('create', uaPropertyId, { storage: 'none', clientId: uuid });
    ga_dev('set', 'checkProtocolTask', null);
    ga_dev('set', 'forceSSL', true);
    ga_dev('set', 'transport', 'image');
    ga_dev('set', 'appName', this.globalConfigs.appName);
    ga_dev('set', 'appId', this.globalConfigs.packageName);
    ga_dev('set', 'appVersion', this.globalConfigs.version);
    ga_dev('set', 'location', this.globalConfigs.trackingUrl);

    ga('create', uaPropertyId, { storage: 'none', clientId: uuid });
    ga('set', 'checkProtocolTask', null);
    ga('set', 'forceSSL', true);
    ga('set', 'transport', 'image');
    ga('set', 'appName', this.globalConfigs.appName);
    ga('set', 'appId', this.globalConfigs.packageName);
    ga('set', 'appVersion', this.globalConfigs.version);

    const split = window.location.hostname.split('.');
    let domain = '';

    if (split && split.length) {
      if (split.length >= 2) {
        domain = `.${split[split.length - 2]}.${split[split.length - 1]}`;
      } else {
        domain = split[0];
      }
    }

    // Ported from previous version, purpose unknown
    document.cookie = `_ga=; Domain=${domain}; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    document.cookie = `_gid=; Domain=${domain}; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;

    this.isGaReady = true;
  }

  public sendEvent(view: string, event: GaEvent) {
    const o = this.getBase(view, event.classId, event.courseId);
    const e: any = {
      ...o,
      hitType: 'event',
      eventCategory: event.category,
      eventAction: event.action,
    };

    if (event.label) e.eventLabel = event.label;
    if (event.value) e.eventValue = event.value;
    ga('send', e);
  }

  public sendException(ex: GaException) {
    const o = this.getBase();

    ga('send', {
      ...o,
      hitType: 'exception',
      exDescription: ex.description,
      exFatal: ex.fatal,
    });
  }

  public sendTiming(timing: GaTiming) {
    const o = this.getBase();

    ga('send', {
      ...o,
      hitType: 'timing',
      timingCategory: timing.category,
      timingVar: timing.var,
      timingValue: timing.value,
      timingLabel: timing.label,
    });
  }

  public sendScreenView(view: GaView) {
    const o = this.getBase(view.view, view.classId, view.courseId);

    ga('send', {
      ...o,
      hitType: 'screenview',
      screenName: view.view,
    });
  }

  public setValue(key: string, value: string) {
    ga('set', key, value);
  }

  public updateDimensions(user: GaUser) {
    if (this.isGaReady) {
      if (this.globalConfigs.ssid) {
        this.setValue('dimension1', `${this.globalConfigs.ssid}`);
      } else {
        this.setValue('dimension1', '0');
      }

      if (this.globalConfigs.sycampusid) {
        this.setValue('dimension2', `${this.globalConfigs.sycampusid}`);
      } else {
        this.setValue('dimension2', '0');
      }

      if (user && user.systudentid) {
        this.setValue('dimension3', `${user.systudentid}`);
      } else {
        this.setValue('dimension3', '0');
      }

      if (user && user.systaffid) {
        this.setValue('dimension4', `${user.systaffid}`);
      } else {
        this.setValue('dimension4', '0');
      }

      if (user && user.demo) {
        this.setValue('dimension7', 'true');
      } else {
        this.setValue('dimension7', 'false');
      }

      if (user && user.impersonated) {
        this.setValue('dimension9', 'true');
      } else {
        this.setValue('dimension9', 'false');
      }

      if (user && user.sessionid) {
        this.setValue('dimension10', `${user.sessionid}`);
      } else {
        this.setValue('dimension10', '0');
      }
    }
  }

  private getBase(view?: string, classId?: number, courseId?: number) {
    let v = '';

    if (!v && view) {
      v = view;
    }

    if (!v && this.lastView && this.lastView.view) {
      v = this.lastView.view;
    }

    const o = {
      screenName: v,
      appName: this.globalConfigs.appName,
      appId: this.globalConfigs.packageName,
      appVersion: this.globalConfigs.version,
      page: v,
      location: this.globalConfigs.trackingUrl,
      title: v,
      userId: this.currentUser?.userid,
    };

    this.updateViewDimensions(view, classId, courseId);

    return o;
  }

  private updateViewDimensions(view?: string, classId?: number, courseId?: number) {
    if (classId) {
      this.setValue('dimension5', `${classId}`);
    } else if (!view && this.lastView && this.lastView.classId) {
      this.setValue('dimension5', `${this.lastView.classId}`);
    } else {
      this.setValue('dimension5', '0');
    }

    if (courseId) {
      this.setValue('dimension8', `${courseId}`);
    } else if (!view && this.lastView && this.lastView.courseId) {
      this.setValue('dimension8', `${this.lastView.courseId}`);
    } else {
      this.setValue('dimension8', '0');
    }
  }
}
