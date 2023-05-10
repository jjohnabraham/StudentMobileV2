import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BaseComponent } from '../../../../shared/components/base-component/base.component';
import { ContactInfo } from '../../../../data/types/contact.type';
import { ContactService } from '../../../../data/services/contact.service';
import { TrackingService } from '../../../../shared/services/tracking.service';
import { first } from 'rxjs/operators';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from '../../../../data/services/user.service';
import { User } from '../../../../data/types/user.type';
import { MessengerService } from '../../../../data/services/messenger.service';
import { FinancialAidStatus, RequiredAction } from '../../../../data/types/financial-aid.type';
import { ThemeId } from '../../../../shared/enums/theme-id.enum';
import { FinancialAidService } from '../../../../data/services/financial-aid.service';
import { combineLatest } from 'rxjs';
import * as moment from 'moment';
import { ChatService } from '../../../../data/services/chat.service';

@Component({
  selector: 'pec-financial-aid-document-contact',
  templateUrl: './financial-aid-document-contact.component.html',
  styleUrls: ['./financial-aid-document-contact.component.scss'],
})
export class FinancialAidDocumentContactComponent extends BaseComponent implements OnInit {
  @Input() refresh: boolean;
  @Input() eventCategory: string;
  @Input() document: RequiredAction;
  @Output() loadingFinished: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() errorOnLoad: EventEmitter<string> = new EventEmitter<string>();

  public showLoading: boolean;
  public advisorContact: ContactInfo;
  public displayedPhoneNumber: string;
  public phoneUrl: string;
  public messengerEnabled: boolean;

  private actionName: string;
  private user: User;
  private mailToString: string;

  constructor(
    private globalConfigService: GlobalConfigsService,
    private contactService: ContactService,
    private trackingService: TrackingService,
    private modalController: ModalController,
    private router: Router,
    private userService: UserService,
    private chatService: ChatService,
    private financialAidService: FinancialAidService
  ) {
    super();
  }

  public ngOnInit() {
    this.beginLoad(this.refresh);
  }

  public trackEventPhoneTap() {
    this.trackingService.trackEvent({
      category: 'Financial Aid View',
      action: this.actionName,
      label: 'Call',
      value: '',
      classId: this.advisorContact.ClassId,
    });
  }

  public navigateToChat() {
    this.modalController.dismiss().then(() => {
      this.trackingService.trackEvent({
        category: 'Financial Aid View',
        action: this.actionName,
        label: 'Message',
        value: '',
        classId: this.advisorContact.ClassId,
      });
      this.router.navigate(['/tabs/connect/messenger'], { state: { staff: this.advisorContact }, replaceUrl: true });
    });
  }

  public openDefaultEmailClient() {
    this.trackingService.trackEvent({
      category: 'Financial Aid View',
      action: this.actionName,
      label: 'Email',
      value: '',
      classId: this.advisorContact.ClassId,
    });
    this.globalConfigService.openUrlOutOfApp(this.mailToString);
  }

  private showMessengerButton() {
    if (!this.advisorContact.SendBirdChatUserId) {
      this.getChatUserId();
    }

    if (this.advisorContact.SendBirdChatUserId) {
      this.chatService.getChatUniqueContacts().subscribe(
        (contacts) => {
          if (
            contacts.ContactsBySendBirdChatUserId &&
            contacts.ContactsBySendBirdChatUserId[this.advisorContact.SendBirdChatUserId]
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

  private beginLoad(refresh: boolean) {
    this.showLoading = true;

    combineLatest([
      this.userService.info().pipe(first()),
      this.contactService.allContacts(null, refresh).pipe(first()),
    ]).subscribe(([user, allcontacts]) => {
      this.user = user;

      const contactGroup = [];
      if (this.document.Department === 'Financial Aid') {
        contactGroup.push('Financial Aid Advisor');
      } else if (this.globalConfigService.themeId === ThemeId.AIU) {
        contactGroup.push('Admissions Advisor');
        contactGroup.push('Admissions'); // if there is no Admissions Advisor, fallback to Admissions
      } else if (this.globalConfigService.themeId === ThemeId.CTU) {
        if (user.IsMinStartDaysCompleted) {
          if (this.document.Department === 'Student Accounts') {
            contactGroup.push('Financial Aid Advisor');
          } else if (this.document.Department === 'Academic Records') {
            contactGroup.push('Student Success Coach');
            contactGroup.push('Success Coach'); // if there is no Student Success Coach, fallback to Success Coach
          }
        } else {
          contactGroup.push('Admissions Advisor');
          contactGroup.push('Admissions'); // if there is no Admissions Advisor, fallback to Admissions
        }
      } else {
        if (this.document.Department === 'Student Accounts') {
          contactGroup.push('Financial Aid Advisor');
        } else if (this.document.Department === 'Academic Records') {
          contactGroup.push('Student Success Coach');
          contactGroup.push('Success Coach'); // if there is no Student Success Coach, fallback to Success Coach
        }
      }

      for (const group of contactGroup) {
        this.advisorContact = allcontacts.find((c) => group === c.ContactGroup);

        if (this.advisorContact) {
          break;
        }
      }

      if (!this.advisorContact) {
        this.advisorContact = allcontacts.find((c) => c.ContactGroup === 'Financial Aid');
      }

      if (!this.advisorContact) {
        this.showLoading = false;
        this.loadingFinished.emit(true);

        return;
      }

      // Update display name to match requirements
      if (this.advisorContact.Department === 'Admissions') {
        this.advisorContact.Department = 'Admissions Advisor';
        this.advisorContact.DisplayName = 'Admissions Advisor';
      }

      this.actionName = 'Tapped to Contact ' + this.advisorContact.DisplayName;

      if (!this.advisorContact.IsDepartment) {
        this.advisorContact.Name = this.advisorContact.FirstName + ' ' + this.advisorContact.LastName;
      }

      this.setPhoneAndEmail();
      this.showMessengerButton();

      this.showLoading = false;
      this.loadingFinished.emit(true);
    });
  }

  private setPhoneAndEmail() {
    this.mailToString =
      'mailto:' + this.advisorContact.EmailAddress + '?subject=Student ID: ' + this.user.StudentNumber;

    this.displayedPhoneNumber = this.formatPhoneNumber(this.advisorContact.Phone);
    this.phoneUrl = this.advisorContact.Phone;

    //if extension is not null
    if (this.advisorContact.PhoneExtension && this.advisorContact.Phone) {
      this.displayedPhoneNumber = this.formatPhoneNumberWithExtension(
        this.advisorContact.Phone,
        this.advisorContact.PhoneExtension
      );
      this.phoneUrl = this.phoneUrl + ',' + this.advisorContact.PhoneExtension;
    }

    this.phoneUrl = 'tel:' + this.phoneUrl;
  }

  private formatPhoneNumber(phoneNumberString) {
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
  private formatPhoneNumberWithExtension(phoneNumberString, phoneEx) {
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
    if (this.advisorContact.SyStaffId) {
      this.advisorContact.SendBirdChatUserId = this.generateSendBirdChatUserId(
        this.advisorContact.SourceSystem,
        0,
        this.advisorContact.SyStaffId
      );
    }
  }

  private generateSendBirdChatUserId(sourceSystemId: number, syStudentId: number, syStaffId: number) {
    return (syStudentId > 0 ? 1 : 2) + '_' + sourceSystemId + '_' + (syStudentId > 0 ? syStudentId : syStaffId);
  }
}
