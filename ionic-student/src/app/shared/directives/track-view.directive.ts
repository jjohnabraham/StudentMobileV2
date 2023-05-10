import { Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { GaView, TrackingService } from '../services/tracking.service';
import { ViewDidEnter } from '@ionic/angular';

@Directive({
  selector: '[pecTrackView]',
})
export class TrackViewDirective implements ViewDidEnter, OnChanges {
  @Input() pecTrackView: GaView;

  constructor(private trackingService: TrackingService) {}

  public ionViewDidEnter() {
    this.trackView();
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.trackView();
  }

  private trackView() {
    if (this.pecTrackView && this.pecTrackView.view) {
      this.trackingService.trackView(this.pecTrackView);
    }
  }
}
