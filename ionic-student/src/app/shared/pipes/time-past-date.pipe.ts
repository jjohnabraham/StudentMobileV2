import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'pecTimePastDate',
})
export class TimePastDatePipe implements PipeTransform {
  public transform(dateString: string) {
    const date = moment(dateString);
    if (!dateString || !date.isValid()) {
      return '';
    }

    const today = moment();
    const diffMinutes = today.diff(date, 'minutes');

    if (diffMinutes <= 1) {
      return 'Now';
    } else if (diffMinutes <= 60 * 24 && date.date() === today.date()) {
      return date.toDate().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    } else if (
      diffMinutes <= 60 * 24 * 7 &&
      date.toDate().toLocaleString('en-US', { weekday: 'long' }) !==
        today.toDate().toLocaleString('en-US', { weekday: 'long' })
    ) {
      return date.toDate().toLocaleString('en-US', { weekday: 'long' });
    } else if (date.year() === today.year()) {
      return date.toDate().toLocaleString('en-US', { month: 'long', day: 'numeric' });
    } else {
      return date.toDate().toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
    }
  }
}
