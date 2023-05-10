import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ContactService } from '../../../../data/services/contact.service';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { first } from 'rxjs/operators';
import { ContactInfo } from 'src/app/data/types/contact.type';
import { BasePageComponent } from '../../../../shared/components/base-page-component/base-page.component';
import { ModalController, NavController } from '@ionic/angular';
import { TrackingService } from 'src/app/shared/services/tracking.service';
import { PecNavigationService } from 'src/app/shared/services/pec-navigation.service';

@Component({
  selector: 'pec-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent extends BasePageComponent implements OnInit {
  public showError = false;
  public showLoading = false;
  public contacts: ContactInfo[];
  public personalContacts: ContactInfo[];
  public deptContacts: ContactInfo[];
  public isFacultyReady = false;
  public isPersonalReady = false;
  public isSchoolDepartmentView = false;
  public errorCodeMessage: string;
  public errorCode: string;

  private infoButtonClicked = false;

  constructor(
    public modalCtrl: ModalController,
    public contactService: ContactService,
    public globalConfigsService: GlobalConfigsService,
    public trackingService: TrackingService,
    private location: Location,
    public pecNavService: PecNavigationService,
    private navCtrl: NavController
  ) {
    super();
  }

  public doRefresh(event) {
    this.loadData(true);
    setTimeout(() => {
      if (event) event.target.complete();
    }, 2000);
  }

  public infoButtonOnClick() {
    this.infoButtonClicked = true;
  }

  public ngOnInit() {
    this.loadData(true);
  }

  public reload() {
    this.showError = false;
    this.loadData(true);
  }

  public onBack() {
    this.pecNavService.goBack();
  }

  private clearLoading() {
    if (this.showLoading && this.contacts) {
      this.showLoading = false;
    }
  }

  private loadData(refresh?: boolean) {
    this.showLoading = true;

    this.contactService
      .allContacts(0, refresh)
      .pipe(first())
      .subscribe(
        (list) => {
          this.contacts = list;
          this.clearLoading();
          let i: number;

          for (i = 0; i < this.contacts.length; i++) {
            const c = this.contacts[i];

            if (!c) continue;

            if (c.ContactGroup) {
              if (c.ContactGroup !== 'Instructor' && c.SyStaffId !== 0) {
                this.isPersonalReady = true;
              }

              if (c.ContactGroup === 'Instructor') {
                this.isFacultyReady = true;
              }
            }
          }

          this.personalContacts = this.contacts.filter((c) => !c.IsDepartment);
          this.personalContacts.sort(this.sortContactListAsc);
          this.deptContacts = this.contacts.filter((c) => c.IsDepartment === true);
        },
        (error) => {
          this.showError = true;
          this.errorCode = 'CONTCTINFO';
          this.errorCodeMessage = error;
        }
      );
  }

  private sortContactListAsc(a: ContactInfo, b: ContactInfo) {
    const r = (a.LastName || '').toLowerCase().localeCompare((b.LastName || '').toLowerCase());
    if (r) return r;
    return 0;
  }
}

export enum ContactDisplayType {
  HomeView = 1,
  MySchoolContactsView = 2,
  ClassInstructorsView = 4,
  SchoolDepartmentsView = 8,
  FinancialAidAdvisorContactView = 16,
}
