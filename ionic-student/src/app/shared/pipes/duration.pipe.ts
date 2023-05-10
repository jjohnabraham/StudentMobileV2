import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pecDuration',
})
export class DurationPipe implements PipeTransform {
  transform(value: number): string {
    if (!value) {
      return '';
    }

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    let result = `${minutes.toString()} min ${seconds.toString()} secs`;
    if (!!hours) {
      result = `${hours.toString()} hr ${minutes.toString()} min ${seconds.toString()} secs`;
    }

    return result;
  }
}
