import { Injectable } from '@angular/core';
import { ClassService } from '../../data/services/class.service';
import { Class } from '../../data/types/class.type';
import { ModalController } from '@ionic/angular';
import { ChallengeExamModalComponent } from '../components/challenge-exam-modal/challenge-exam-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ChallengeExamService {
  public examModal: HTMLIonModalElement;

  constructor(private classService: ClassService, private modalCtrl: ModalController) {}

  public showExamModal(classInfo: Class) {
    return new Promise<boolean>((resolve) => {
      this.modalCtrl
        .create({
          component: ChallengeExamModalComponent,
          componentProps: {
            class: classInfo,
          },
          cssClass: 'policy-modal',
          showBackdrop: false,
          backdropDismiss: false,
        })
        .then((modal) => {
          this.examModal = modal;
          this.examModal.onDidDismiss().then((value) => {
            if (value && value.data) {
              resolve(value.data);
            }

            delete this.examModal;
          });

          this.examModal.present();
        });
    });
  }

  public closeExamModal() {
    if (this.examModal) {
      this.examModal.dismiss().then(() => delete this.examModal);
    }
  }
}
