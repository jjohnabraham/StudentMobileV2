import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pecTextCountdown',
})
export class TextCountdownPipe implements PipeTransform {
  transform(text: string, maxLength: number = 0) {
    if (text) {
      return maxLength - text.length;
    } else {
      return maxLength;
    }
  }
}
