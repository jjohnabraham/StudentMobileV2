import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PecHttpService } from '../services/pec-http.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Pipe({
  name: 'pecAssetBase64',
})
export class AssetBase64Pipe implements PipeTransform, OnDestroy {
  private latestValue: SafeUrl = null;
  private latestReturnedValue: SafeUrl = null;
  private subscription: Subscription = null;
  private observable: Observable<SafeUrl> = null;

  private previousUrl: string;
  private result: BehaviorSubject<SafeUrl> = new BehaviorSubject(null);
  private resultObservable: Observable<SafeUrl> = this.result.asObservable();
  private internalSubscription: Subscription = null;

  constructor(private http: PecHttpService, private sanitizer: DomSanitizer, private ref: ChangeDetectorRef) {}

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.dispose();
    }
  }

  public transform(url: string, signature?: string) {
    const observable = this.internalTransform(url, signature);

    return this.asyncTransform(observable);
  }

  private internalTransform(url: string, signature: string) {
    if (!url) {
      return this.resultObservable;
    }

    if (this.previousUrl !== url) {
      this.previousUrl = url;
      this.internalSubscription = this.http
        .request({
          url,
          method: 'Get',
          signature: signature || url,
          requestType: 2,
          config: {
            cache: true,
          },
        })
        .subscribe(
          (m) => {
            if (m) {
              const sanitized = this.sanitizer.bypassSecurityTrustUrl(m);
              this.result.next(sanitized);
            }
          },
          () => this.result.next('')
        );
    }

    return this.resultObservable;
  }

  private asyncTransform(observable: Observable<SafeUrl>) {
    if (!this.observable) {
      if (observable) {
        this.subscribe(observable);
      }

      this.latestReturnedValue = this.latestValue;

      return this.latestValue;
    }

    if (observable !== this.observable) {
      this.dispose();
      return this.asyncTransform(observable);
    }

    if (this.latestValue === this.latestReturnedValue) {
      return this.latestReturnedValue;
    }

    this.latestReturnedValue = this.latestValue;

    return this.latestValue;
  }

  private subscribe(observable: Observable<SafeUrl>) {
    this.observable = observable;

    this.subscription = observable.subscribe(
      (value) => this.updateLatestValue(observable, value),
      (e) => {
        throw e;
      }
    );
  }

  private dispose() {
    this.subscription.unsubscribe();
    this.internalSubscription.unsubscribe();
    this.internalSubscription = null;
    this.latestValue = null;
    this.latestReturnedValue = null;
    this.subscription = null;
    this.observable = null;
  }

  private updateLatestValue(async: Observable<SafeUrl>, value: SafeUrl) {
    if (async === this.observable) {
      this.latestValue = value;
      this.ref.markForCheck();
    }
  }
}
