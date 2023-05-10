import { Injectable, NgZone } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { GlobalConfigsService } from './global-configs.service';
import { Camera } from '@ionic-native/camera/ngx';
import { CameraOptions } from '@ionic-native/camera';
import { CropImageModalComponent } from '../components/crop-image-modal/crop-image-modal.component';
import { PecAlertService } from './pec-alert.service';

@Injectable({
  providedIn: 'root',
})
export class GetPictureService {
  private alert: HTMLIonAlertElement;
  private imageCropperModal: HTMLIonModalElement;
  private croppedImageUrl: string;
  private profileImageUrl: string;

  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private alertCtrl: PecAlertService,
    private camera: Camera,
    private globalConfigs: GlobalConfigsService,
    private ngZone: NgZone
  ) {}

  public getPicture(source: string) {
    if (!this.globalConfigs.isCordova) {
      alert('Camera not enabled for this device');
      return;
    }

    return new Promise<ImageData>((resolve, reject) => {
      let srcType: number;

      if (source === 'camera') {
        srcType = this.camera.PictureSourceType.CAMERA;
      } else if (source === 'library') {
        srcType = this.camera.PictureSourceType.SAVEDPHOTOALBUM;
      }

      const options: CameraOptions = {
        quality: 50,
        destinationType: this.camera.DestinationType.DATA_URL,
        sourceType: srcType,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true, //Corrects Android orientation quirks
      };

      this.camera.getPicture(options).then(
        (imageUri: string) => {
          this.ngZone.run(() => {
            const imgPreviewData: string = 'data:image/jpeg;base64,' + imageUri;

            this.cropImage(imgPreviewData).then(
              (data) => {
                resolve(data);
              },
              () => {
                this.showUploadError();
              }
            );
          });
        },
        (error: string) => {
          let showError = true;
          if (error) {
            const e = error.toLowerCase();
            if (e === 'no image selected' || e === 'has no access to assets' || e === 'has no access to camera') {
              showError = false;
            }
          }

          if (showError) {
            this.showUploadError();
          }
        }
      );
    });
  }

  public cropImage(imgPreviewData: string) {
    return new Promise<ImageData>((resolve, reject) => {
      this.ngZone.run(() => {
        setTimeout(() => {
          this.openImageCropper(imgPreviewData, true).then(() => {
            if (this.croppedImageUrl) {
              const croppedImageUri = this.croppedImageUrl.split(',')[1];
              const blob = this.b64toBlob(croppedImageUri, 'image/jpeg', 512);
              const croppedFile: File = this.blobToFile(blob, 'Image.jpg');

              resolve({ file: croppedFile, imagePreview: this.croppedImageUrl });
            }
          });
        }, 250);
      });
    });
  }

  public blobToFile(theBlob: Blob, fileName: string) {
    const b: any = theBlob;

    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    return theBlob as File;
  }

  public b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  private showUploadError() {
    if (this.alert) {
      return;
    }

    this.alertCtrl
      .show({
        header: 'Oops!',
        subHeader: 'There was an error uploading your photo. Please try again.',
        cssClass: '',
        buttons: [
          {
            text: 'OK',
            action: () => {},
          },
        ],
      })
      .then((alert) => {
        this.alert = alert;

        alert.onDidDismiss().then(() => {
          if (this.alert) {
            delete this.alert;
          }
        });
      });
  }

  private openImageCropper(imgUrlFile: string | Blob, isFileUploader?: boolean) {
    return new Promise<void>((resolve, reject) => {
      this.modalCtrl
        .create({
          cssClass: 'fullscreen-modal',
          component: CropImageModalComponent,
          componentProps: {
            imgUrlParams: imgUrlFile,
            currentImgUrl: this.profileImageUrl,
            getAspectRatio: 1,
            isFileUploader,
          },
        })
        .then((modal) => {
          this.imageCropperModal = modal;

          modal.onDidDismiss<CroppedImageData>().then((data) => {
            delete this.imageCropperModal;

            if (data.data.isCancel) {
              this.croppedImageUrl = null;
              resolve();
            } else if (data.data.croppedImageUrl && !data.data.isCancel) {
              this.croppedImageUrl = data.data.croppedImageUrl;
              resolve();
            } else {
              resolve();
            }
          });

          modal.present();
        });
    });
  }
}

export interface CroppedImageData {
  croppedImageUrl: string;
  isCancel?: boolean;
}

export interface ImageData {
  file: File;
  imagePreview: string | Blob;
}
