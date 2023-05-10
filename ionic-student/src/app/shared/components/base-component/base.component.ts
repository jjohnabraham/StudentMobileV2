import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'pec-base',
  templateUrl: './base.component.html',
})
export class BaseComponent implements OnDestroy {
  public subscriptions: { [key: string]: Subscription } = {};
  public clearSubscriptions() {
    for (const key in this.subscriptions) {
      if (this.subscriptions[key] && this.subscriptions[key].unsubscribe) {
        this.subscriptions[key].unsubscribe();
        delete this.subscriptions[key];
      }
    }
  }
  ngOnDestroy(): void {
    this.clearSubscriptions();
  }
}
