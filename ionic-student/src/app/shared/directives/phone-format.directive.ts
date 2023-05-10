import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: 'ion-input[pecPhoneFormat]',
})
export class PhoneFormatDirective {
  @HostListener('ionInput', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    let trimmed = input.value.replace(/\D/g, '').trim();

    if (trimmed.length > 10) {
      trimmed = trimmed.substr(0, 10);
    } else if (trimmed.length === 0) {
      return;
    }

    let result = '';
    const numbers = [];
    numbers.push(trimmed.substr(0, 3));
    if (trimmed.substr(3, 3) !== '') numbers.push(trimmed.substr(3, 3));
    if (trimmed.substr(6, 4) !== '') numbers.push(trimmed.substr(6, 4));

    if (trimmed.length <= 3) {
      result = numbers[0];
    } else if (trimmed.length <= 6) {
      result = `(${numbers[0]}) ${numbers[1]}`;
    } else {
      result = `(${numbers[0]}) ${numbers[1]}-${numbers[2]}`;
    }

    input.value = result;
  }
}
