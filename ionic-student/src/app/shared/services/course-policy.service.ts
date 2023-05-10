import { Injectable } from '@angular/core';
import { ClassService } from '../../data/services/class.service';
import { ClassStatus } from '../../data/types/class.type';
import { ModalController } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { PolicyModalComponent } from '../components/policy-modal/policy-modal.component';

@Injectable({
  providedIn: 'root',
})
export class CoursePolicyService {
  public policyModal: HTMLIonModalElement;

  constructor(private classService: ClassService, private modalCtrl: ModalController) {}

  public isClassPolicyAccepted(classId: number) {
    return new Promise<boolean>((resolve, reject) => {
      this.classService.status(classId, false).subscribe(
        (classStatus) => {
          if (classStatus) {
            resolve(classStatus.ShowPolicy);
          }
        },
        (error) => reject(error)
      );
    });
  }

  public showPolicyModal(classId: number, classStatus: ClassStatus) {
    return new Promise<boolean>((resolve) => {
      this.modalCtrl
        .create({
          component: PolicyModalComponent,
          componentProps: {
            classId,
            classStatus,
          },
          cssClass: 'policy-modal',
          showBackdrop: false,
          backdropDismiss: false,
        })
        .then((modal) => {
          this.policyModal = modal;
          this.policyModal.onDidDismiss().then((value) => {
            if (value && value.data) {
              this.setClassPolicy(classId, value.data, classStatus);
            }

            resolve(value.data);

            delete this.policyModal;
          });

          this.policyModal.present();
        });
    });
  }

  public closePolicyModal() {
    if (this.policyModal) {
      this.policyModal.dismiss().then(() => delete this.policyModal);
    }
  }

  private setClassPolicy(classId: number, isAccept: boolean, classStatus: ClassStatus) {
    this.classService
      .saveAcceptPolicy(classId, classStatus, isAccept)
      .pipe(first())
      .subscribe((result) => {
        //console.log('Accepted Policy updated: ', result);
      });
  }
}
