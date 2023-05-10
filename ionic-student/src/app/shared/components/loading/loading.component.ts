import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'pec-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements AfterViewInit {
  @Output() expired: EventEmitter<void> = new EventEmitter<void>();

  constructor() {}

  public ngAfterViewInit() {
    setTimeout(() => {
      this.expired.emit();
    }, 3000);
  }
}
