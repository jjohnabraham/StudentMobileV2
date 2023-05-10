import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { GaEvent } from '../../services/tracking.service';
import { ContactsModalComponent } from '../contacts-modal/contacts-modal.component';
import { ModalController } from '@ionic/angular';
import { ContactInfo } from 'src/app/data/types/contact.type';
import { BaseComponent } from '../base-component/base.component';
import { SafeUrl } from '@angular/platform-browser';
import { ClassService } from 'src/app/data/services/class.service';
import { DepartmentInfoModalComponent } from '../department-info-modal/department-info-modal.component';
import { first } from 'rxjs/operators';
import { Class } from 'src/app/data/types/class.type';

@Component({
  selector: 'pec-contact-box',
  templateUrl: './contact-box.component.html',
  styleUrls: ['./contact-box.component.scss'],
})
export class ContactBoxComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() contactInfo: ContactInfo;
  @Input() trackEvent: GaEvent;
  @Input() showCourseDescription = false;
  @Input() showDeptInfo = false;
  @Input() isContactsView = false;

  public classList: Class[];
  public cecImage: SafeUrl;
  public defaultImage: string;
  public name: string;
  public imageClass: string;

  private contactsModal: HTMLIonModalElement;

  constructor(private modalCtrl: ModalController, public classService: ClassService) {
    super();
  }

  public ngOnInit(): void {
    this.loadData();
  }

  public presentFacultyModal() {
    this.modalCtrl
      .create({
        component: ContactsModalComponent,
        componentProps: { contactInfo: this.contactInfo, pageTrackTitle: this.trackEvent?.category },
        cssClass: 'contacts-modal',
      })
      .then((modal) => {
        this.contactsModal = modal;
        this.contactsModal.present();
      });
  }

  public presentDepartmentsInfoModal() {
    this.modalCtrl
      .create({
        component: DepartmentInfoModalComponent,
        componentProps: { contactInfo: this.contactInfo },
        cssClass: 'contacts-modal',
      })
      .then((modal) => {
        this.contactsModal = modal;
        this.contactsModal.present();
      });
  }

  private loadData() {
    if (this.contactInfo) {
      if (this.contactInfo.FirstName == null && this.contactInfo.DisplayName.toLowerCase() !== 'faculty') {
        this.contactInfo.IsDepartment = true;
      }
      if (this.contactInfo.DisplayName.toLowerCase() !== 'faculty' && !this.contactInfo.IsDepartment) {
        this.contactInfo.Name = this.contactInfo.FirstName + ' ' + this.contactInfo.LastName;
      }

      if (this.showCourseDescription) {
        if (!this.subscriptions.classList) {
          this.subscriptions.classList = this.classService
            .classList('Current', true)
            .pipe(first())
            .subscribe((list) => {
              if (list) {
                this.classList = list;
              }
            });
        }
      }
    }
    this.imageClass = 'imgbox';
  }
}
