import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pecPhoneLink',
})
export class PhoneLinkPipe implements PipeTransform {
  transform(value: string) {
    if (value) {
      const regExp = /((\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4})/gim;
      const phoneNo = value.replace(/[^\d]/g, '');

      return value.replace(
        regExp,
        '<a class="pec-phone-link" href="tel:+1' + phoneNo.slice(phoneNo.length - 10) + '">$1</a>'
      );
    }

    return value;
  }
}
