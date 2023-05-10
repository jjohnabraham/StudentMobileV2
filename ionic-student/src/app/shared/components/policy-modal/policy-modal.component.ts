import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import { ResourceService } from 'src/app/data/services/resource.service';
import { ClassStatus } from 'src/app/data/types/class.type';


@Component({
  selector: 'pec-policy-modal',
  templateUrl: './policy-modal.component.html',
  styleUrls: ['./policy-modal.component.scss'],
})
export class PolicyModalComponent implements OnInit {

  @Input() classStatus: ClassStatus;
  @Input() classId: number;

  public policyContent: any = {};
  public schoolSelector: string = 'ctu';
  private subscriptions: any = {};
  public showClassPolicy: boolean;
  public showUserPolicy: boolean;


  constructor(public router: Router, public route: ActivatedRoute, private modalController: ModalController, private navController: NavController, private globalConfigs: GlobalConfigsService, private resourceService: ResourceService) {

    this.route.queryParams.subscribe(params => {
      var classId = params['ClassId'];
      if (classId) {
        this.classId = classId
      }
    });

    this.route.queryParams.subscribe(params => {
      var classStatus = params['ClassStatus'];
      if (classStatus) {
        this.classStatus = classStatus;
      }

    });


  }

  dissmissModal() {
    this.modalController.dismiss(false);
  }

  acceptClassPolicy() {
    this.modalController.dismiss(true);
  }



  private loadData() {
    this.schoolSelector = this.globalConfigs.brandName;
    if (!this.subscriptions['ClassroomPolicyAccept']) {
      this.subscriptions['ClassroomPolicyAccept'] = this.resourceService.getLabel('LmsClassroomTermsAndConditions').subscribe(
        result => {
          this.policyContent.classroomPolicyContent = result;
        },
        error => {
        });
    }

    if (!this.subscriptions['UserPolicyAccept']) {
      this.subscriptions['UserPolicyAccept'] = this.resourceService.getLabel('LmsSubmissionDBTermsAndConditions').subscribe(
        result => {
          this.policyContent.userPolicyContent = result;
        },
        error => {
        });
    }

  }


  private clearSubscriptions() {
    if (this.subscriptions) {
      for (var key in this.subscriptions) {
        if (this.subscriptions[key] && this.subscriptions[key].unsubscribe) {
          this.subscriptions[key].unsubscribe();
          delete this.subscriptions[key];
        }
      }
    }
  }

  ngOnInit() {
    setTimeout(this.loadData.bind(this), 0);
  }

  ngOnDestroy() {
    this.clearSubscriptions();
  }
}
