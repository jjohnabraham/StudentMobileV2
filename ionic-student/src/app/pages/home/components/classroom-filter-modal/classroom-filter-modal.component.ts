import { Component, Input } from '@angular/core';
import { ModalController, ViewDidLeave } from '@ionic/angular';
import { StorageService } from '../../../../shared/services/storage.service';

@Component({
  selector: 'pec-classroom-filter-modal',
  templateUrl: './classroom-filter-modal.component.html',
  styleUrls: ['./classroom-filter-modal.component.scss'],
})
export class ClassroomFilterModalComponent implements ViewDidLeave {
  @Input() classId: number;
  @Input() classroomView: ClassroomView;

  constructor(private storage: StorageService, private modalCtrl: ModalController) {}

  dismissed() {
    this.storage.setItem(this.classId + 'classroomview', this.classroomView, true);
    this.modalCtrl.dismiss({
      classView: this.classroomView,
    });
  }

  ionViewDidLeave() {
    this.storage.setItem(this.classId + 'classroomview', this.classroomView, true);
    this.modalCtrl.dismiss({
      classView: this.classroomView,
    });
  }
}

export type ClassroomView = 'unitview' | 'alllist';
