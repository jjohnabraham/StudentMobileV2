import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ContactInfo } from 'src/app/data/types/contact.type';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import { MessengerService } from 'src/app/data/services/messenger.service';
import { TrackingService } from 'src/app/shared/services/tracking.service';
import { UserService } from 'src/app/data/services/user.service';
import { StaffInfo, User } from 'src/app/data/types/user.type';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ChatService } from '../../../data/services/chat.service';

@Component({
  selector: 'pec-contacts-modal',
  templateUrl: './contacts-modal.component.html',
  styleUrls: ['./contacts-modal.component.scss'],
})
export class ContactsModalComponent implements OnInit {
  @Input() contactInfo: ContactInfo;
  @Input() pageTrackTitle: string;

  public messengerEnabled: boolean;
  public officeDay: string;
  public officeHrs: OfficeHours[];
  public imageClass: string;
  public displayName: string;
  public displayedPhoneNumber: string;
  public phoneUrl: string;

  private user: User;
  private mailToString: string;

  constructor(
    private globalConfigService: GlobalConfigsService,
    private userService: UserService,
    private chatService: ChatService,
    private trackingService: TrackingService,
    private modalController: ModalController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();

    this.showMessengerButton();
  }

  public dissmissModal() {
    this.modalController.dismiss();
  }

  navigateToChat() {
    const actionName = this.getActionName();

    this.modalController.dismiss().then(() => {
      this.trackingService.trackEvent({
        category: this.pageTrackTitle ? this.pageTrackTitle : 'App Home',
        action: actionName,
        label: 'Message',
        value: '',
        classId: this.contactInfo.ClassId,
      });
      this.router.navigate(['/tabs/connect/messenger'], { state: { staff: this.contactInfo }, replaceUrl: true });
    });
  }

  public openDefaultEmailClient() {
    const actionName = this.getActionName();

    this.trackingService.trackEvent({
      category: this.pageTrackTitle ? this.pageTrackTitle : 'App Home',
      action: actionName,
      label: 'Email',
      value: '',
      classId: this.contactInfo.ClassId,
    });
    this.globalConfigService.openUrlOutOfApp(this.mailToString);
  }

  public trackEventPhoneTap() {
    const actionName = this.getActionName();

    this.trackingService.trackEvent({
      category: this.pageTrackTitle ? this.pageTrackTitle : 'App Home',
      action: actionName,
      label: 'Call',
      value: '',
      classId: this.contactInfo.ClassId,
    });
  }

  public showMessengerButton() {
    if (!this.contactInfo.SendBirdChatUserId) {
      this.getChatUserId();
    }

    if (this.contactInfo.SendBirdChatUserId) {
      this.chatService.getChatUniqueContacts().subscribe(
        (contacts) => {
          if (
            contacts.ContactsBySendBirdChatUserId &&
            contacts.ContactsBySendBirdChatUserId[this.contactInfo.SendBirdChatUserId]
          ) {
            this.messengerEnabled = true;
          } else {
            this.messengerEnabled = false;
          }
        },
        (error) => {
          //this.showError = true;
        }
      );
    }
  }

