import { Component, Input, OnInit } from '@angular/core';
import { NavController, NavParams, PopoverController } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { UserService } from 'src/app/data/services/user.service';
import { BaseComponent } from 'src/app/shared/components/base-component/base.component';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';

@Component({
  selector: 'pec-no-assignment-popover',
  templateUrl: './no-assignment-popover.component.html',
  styleUrls: ['./no-assignment-popover.component.scss'],
})
export class NoAssignmentPopoverComponent extends BaseComponent {
  public noAssignmentsMessage: { Email: string; Phone: string };
  public buttons: Array<{ label: string; href?: string }>;
  private studentNumber: string;
  constructor(
    private popoverController: PopoverController,
    private userService: UserService,
    private globalConfigs: GlobalConfigsService,
    public navParams: NavParams
  ) {
    super();
    this.noAssignmentsMessage = this.navParams.data.noAssignmentMessage;
    this.buttons = [{ label: 'Call', href: `tel:${this.noAssignmentsMessage.Phone}` }, { label: 'Email' }];
  }
  ionViewWillEnter() {
    setTimeout(this.loadData.bind(this), 0);
  }
  onPopoverCloseClick() {
    this.popoverController.dismiss();
  }
  onButtonClick(buttonLabel: string) {
    if (buttonLabel === 'Email') {
      this.globalConfigs.openUrlOutOfApp(
        'mailto:' + this.noAssignmentsMessage.Email + '?subject=Student ID: ' + this.studentNumber
      );
    }
  }
  private loadData() {
    this.userService
      .info()
      .pipe(first())
      .subscribe(
        (user) => {
          this.studentNumber = user.StudentNumber;
        },
        (error) => {}
      );
  }
}
