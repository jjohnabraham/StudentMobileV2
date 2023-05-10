import { Directive, HostListener, Input } from '@angular/core';
import { GlobalConfigsService } from '../services/global-configs.service';
import { AlertController, ToastController } from '@ionic/angular';
import { Calendar } from '@ionic-native/calendar/ngx';
import { PecEvent } from '../../data/services/meeting.service';

@Directive({
  selector: '[pecAddToCalendar]',
})
export class AddToCalendarDirective {
  @Input('pecAddToCalendar') pecEvent: PecEvent;
  private alert: HTMLIonAlertElement;

  constructor(
    private globalConfigs: GlobalConfigsService,
    private alertCtrl: AlertController,
    private calendar: Calendar,
    private toastCtrl: ToastController
  ) {}

  @HostListener('click', ['$event']) onClick($event) {
    if ($event && $event.stopPropagation) $event.stopPropagation();

    if (!this.globalConfigs.isCordova) {
      this.showAlert();
      return;
    }

    this.calendar.hasWritePermission().then(
      (hasPermission) => {
        if (hasPermission) {
          this.addToCalendar();
        } else {
          this.calendar.requestWritePermission().then(
            (gotPermission) => {
              if (gotPermission) {
                this.addToCalendar();
              } else {
                this.showAlert();
              }
            },
            () => this.showAlert()
          );
        }
      },
      (error) => alert(error)
    );
  }

  private addToCalendar() {
    if (this.pecEvent) {
      // Is all day option should be calculated automatically
      if (this.globalConfigs.isAndroid) {
        this.calendar.createEventInteractively(
          this.pecEvent.title,
          this.pecEvent.location,
          this.pecEvent.description,
          this.pecEvent.startDtTime,
          this.pecEvent.endDtTime
        );
      } else {
        this.calendar
          .createEvent(
            this.pecEvent.title,
            this.pecEvent.location,
            this.pecEvent.description,
            this.pecEvent.startDtTime,
            this.pecEvent.endDtTime
          )
          .then(() => {
            this.toastCtrl
              .create({
                message: `${this.pecEvent.title} was added to calendar successfully`,
                duration: 4000,
                position: 'bottom',
                cssClass: 'pec-toast-message',
              })
              .then((toast) => toast.present());
          });
      }
    }
  }

  private showAlert() {
    if (this.alert) {
      return;
    }

    const alertOptions = {
      header: 'Calendar Events',
      message: `To allow ${this.globalConfigs.appName} to add events to your calendar you must first enable access by going to Settings --> ${this.globalConfigs.appName} on your device.`,
      buttons: [
        {
          text: 'OK',
          handler: () => {},
        },
      ],
      enableBackdropDismiss: false,
    };

    this.alertCtrl.create(alertOptions).then((alert) => {
      this.alert = alert;

      this.alert.onDidDismiss().then(() => {
        delete this.alert;
      });

      this.alert.present();
    });
  }
}
