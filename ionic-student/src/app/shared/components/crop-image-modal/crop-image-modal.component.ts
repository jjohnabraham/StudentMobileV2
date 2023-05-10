import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { ImageCropperOptions } from '../image-cropper/image-cropper.component';
import { ModalController } from '@ionic/angular';
import { CroppedImageData } from '../../services/get-picture.service';

@Component({
  selector: 'pec-crop-image-modal',
  templateUrl: './crop-image-modal.component.html',
  styleUrls: ['./crop-image-modal.component.scss'],
})
export class CropImageModalComponent implements AfterViewInit {
  @Input() imgUrlParams: string;
  @Input() currentImgUrl: string;
  @Input() getAspectRatio: number;
  @Input() isFileUploader: boolean;

  public imageCropperOptions: ImageCropperOptions;
  public showLoading = true;

  private data: CroppedImageData;

  constructor(private modalCtrl: ModalController) {}

  public croppedImageChange(event) {
    if (event) {
      this.data = { croppedImageUrl: event };
    } else {
      this.data = { croppedImageUrl: this.imgUrlParams };
    }
  }

  public closeModalDone() {
    if (this.data) {
      this.modalCtrl.dismiss(this.data);
    } else {
      this.modalCtrl.dismiss({ croppedImageUrl: this.imgUrlParams });
    }
  }

  public closeModalCancel() {
    if (this.isFileUploader === false) {
      if (this.currentImgUrl) {
        this.modalCtrl.dismiss({ croppedImageUrl: this.currentImgUrl });
      } else {
        this.modalCtrl.dismiss({ croppedImageUrl: this.imgUrlParams });
      }
    } else {
      this.modalCtrl.dismiss({
        croppedImageUrl: null,
        isCancel: true,
      });
    }
  }

  public ngAfterViewInit() {
    this.imageCropperOptions = {
      myImage: this.imgUrlParams,
      aspectRatio: this.getAspectRatio,
    };

    this.showLoading = false;
  }
}
