import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Platform } from '@ionic/angular';
import * as NgxCropperComponent from 'ngx-image-cropper';
import { ScreenOrientation, ScreenOrientationService } from '../../services/screen-orientation.service';
import { ImageTransform } from 'ngx-image-cropper';

@Component({
  selector: 'pec-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss'],
})
export class ImageCropperComponent implements OnInit {
  @Input() options: ImageCropperOptions;
  @Output() imageChange: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('angularCropper') public angularCropper: NgxCropperComponent.ImageCropperComponent;

  public croppedImage: string = null;
  public showCropper = false;
  public showLoading = false;
  public transform: ImageTransform = {};

  private scale = 1;

  constructor(
    private camera: Camera,
    private platform: Platform,
    private screenOrientationService: ScreenOrientationService
  ) {}

  captureImage() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA,
    };
    this.camera.getPicture(options).then((imageData) => {
      this.options.myImage = 'data:image/jpeg;base64,' + imageData;
    });
  }

  reset() {
    this.resetImage();
    this.angularCropper.resetCropperPosition();
  }

  rotate() {
    const newValue = ((this.transform.rotate ?? 0) + 90) % 360;

    this.transform = {
      ...this.transform,
      rotate: newValue,
    };
  }

  zoom(zoomIn: boolean) {
    const factor = zoomIn ? 0.1 : -0.1;
    this.scale += factor;
    this.transform = {
      ...this.transform,
      scale: this.scale,
    };
  }

  flipHorizontally() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH,
    };
  }

  flipVertically() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV,
    };
  }

  closeCard() {
    this.croppedImage = null;
    this.showLoading = false;
    this.showCropper = false;
    this.angularCropper.resetCropperPosition();
  }

  save() {
    this.showCropper = false;
    this.showLoading = true;

    this.croppedImage = this.angularCropper.crop().base64;

    if (this.croppedImage) {
      this.options.myCroppedImage = this.croppedImage;
      this.angularCropper.imageBase64 = this.croppedImage;

      this.imageChange.emit(this.croppedImage);
      this.showLoading = false;
      this.showCropper = true;
    }
  }

  ngOnInit() {
    if (!(this.platform.is('ipad') || this.platform.is('tablet'))) {
      this.screenOrientationService.lockScreenOrientation(ScreenOrientation.Portrait);
    }
  }

  private resetImage() {
    this.scale = 1;
    this.transform = {};
  }
}

export interface ImageCropperOptions {
  myImage: string;
  myCroppedImage?: string;
  aspectRatio?: number;
  onCroppedImage?(): void;
}
