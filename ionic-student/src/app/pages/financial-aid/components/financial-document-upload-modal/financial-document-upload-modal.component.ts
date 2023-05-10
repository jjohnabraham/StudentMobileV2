/* eslint-disable @typescript-eslint/prefer-for-of */
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  OnInit,
  ViewChildren,
  AfterContentChecked,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BaseComponent } from '../../../../shared/components/base-component/base.component';
import { MultiFileUploadComponent } from 'src/app/shared/components/multi-file-upload/multi-file-upload.component';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { SwiperComponent } from 'swiper/angular';
import { SwiperOptions } from 'swiper';
import { FileItem } from 'ng2-file-upload';
import { GlobalConfigsService } from 'src/app/shared/services/global-configs.service';

@Component({
  selector: 'pec-financial-document-upload-modal',
  templateUrl: './financial-document-upload-modal.component.html',
  styleUrls: ['./financial-document-upload-modal.component.scss'],
})
export class FinancialDocumentUploadModalComponent extends BaseComponent implements AfterContentChecked, OnInit {
  @Input() public fileField: MultiFileUploadComponent;
  @Input() goToItem;
  @ViewChild('swiper') swiper: SwiperComponent;
  @ViewChild('nameSwiper') nameSwiper: SwiperComponent;
  public previewDocuments: FileItem[] = [];
  public slideStartIndex = 0;
  public slideIndex = 0;

  public config: SwiperOptions = {
    effect: 'slide',
    loop: true,
    speed: 500,
    spaceBetween: 25,
    pagination: false,
    slidesPerView: 1,
    noSwipingClass: 'swiper-no-swiping',
    autoHeight: false,
    centeredSlides: true,
  };
  public nameConfig: SwiperOptions = {
    effect: 'slide',
    loop: true,
    speed: 0,
    spaceBetween: 25,
    pagination: false,
    slidesPerView: 1,
    noSwipingClass: 'swiper-no-swiping',
    autoHeight: false,
  };
  private alert: HTMLIonAlertElement;

  constructor(
    public viewCtrl: ModalController,
    public sanitizer: DomSanitizer,
    public globalConfig: GlobalConfigsService,
    private alertCtrl: AlertController
  ) {
    super();
  }

  ngOnInit() {
    this.previewDocuments = this.fillPreviewDocuments(this.fileField, this.previewDocuments);
    this.slideIndex = this.findFileFieldIndex(this.goToItem, this.previewDocuments);
  }

  ngAfterContentChecked() {
    if (this.swiper) {
      this.swiper.updateSwiper({});
    }
    if (this.nameSwiper) {
      this.nameSwiper.updateSwiper({});
    }
  }

  public swiperSlideChanged(event) {
    this.slideIndex = event.activeIndex - 1;
    if (this.slideIndex >= this.previewDocuments.length) {
      this.slideIndex = 0;
    }
    if (this.slideIndex < 0) {
      this.slideIndex = this.previewDocuments.length - 1;
    }

    this.nameSwiper.swiperRef.slideTo(event.activeIndex, 0);
  }

  public dismissModal() {
    this.viewCtrl.dismiss();
  }

  public fillPreviewDocuments(fileField: MultiFileUploadComponent, previewDocuments: FileItem[]) {
    for (let i = 0; i < fileField.uploadedFiles.length; i++) {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      if (fileField.uploadedFiles[i].file['imgUrl']) {
        previewDocuments.push(this.fileField.uploadedFiles[i]);
      }
    }
    return previewDocuments;
  }

  public findFileFieldElement(nameKey, myArray) {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < myArray.length; i++) {
      if (myArray[i].file.name === nameKey) {
        return myArray[i];
      }
    }
  }

  public findFileFieldIndex(nameKey, myArray) {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < myArray.length; i++) {
      if (myArray[i].file.name === nameKey) {
        return i;
      }
    }
  }
  public goToPrevSlide() {
    this.swiper.swiperRef.slidePrev();
  }

  public goToNextSlide() {
    this.swiper.swiperRef.slideNext();
  }

  public removeItem() {
    this.fileField.removeFromQueue(
      this.findFileFieldElement(this.previewDocuments[this.slideIndex].file.name, this.fileField.uploadedFiles)
    );
    this.previewDocuments.splice(this.slideIndex, 1);
    this.nameSwiper.swiperRef.updateSlides();
    this.swiperSlideChanged(this.swiper.swiperRef);
    if (this.previewDocuments.length === 0) {
      this.dismissModal();
    }
  }
  public showAlert() {
    return this.alertCtrl
      .create({
        header: 'Remove Document?',
        message: 'Are you sure you would like to remove this document?  This action cannot be undone.',
        mode: 'md',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Remove',
            role: 'confirm',
            handler: () => {
              this.removeItem();
            },
          },
        ],
      })
      .then((alert) => {
        this.alert = alert;

        this.alert.onDidDismiss().then(() => {
          delete this.alert;
        });

        this.alert.present();

        return alert;
      });
  }
}
