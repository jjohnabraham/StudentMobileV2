import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScreenOrientationService {
  private readonly screen: Screen;

  constructor() {
    if (window.screen) {
      this.screen = window.screen;
    }
  }

  public lockScreenOrientation(screenOrientation: ScreenOrientation = ScreenOrientation.Portrait) {
    if (!this.screen || !this.screen.orientation || !this.screen.orientation.lock) {
      return false;
    }

    const orientation: OrientationLockType =
      screenOrientation === ScreenOrientation.Portrait ? 'portrait' : 'landscape';
    this.screen.orientation.lock(orientation);

    return true;
  }

  public unlockScreenOrientation() {
    if (!this.screen || !this.screen.orientation || !this.screen.orientation.unlock) {
      return false;
    }

    this.screen.orientation.unlock();

    return true;
  }
}

export enum ScreenOrientation {
  Portrait = 1,
  Landscape = 2,
}
