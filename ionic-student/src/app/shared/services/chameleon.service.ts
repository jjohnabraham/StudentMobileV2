import { Injectable } from '@angular/core';
import * as chameleon from '@chamaeleonidae/chmln';
import { User } from '../../data/types/user.type';
import { MobileService } from '../../data/services/mobile.service';
import { first } from 'rxjs/operators';
import { GlobalConfigsService } from './global-configs.service';
import { UserService } from '../../data/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class ChameleonService {
  private chameleonIsEnabled = false;
  private currentUser: User;
  private identifyPending: boolean;

  constructor(
    private mobileService: MobileService,
    private globalConfigs: GlobalConfigsService,
    private userService: UserService
  ) {}

  public init() {
    this.mobileService
      .campusSettings()
      .pipe(first())
      .subscribe((settings) => {
        if (
          settings?.Settings?.IsChameleonEnabled === 'true' &&
          !this.globalConfigs.isDevelopment &&
          !this.globalConfigs.isLocalhost
        ) {
          this.chameleonIsEnabled = true;
          chameleon.init(this.globalConfigs.chameleonKey);
          if (this.identifyPending) {
            this.identifyUser();
          }
        }
      });
  }

  public identifyUser() {
    if (!this.chameleonIsEnabled || !window.chmln) {
      this.identifyPending = true;
      return;
    }

    const identify = () => {
      chameleon.identify(this.currentUser.LmsUserId, {
        email: this.currentUser.EmailAddress,
        name: this.currentUser.FirstName + ' ' + this.currentUser.LastName,
        themeId: this.globalConfigs.themeId,
        campusId: this.globalConfigs.sycampusid,
        environment: this.globalConfigs.environment,
      });
    };

    window.chmln.on('after:profile', () => {
      this.globalConfigs.chameleonId = window.chmln.data.profile.id;
    });

    if (!this.currentUser) {
      this.userService
        .info()
        .pipe(first())
        .subscribe((user) => {
          this.currentUser = user;
          identify();
        });
    } else {
      identify();
    }
  }
}
