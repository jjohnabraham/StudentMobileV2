import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'ion-input[pecLimitTo]',
})
export class LimitToDirective {
  @Input() pecLimitTo: number;

  @HostListener('keypress', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const limit = this.pecLimitTo;
    const input = event.target as HTMLInputElement;
    if (input.value.length >= limit) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }
}
