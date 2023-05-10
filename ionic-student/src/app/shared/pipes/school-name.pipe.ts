import { Pipe, PipeTransform } from '@angular/core';
import { GlobalConfigsService } from '../services/global-configs.service';

@Pipe({
  name: 'pecSchoolName',
})
export class SchoolNamePipe implements PipeTransform {
  private readonly schoolSelector: string;

  constructor(private globalConfigs: GlobalConfigsService) {
    this.schoolSelector =
      this.globalConfigs.brandName === 'CTU' ? 'Colorado Technical University' : 'American InterContinental University';
  }

  transform(value: string): string {
    const replacePattern = /{{SchoolName}}/g;

    return value.replace(replacePattern, this.schoolSelector);
  }
}
