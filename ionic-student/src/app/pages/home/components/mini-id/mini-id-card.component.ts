import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { GlobalConfigsService } from '../../../../shared/services/global-configs.service';
import { AuthService } from '../../../../data/services/auth.service';
import { User } from '../../../../data/types/user.type';
import { TrackingService } from '../../../../shared/services/tracking.service';
import { UserService } from '../../../../data/services/user.service';
import { StorageService } from '../../../../shared/services/storage.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'pec-mini-id-card',
  templateUrl: './mini-id-card.component.html',
  styleUrls: ['./mini-id-card.component.scss'],
  providers: [],
})
export class MiniIdCardComponent implements OnInit, OnDestroy {
  @Input() userInfo: User;

  //content variables
  public avatar: string = this.userService.defaultImage;

  //subscriptions
  private subscriptions: Subscription;

  constructor(
    private router: Router,
    private globalConfigs: GlobalConfigsService,
    private location: Location,
    private authService: AuthService,
    private userService: UserService,
    private trackingService: TrackingService,
    private storage: StorageService
  ) {
    this.userService.onProfileImageUploadedDateTimeChange.subscribe((imageUploaded) => {
      this.loadProfileImage();
    });
  }
  ngOnInit(): void {
    this.loadProfileImage();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public presentIdCard() {
    this.router.navigate(['/tabs/home/id/student']);
  }

  private loadProfileImage() {
    this.subscriptions = this.userService.studentProfileImage(true).subscribe((url) => {
      this.avatar = url;
    });
  }
}
