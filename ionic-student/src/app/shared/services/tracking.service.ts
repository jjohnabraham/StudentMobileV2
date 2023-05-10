import { Injectable } from '@angular/core';
import { HashProviderService } from './hash-provider.service';
import { GlobalConfigsService } from './global-configs.service';
import { GoogleAnalyticsService } from './google-analytics.service';
import { CampusId } from '../enums/campus-id.enum';

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  private gaQueue: { views: GaView[]; timings: GaTiming[] };

  constructor(
    private globalConfig: GlobalConfigsService,
    private hashService: HashProviderService,
    private gaService: GoogleAnalyticsService
  ) {
    this.gaQueue = {
      views: [],
      timings: [],
    };
  }

  public trackView(view: GaView) {
    if (this.gaService.isGaReady && view && view.view && this.gaService.currentUser) {
      if (
        this.gaService.lastView &&
        this.gaService.lastView.view === view.view &&
        (this.gaService.lastView.classId || 0) === (view.classId || 0) &&
        (this.gaService.lastView.courseId || 0) === (view.courseId || 0)
      ) {
        return;
      }

      this.gaService.lastView = view;

      this.gaService.sendScreenView(view);
    } else {
      this.gaQueue.views.push(view);
    }
  }

  public trackUser(user: GaUser) {
    if (user && user.userid && this.gaService.isGaReady) {
      if (!this.gaService.currentUser || this.gaService.currentUser.userid !== user.userid) {
        this.gaService.currentUser = user;
        this.gaService.updateDimensions(user);
        this.gaService.setValue('userId', `${this.gaService.currentUser.userid}`);

        this.gaQueue.views.forEach((v) => this.trackView(v));
        this.gaQueue.timings.forEach((t) => this.trackTiming(t));

        this.gaQueue.views = [];
        this.gaQueue.timings = [];
      }
    }
  }

  public trackEvent(event: GaEvent) {
    if (this.gaService.isGaReady) {
      let view = event.view;

      if (!view && this.gaService.lastView && this.gaService.lastView.view) {
        view = this.gaService.lastView.view;
      }

      if (!view && event.category) {
        view = event.category;
      }

      this.gaService.sendEvent(view, event);
    }
  }

  public trackTiming(timing: GaTiming) {
    if (this.gaService.isGaReady && this.gaService.currentUser) {
      this.gaService.sendTiming(timing);
    } else {
      this.gaQueue.timings.push(timing);
    }
  }

  public trackException(ex: GaException) {
    if (this.gaService.isGaReady && this.gaService.currentUser) {
      this.gaService.sendException(ex);
    }
  }
}

export interface GaView {
  view: string;
  classId?: number;
  courseId?: number;
}

export interface GaUser {
  userid: string;
  systaffid: number;
  systudentid: number;
  ssid: number;
  sycampusid: CampusId;
  demo: boolean;
  impersonated: boolean;
  sessionid: string;
}

export interface GaEvent {
  category: string;
  action?: string;
  label?: string;
  value?: string;
  view?: string;
  classId?: number;
  courseId?: number;
}

export interface GaTiming {
  category: string;
  var?: string;
  value?: number;
  label?: string;
}

export interface GaException {
  description: string;
  fatal: boolean;
}
