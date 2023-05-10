import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ClassHoldComponent } from '../components/class-hold/class-hold.component';
import { PecPopOverService } from '../../../shared/services/pec-popover.service';

@Injectable({
  providedIn: 'root',
})
export class ExamService {
  private holdPopover: HTMLIonPopoverElement;

  constructor(public popoverCtrl: PecPopOverService) {}

  public showQuestionMarkAlert() {
    const hold: ClassHoldProps = {
      Title: 'Exam Not Available on Mobile Device',
      Message: 'This exam is not available on a mobile device and must be completed on a desktop computer.',
    };

    this.presentPopover(hold);
  }

  presentPopover(holds: ClassHoldProps) {
    this.popoverCtrl
      .show({
        component: ClassHoldComponent,
        componentProps: {
          holds,
        },
      })
      .then((popover) => {
        this.holdPopover = popover;

        this.holdPopover.onDidDismiss().then(() => {
          delete this.holdPopover;
        });
      });
  }
}

export interface ClassHoldProps {
  Title: string;
  Message: string;
}
