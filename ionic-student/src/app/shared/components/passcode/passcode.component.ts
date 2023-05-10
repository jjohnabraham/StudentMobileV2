import { Component, Input } from '@angular/core';
import { BaseComponent } from '../base-component/base.component';

@Component({
  selector: 'pec-passcode',
  templateUrl: './passcode.component.html',
  styleUrls: ['./passcode.component.scss'],
})
export class PasscodeComponent extends BaseComponent {
  @Input() options: PecPasscodeOptions;

  public passcode = '';
  public hasError = false;
  public shakeCircles = false;

  private defaultMaxLength = 4;
  private processing = false;

  constructor() {
    super();
  }

  onDeleteKeyClick() {
    this.passcode = this.passcode.substr(0, this.passcode.length - 1);
  }

  onKeyClick(key: number) {
    if (this.processing) {
      return;
    }

    if (this.passcode.length < this.getPassCodeMaxLength()) {
      this.passcode += key;
    }

    if (this.passcode.length === this.getPassCodeMaxLength() && this.options.onComplete) {
      const promise = this.options.onComplete(this.passcode);

      if (promise) {
        this.processing = true;

        promise.then(
          () => {
            setTimeout(() => {
              this.processing = false;
              this.passcode = '';
            }, 250);
          },
          () => {
            this.shakeCircles = true;
            this.hasError = true;

            setTimeout(() => {
              this.processing = false;

              this.passcode = '';
              this.shakeCircles = false;
            }, 500);
          }
        );
      }
    }
  }

  getPassCodeMaxLength() {
    return this.options.length > 0 ? this.options.length : this.defaultMaxLength;
  }

  getIndicatorArray() {
    let i = 0;
    return Array(this.getPassCodeMaxLength())
      .fill(1)
      .map((x) => {
        i = i + 1;
        return i;
      });
  }
}

export interface PecPasscodeOptions {
  title: string;
  passcodeError?: string;
  length?: number;
  onComplete?(passcode: string): Promise<void>;
  onLoginClick?(): void;
}