  public formatPhoneNumber(phoneNumberString) {
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    const matcha = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    } else if (matcha) {
      return matcha[1] + '(' + matcha[2] + ') ' + matcha[3] + '-' + matcha[4];
    }
    return null;
  }

  //format phone number with extention
  public formatPhoneNumberWithExtension(phoneNumberString, phoneEx) {
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    const matcha = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);

    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3] + ' x' + phoneEx;
    } else if (matcha) {
      return matcha[1] + '(' + matcha[2] + ') ' + matcha[3] + '-' + matcha[4] + '  x' + phoneEx;
    }
    return null;
  }

  private getChatUserId() {
    if (this.contactInfo.SyStaffId) {
      this.contactInfo.SendBirdChatUserId = this.generateSendBirdChatUserId(
        this.contactInfo.SourceSystem,
        0,
        this.contactInfo.SyStaffId
      );
    }
  }

  private getActionName() {
    if (this.contactInfo.DisplayName === 'Faculty' || this.contactInfo.DisplayName === 'FACULTY') {
      return 'Tapped to Contact Instructor';
    }

    if (this.contactInfo.DisplayName === 'PLA (Transfer Credit)') {
      return 'Tapped to Contact PLA Department';
    }

    if (
      this.contactInfo.DisplayName === 'Bookstore (Words of Wisdom)' ||
      this.contactInfo.DisplayName === 'Words of Wisdom Bookstore'
    ) {
      return 'Tapped to Contact Words of Wisdom Department';
    }

    if (this.contactInfo.DisplayName.toLocaleLowerCase().indexOf('registrar') !== -1) {
      return 'Tapped to Contact Registrar Department';
    }

    return 'Tapped to Contact ' + this.contactInfo.DisplayName;
  }

  private loadData() {
    this.displayName = this.contactInfo.DisplayName;
    if (this.contactInfo.DisplayName.toLowerCase() === 'faculty') {
      this.userService
        .contactInfo(
          this.contactInfo.SyStaffId.toString(),
          this.contactInfo.SourceSystem.toString(),
          this.contactInfo.ClassId
        )
        .pipe(first())
        .subscribe((staffInfo) => {
          this.contactInfo.Phone = this.formatPhoneNumber(staffInfo.Phone);
          this.contactInfo.NextOfficeHours = staffInfo.NextOfficeHours;
          this.setOfficeHours();
        });
    } else if (this.contactInfo.ContactGroup.toLowerCase() === 'instructor') {
      this.displayName = 'Faculty';
      this.getStaffInfo();
    }
    this.userService
      .info()
      .pipe(first())
      .subscribe((user) => {
        this.user = user;
        this.mailToString =
          'mailto:' + this.contactInfo.EmailAddress + '?subject=Student ID: ' + this.user.StudentNumber;
      });
    this.displayedPhoneNumber = this.formatPhoneNumber(this.contactInfo.Phone);
    this.phoneUrl = this.contactInfo.Phone;

    //if extension is not null
    if (this.contactInfo.PhoneExtension && this.contactInfo.Phone) {
      this.displayedPhoneNumber = this.formatPhoneNumberWithExtension(
        this.contactInfo.Phone,
        this.contactInfo.PhoneExtension
      );
      this.phoneUrl = this.phoneUrl + ',' + this.contactInfo.PhoneExtension;
    }

    this.phoneUrl = 'tel:' + this.phoneUrl;

    this.imageClass = 'imgmodal';
  }

  private getStaffInfo() {
    this.userService
      .contactInfo(
        this.contactInfo.SyStaffId.toString(),
        this.contactInfo.SourceSystem.toString(),
        this.contactInfo.ClassId
      )
      .subscribe((faculty: StaffInfo) => {
        if (faculty) {
          this.contactInfo.Phone = faculty.Phone;
          this.contactInfo.EmailAddress = faculty.Email;
          this.contactInfo.NextOfficeHours = faculty.NextOfficeHours;
          this.setOfficeHours();
        }
      });
  }

  private setOfficeHours() {
    if (this.contactInfo.NextOfficeHours) {
      this.officeHrs = [];
      for (let i = 0; i < this.contactInfo.NextOfficeHours.length; i++) {
        if (this.contactInfo.NextOfficeHours[i].Day == null) {
          this.contactInfo.NextOfficeHours[i].Day = -1;
        }

        switch (this.contactInfo.NextOfficeHours[i].Day.toLocaleString()) {
          case '1': {
            this.officeDay = 'Monday';
            break;
          }
          case '2': {
            this.officeDay = 'Tuesday';
            break;
          }
          case '3': {
            this.officeDay = 'Wednesday';
            break;
          }
          case '4': {
            this.officeDay = 'Thursday';
            break;
          }
          case '5': {
            this.officeDay = 'Friday';
            break;
          }
          case '6': {
            this.officeDay = 'Saturday';
            break;
          }
          case '0': {
            this.officeDay = 'Sunday';
            break;
          }
        }
        this.officeDay =
          this.officeDay +
          ': ' +
          this.contactInfo.NextOfficeHours[i].Start +
          this.contactInfo.NextOfficeHours[i].StartMeridian +
          ' - ' +
          this.contactInfo.NextOfficeHours[i].End +
          this.contactInfo.NextOfficeHours[i].EndMeridian;
        this.officeHrs.push({ officeDay: this.officeDay });
        if (this.officeHrs[i].officeDay === this.officeHrs[0].officeDay && i !== 0) {
          this.officeHrs.pop();
          break;
        } else if (i === this.contactInfo.NextOfficeHours.length - 1) {
        }
      }
    }
  }

  private generateSendBirdChatUserId(sourceSystemId: number, syStudentId: number, syStaffId: number) {
    return (syStudentId > 0 ? 1 : 2) + '_' + sourceSystemId + '_' + (syStudentId > 0 ? syStudentId : syStaffId);
  }
}

export interface OfficeHours {
  officeDay: string;
}
