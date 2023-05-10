import { Component, Input, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';
import { ResourceService } from 'src/app/data/services/resource.service';
import { ClassService } from '../../../data/services/class.service';
import { Class } from 'src/app/data/types/class.type';
import { ClassAssignment } from 'src/app/data/types/assignment.type';
import { first } from 'rxjs/operators';

@Component({
  selector: 'pec-challenge-exam-modal',
  templateUrl: './challenge-exam-modal.component.html',
  styleUrls: ['./challenge-exam-modal.component.scss'],
})
export class ChallengeExamModalComponent implements OnInit {
  @Input() class: Class;

  public url: string;
  public content: string;

  private featureId: number;
  private assignment: ClassAssignment;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private modalController: ModalController,
    private navController: NavController,
    private globalConfigs: GlobalConfigsService,
    private resourceService: ResourceService,
    private classService: ClassService
  ) {}

  public dismissModal() {
    this.modalController.dismiss(false);
  }

  public startExam() {
    this.modalController.dismiss(true);
  }

  public ngOnInit() {
    this.setExamModalContent();
  }

  private setExamModalContent() {
    this.classService
      .info(this.class.ClassId)
      .pipe(first())
      .subscribe((classInfo) => {
        this.assignment = classInfo.AssignmentList.filter((a) => a.AssignmentTypeName === 'Exam')[0];
        this.featureId = this.assignment.Features[0].LmsFeatureId;
        this.url = this.assignment.Features[0].url;
      });

    this.classService
      .challengeExamPolicy()
      .pipe(first())
      .subscribe((data) => {
        this.content = data;
      });
  }
}
