import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { SchoolService } from '../../data/services/school.service';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { first } from 'rxjs/operators';
import { SchoolInfo } from '../../data/types/school.type';

@Pipe({
  name: 'pecDate',
})
@Injectable({
  providedIn: 'root',
})
export class PecDatePipe implements PipeTransform {
  private school: SchoolInfo;
  private initialized: boolean;

  constructor(private schoolService: SchoolService, private datePipe: DatePipe) {}

  transform(value: Date | string | number, pattern?: string) {
    return new Observable<string>((subscriber) => {
      if (!value) {
        subscriber.next('');
        return;
      }

      const getDateFromSchool = () => {
        const v: Date = moment(value).toDate();

        if (!pattern) {
          const schoolDate = moment(this.school ? this.school.schoolToLocalDate(v) : v);
          const now = moment(new Date());

          const diffDays = now.diff(schoolDate, 'days', true);
          if (diffDays < 1 && diffDays >= 0) {
            subscriber.next('Today');
            return;
          }

          if (diffDays >= 1) {
            subscriber.next('Yesterday');
            return;
          }

          pattern = 'M/d/yy';
        }

        subscriber.next(this.datePipe.transform(v, pattern));
      };

      if (!this.initialized) {
        this.initialized = true;

        this.schoolService
          .info()
          .pipe(first())
          .subscribe((info) => {
            this.school = info;
            getDateFromSchool();
          });
      } else {
        getDateFromSchool();
      }
    });
  }
}
