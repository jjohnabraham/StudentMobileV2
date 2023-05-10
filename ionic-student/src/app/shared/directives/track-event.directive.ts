import { Directive, HostListener, Input } from '@angular/core';
import { GaEvent, TrackingService } from '../services/tracking.service';

@Directive({
  selector: '[pecTrackEvent]',
})
export class TrackEventDirective {
  @Input() pecTrackEvent: GaEvent;

  constructor(private trackingService: TrackingService) {}

  @HostListener('click', ['$event']) onClick($event) {
    if (this.pecTrackEvent && this.pecTrackEvent.category) {
      this.trackingService.trackEvent(this.pecTrackEvent);
    }
  }
}
