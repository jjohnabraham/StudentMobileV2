import { Directive, ElementRef, Input } from '@angular/core';
import { ViewDidEnter } from '@ionic/angular';

@Directive({
  selector: '[pecTransition]',
})
export class TransitionDirective implements ViewDidEnter {
  @Input() pecTransitionTime = 300;
  @Input() pecTransitionDistanceY: number;
  @Input() pecTransitionType: TransitionType = 'fadeup';

  constructor(private el: ElementRef) {}

  public ionViewDidEnter() {
    this.startTransition();
  }

  private startTransition(reverse: boolean = false) {
    if (this.el && this.el.nativeElement) {
      const rect = this.el.nativeElement.getBoundingClientRect();
      const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

      if ((rect.top !== 0 || rect.bottom !== 0) && (rect.bottom > 0 || rect.top < viewHeight)) {
        const startX = 0;
        let startY = 0;
        const startZ = 0;
        const endX = 0;
        let endY = 0;
        const endZ = 0;
        let startOpacity = '1';
        let endOpacity = '1';

        if (this.pecTransitionType.indexOf('fade') === 0) {
          startOpacity = '0';

          if (reverse) {
            startOpacity = '1';
            endOpacity = '0';
          }
        }

        if (this.pecTransitionType === 'fadeup' || this.pecTransitionType === 'moveup') {
          if (reverse) {
            if (this.pecTransitionDistanceY) {
              endY = this.pecTransitionDistanceY;
            } else {
              endY = viewHeight - rect.top;
            }
          } else {
            if (this.pecTransitionDistanceY) {
              startY = this.pecTransitionDistanceY;
            } else {
              startY = viewHeight - rect.top;
            }
          }
        } else if (this.pecTransitionType === 'fadedown' || this.pecTransitionType === 'movedown') {
          if (reverse) {
            if (this.pecTransitionDistanceY) {
              endY = -1 * this.pecTransitionDistanceY;
            } else {
              endY = 0 - rect.top - rect.height;
            }
          } else {
            if (this.pecTransitionDistanceY) {
              startY = -1 * this.pecTransitionDistanceY;
            } else {
              startY = 0 - rect.top - rect.height;
            }
          }
        }

        this.el.nativeElement.style.transform = `translate3d(${startX}px, ${startY}px, ${startZ}px)`;
        this.el.nativeElement.style.opacity = startOpacity;

        this.el.nativeElement.style.removeProperty('transition');
        this.el.nativeElement.style.removeProperty('-webkit-transition');

        setTimeout(() => {
          const cssTransitionTime = (this.pecTransitionTime / 1000).toFixed(3);

          this.el.nativeElement.style.opacity = endOpacity;
          this.el.nativeElement.style.transform = `translate3d(${endX}px, ${endY}px, ${endZ}px)`;

          this.el.nativeElement.style.transition = `transform ${cssTransitionTime}s ease-out, opacity ${cssTransitionTime}s ease-out`;
          this.el.nativeElement.style.setProperty(
            '-webkit-transition',
            `transform ${cssTransitionTime}s ease-out, opacity ${cssTransitionTime}s ease-out`
          );

          if (endX === 0 && endY === 0 && endZ === 0 && endOpacity === '1') {
            setTimeout(() => {
              this.el.nativeElement.style.removeProperty('transition');
              this.el.nativeElement.style.removeProperty('-webkit-transition');

              this.el.nativeElement.style.removeProperty('opacity');
              this.el.nativeElement.style.removeProperty('transform');
            }, this.pecTransitionTime);
          }
        }, 0);
      }
    }
  }
}

export type TransitionType = 'fadeup' | 'moveup' | 'fadedown' | 'movedown';
