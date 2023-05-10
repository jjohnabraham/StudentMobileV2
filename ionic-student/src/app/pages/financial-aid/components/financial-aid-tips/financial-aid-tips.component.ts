import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FinancialAidService } from 'src/app/data/services/financial-aid.service';
import { UserService } from 'src/app/data/services/user.service';
import { Payment } from 'src/app/data/types/financial-aid.type';
import { User } from 'src/app/data/types/user.type';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { TrackingService } from 'src/app/shared/services/tracking.service';

@Component({
  selector: 'pec-financial-aid-tips',
  templateUrl: './financial-aid-tips.component.html',
  styleUrls: ['./financial-aid-tips.component.scss'],
})
export class FinancialAidTipsComponent extends BaseComponent implements OnInit {
  @Input() refresh: boolean;
  @Output() loadingFinished: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() errorOnLoad: EventEmitter<string> = new EventEmitter<string>();
  public showLoading: boolean;
  public financialAidTips: string;
  public message: string;
  public user: User;
  constructor(
    private userService: UserService,
    private financialAidService: FinancialAidService,
    private trackingService: TrackingService
  ) {
    super();
  }

  ngOnInit() {
    this.beginLoad(this.refresh);
  }

  private beginLoad(refresh: boolean) {
    if (!this.subscriptions.userInfo) {
      this.showLoading = true;
      this.subscriptions.userInfo = this.userService.info({ refresh }).subscribe(
        (user) => {
          this.user = user;

          if (!this.subscriptions.fatips) {
            this.subscriptions.fatips = this.financialAidService
              .financialAidTips(this.user.SourceSystemId, this.user.SyCampusId)
              .subscribe(
                (message) => {
                  this.financialAidTips = message.Message;
                  this.getMessage(this.financialAidTips);
                  this.showLoading = false;
                  this.loadingFinished.emit(true);
                },
                (error) => {
                  this.trackingService.trackEvent({
                    view: 'Financial Aid View',
                    category: 'System Errors',
                    action: 'ErrorCode : FATIPS',
                    label: 'Financial Page',
                    value: '',
                  });

                  this.errorOnLoad.emit('FATIPS');

                  setTimeout(() => {
                    if (this.subscriptions.fatips) {
                      this.subscriptions.fatips.unsubscribe();
                      delete this.subscriptions.fatips;
                    }
                  }, 0);
                }
              );
          }
        },
        (error) => {
          this.errorOnLoad.emit('USERINFO');
          this.trackingService.trackEvent({
            view: 'Financial Aid View',
            category: 'System Errors',
            action: 'ErrorCode : USERINFO',
            label: 'Financial Page',
            value: '',
          });

          setTimeout(() => {
            if (this.subscriptions.userInfo) {
              this.subscriptions.userInfo.unsubscribe();
              delete this.subscriptions.userInfo;
            }
          }, 0);
        }
      );
    }
  }

  private getMessage(text: string) {
    const urls = /(\b(https?|ftp):\/\/[A-Z0-9+&@#\/%?=~_|!:,.;-]*[-A-Z0-9+&@#\/%=~_|])/gim;
    if (text.match(urls)) {
      text = text.replace(
        urls,
        "<a href='#' onClick=\"event.preventDefault();window['cordova']['InAppBrowser']['open']('$1', '_system', 'location=no,hidden=yes') \">$1</a>"
      );
    }
    this.message = text;
  }
}
