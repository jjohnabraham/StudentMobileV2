import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { IonicModule } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { UrbanAirShip } from '@ionic-native/urbanairship/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Device } from '@ionic-native/device/ngx';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { HttpClientModule } from '@angular/common/http';
import { AutoresizeTextareaDirective } from './directives/autoresize-textarea.directive';
import { PhoneFormatDirective } from './directives/phone-format.directive';
import { PecDatePipe } from './pipes/date.pipe';
import { DurationPipe } from './pipes/duration.pipe';
import { SchoolNamePipe } from './pipes/school-name.pipe';
import { AddToCalendarDirective } from './directives/add-to-calendar.directive';
import { AssetBase64Pipe } from './pipes/asset-base64.pipe';
import { UrlTokenPipe } from './pipes/url-token.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { TimePastDatePipe } from './pipes/time-past-date.pipe';
import { TextCountdownPipe } from './pipes/text-countdown.pipe';
import { PhoneLinkPipe } from './pipes/phone-link.pipe';
import { TransitionDirective } from './directives/transition.directive';
import { SchoolInfoComponent } from './components/school-info/school-info.component';
import { ImageCropperComponent } from './components/image-cropper/image-cropper.component';
import { TrackViewDirective } from './directives/track-view.directive';
import { TrackEventDirective } from './directives/track-event.directive';
import { RedirectDirective } from './directives/redirect.directive';
import { UrlRedirectDirective } from './directives/url-redirect.directive';
import { LmsRedirectDirective } from './directives/lms-redirect.directive';
import { ImagePreloadDirective } from './directives/image-preload.directive';
import { PolicyModalComponent } from './components/policy-modal/policy-modal.component';
import { ChallengeExamModalComponent } from './components/challenge-exam-modal/challenge-exam-modal.component';
import { CropImageModalComponent } from './components/crop-image-modal/crop-image-modal.component';
import { LoadingComponent } from './components/loading/loading.component';
import { BaseComponent } from './components/base-component/base.component';
import { BasePageComponent } from './components/base-page-component/base-page.component';
import { FrameComponent } from './components/iframe/iframe.component';
import { SmarthinkingTipsCardComponent } from './components/smarthinking-tips-card/smarthinking-tips-card.component';
import { Camera } from '@ionic-native/camera/ngx';
import { ContactsModalComponent } from './components/contacts-modal/contacts-modal.component';
import { DepartmentInfoModalComponent } from './components/department-info-modal/department-info-modal.component';
import { ContactBoxComponent } from './components/contact-box/contact-box.component';
import { ContactImageCardComponent } from './components/contact-image-card/contact-image-card.component';
import { ClassCardComponent } from './components/class-card/class-card.component';
import { AssignmentCardComponent } from './components/assignment-card/assignment-card.component';
import { RouterModule } from '@angular/router';
import { Calendar } from '@ionic-native/calendar/ngx';
import { PECErrorComponent } from './components/error/pec-error.component';
import { DegreeCardComponent } from './components/degree-card/degree-card.component';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { PecPopoverContainerComponent } from './components/pec-popover-container/pec-popover-container.component';
import { ZoomErrorPopoverComponent } from './components/zoom-error-popover/zoom-error-popover.component';
import { AppAvailability } from '@ionic-native/app-availability/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ScheduleFastTrackExamModalComponent } from './components/schedule-fast-track-exam-modal/schedule-fast-track-exam-modal.component';
import { PasscodeComponent } from './components/passcode/passcode.component';
import { PasscodeModalComponent } from './components/passcode-modal/passcode-modal.component';
import { InfoPopoverComponent } from './components/info-popover/info-popover.component';
import { MultiFileUploadComponent } from './components/multi-file-upload/multi-file-upload.component';
import { LimitToDirective } from './directives/limit-to.directive';
import { ConnectMenuComponent } from './components/connect-menu/connect-menu.component';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { AssignmentActionButtonComponent } from './components/assignment-action-button/assignment-action-button.component';
import { FileUploadModule } from 'ng2-file-upload';
import { ErrorApiComponent } from './components/error-api/error-api.component';
import { PecAirshipService } from '@pec/notifications';
import { DebugModalComponent } from './components/debug-modal/debug-modal.component';
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  declarations: [
    BaseComponent,
    BasePageComponent,
    SchoolInfoComponent,
    ImageCropperComponent,
    PolicyModalComponent,
    ScheduleFastTrackExamModalComponent,
    ChallengeExamModalComponent,
    CropImageModalComponent,
    LoadingComponent,
    AutoresizeTextareaDirective,
    PhoneFormatDirective,
    PecDatePipe,
    DurationPipe,
    SchoolNamePipe,
    AddToCalendarDirective,
    AssetBase64Pipe,
    UrlTokenPipe,
    SafeHtmlPipe,
    TimePastDatePipe,
    TextCountdownPipe,
    PhoneLinkPipe,
    TransitionDirective,
    TrackViewDirective,
    TrackEventDirective,
    RedirectDirective,
    UrlRedirectDirective,
    LmsRedirectDirective,
    ImagePreloadDirective,
    SmarthinkingTipsCardComponent,
    FrameComponent,
    ContactsModalComponent,
    ContactBoxComponent,
    DepartmentInfoModalComponent,
    ContactImageCardComponent,
    ClassCardComponent,
    AssignmentCardComponent,
    DegreeCardComponent,
    PecPopoverContainerComponent,
    InfoPopoverComponent,
    ZoomErrorPopoverComponent,
    PECErrorComponent,
    PasscodeComponent,
    PasscodeModalComponent,
    MultiFileUploadComponent,
    LimitToDirective,
    ConnectMenuComponent,
    AssignmentActionButtonComponent,
    ErrorApiComponent,
    DebugModalComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    RoundProgressModule,
    ReactiveFormsModule,
    FileUploadModule,
    ImageCropperModule,
  ],
  exports: [
    LoadingComponent,
    TransitionDirective,
    TrackViewDirective,
    TrackEventDirective,
    FrameComponent,
    SmarthinkingTipsCardComponent,
    PecPopoverContainerComponent,
    InfoPopoverComponent,
    BasePageComponent,
    BaseComponent,
    PhoneLinkPipe,
    PecDatePipe,
    TimePastDatePipe,
    ContactsModalComponent,
    ScheduleFastTrackExamModalComponent,
    ContactBoxComponent,
    DepartmentInfoModalComponent,
    ContactImageCardComponent,
    ClassCardComponent,
    DegreeCardComponent,
    AssignmentCardComponent,
    MultiFileUploadComponent,
    UrlTokenPipe,
    SafeHtmlPipe,
    TextCountdownPipe,
    UrlRedirectDirective,
    LmsRedirectDirective,
    RoundProgressModule,
    AssetBase64Pipe,
    DurationPipe,
    ZoomErrorPopoverComponent,
    PECErrorComponent,
    PasscodeComponent,
    PasscodeModalComponent,
    AutoresizeTextareaDirective,
    PhoneFormatDirective,
    LimitToDirective,
    ErrorApiComponent,
    SchoolInfoComponent,
  ],
  providers: [
    AppVersion,
    UrbanAirShip,
    FirebaseX,
    Device,
    FingerprintAIO,
    InAppBrowser,
    BrowserTab,
    PhoneLinkPipe,
    TimePastDatePipe,
    DatePipe,
    Camera,
    Calendar,
    AssetBase64Pipe,
    AppAvailability,
    StatusBar,
    FileChooser,
    FilePath,
    PecAirshipService,
  ],
})
export class SharedModule {}
