import { Component, Input, OnDestroy, Renderer2 } from '@angular/core';
import { BaseComponent } from '../base-component/base.component';
import { GetPictureService } from '../../services/get-picture.service';
import { TrackingService } from '../../services/tracking.service';
import { GlobalConfigsService } from '../../services/global-configs.service';
import { FileUploader, FileLikeObject, FileItem } from 'ng2-file-upload';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { PercentPipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Chooser } from '@awesome-cordova-plugins/chooser';

@Component({
  selector: 'pec-multi-file-upload',
  templateUrl: './multi-file-upload.component.html',
  styleUrls: ['./multi-file-upload.component.scss'],
  providers: [PercentPipe],
})
export class MultiFileUploadComponent extends BaseComponent implements OnDestroy {
  @Input() label: string;
  public fileInput: HTMLInputElement;
  public docTypeId = '';
  public isAndroid: boolean;
  public uploader: FileUploader;
  public uploadedFileSize = 0;
  public uploadedFiles: FileItem[];
  public count = 0;
  public previewPath: any;

  private maxFileSize = 15 * 1024 * 1024;
  private queueLimit = 30;
  private alert: HTMLIonAlertElement;
  private errorMessage: string;
  private pattern;

  constructor(
    private trackingService: TrackingService,
    private getPictureService: GetPictureService,
    private globalConfigs: GlobalConfigsService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private sanitizer: DomSanitizer
  ) {
    super();
    this.uploader = new FileUploader({
      allowedMimeType: [
        'image/png',
        'image/gif',
        'image/jpg',
        'image/jpeg',
        'image/bmp',
        'image/x-ms-bmp',
        'doc/rtf',
        'text/rtf',
        'text/richtext',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ],
      maxFileSize: this.maxFileSize,
      queueLimit: this.queueLimit,
    });
    this.uploader.onWhenAddingFileFailed = (item, filter, options) =>
      this.onWhenAddingFileFailed(item, filter, options);

    this.uploader.onAfterAddingFile = (fileItem) => {
      if (fileItem.file.type && fileItem.file.type.indexOf('image/') > -1) {
        const url = window.URL
          ? window.URL.createObjectURL(fileItem._file)
          : (window as any).webkitURL.createObjectURL(fileItem._file);
        const fileName = fileItem.file.name;

        for (let i = 0, l = this.uploader.queue.length; i < l; ++i) {
          if (this.uploader.queue[i].file.name === fileName) {
            // eslint-disable-next-line @typescript-eslint/dot-notation
            this.uploader.queue[i].file['imgUrl'] = url;
            break;
          }
        }
      }
    };

    this.uploader.onAfterAddingAll = (items) => this.onAfterAddingAll(items);

    this.pattern = new RegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    this.isAndroid = this.globalConfigs.isAndroid;
  }

  public ngOnDestroy() {
    this.count = 0;
    this.clearSubscriptions();
  }

  public trackSelect() {
    this.trackingService.trackEvent({
      category: 'Upload Document',
      action: 'Tapped on Select File',
      label: this.docTypeId ?? '',
      value: '',
    });
  }

  // this action sheet is only for Android devices. iOS works fine with the type="file" input
  public presentActionSheet() {
    this.actionSheetCtrl
      .create({
        header: 'Select an Action',
        buttons: [
          {
            text: 'Use Camera',
            handler: () => {
              this.getPhotoFile('camera');
            },
          },
          {
            text: 'Load from Files or Photos',
            handler: () => {
              this.openFileExplorer();
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ],
      })
      .then((actionSheet) => actionSheet.present());
  }

  public getPhotoFile(selection) {
    this.getPictureService.getPicture(selection).then((data) => {
      this.addFileToQueue(data.file);
    });
  }

  public openFileExplorer() {
    if (this.globalConfigs.isIos) {
      Chooser.getFile().then((file: any) => {
        if (file) {
          const dataUri = file.dataURI;
          const croppedImageUri = dataUri.split(',')[1];
          const blob = this.getPictureService.b64toBlob(croppedImageUri, file.mediaType, 512);

          const ff: File = this.getPictureService.blobToFile(blob, file.name);

          this.addFileToQueue(ff);
        }
      });
    } else {
      this.fileInput = document.getElementById('fileInput') as HTMLInputElement;
      this.fileInput.click();
    }
  }

  public async change($event) {
    this.calculateTotalFileSize();
  }

  public getFileItem(): FileItem[] {
    return this.uploader.queue.map((fileItem) => {
      return fileItem;
    });
  }

  public removeFromQueue(item: any) {
    this.uploader.removeFromQueue(item);
    this.calculateTotalFileSize();
  }

  public removeFromQueueAll(): void {
    this.uploader.clearQueue();
  }

  public getFiles(): File[] {
    return this.uploader.queue.map((fileItem) => {
      return fileItem._file;
    });
  }

  private addFileToQueue(item: File) {
    const files: Array<File> = [];
    const resFile: File = item;

    files.push(resFile);

    this.uploader.addToQueue(files);
    this.calculateTotalFileSize();
  }

  private onWhenAddingFileFailed(item: FileLikeObject, filter: any, options: any) {
    if (this.alert) {
      return;
    }
    switch (filter.name) {
      case 'fileSize':
        this.errorMessage = `One or more of your files could not be added due to exceeding the total upload size limit.`;
        break;
      case 'mimeType':
        this.errorMessage = `This file type is not supported. Only GIF, JPG, PDF, BMP, DOC, DOCX, RTF, and PNG files are supported.`;
        break;
    }

    this.showAlert(this.errorMessage);
  }

  /*FileUpload Module does not have a built in function to validate total files size for all the files I had to check in after the files have
    been added and use uploadedFiles field to display the files in a container rather than using the queue */
  private onAfterAddingAll(items: FileItem[]) {
    this.calculateTotalFileSize();

    let i;

    for (i = 0; i < items.length; i++) {
      if (this.isGuid(items[i].file.name)) {
        const name = items[i].file.name.split('.');
        const extension = '.' + name[1];
        this.count += 1;
        items[i].file.name = 'Image' + this.count + extension;
      }
    }

    if (this.uploadedFileSize > 15) {
      for (i = 0; i < items.length; i++) {
        this.removeFromQueue(items[i]);
      }

      this.errorMessage = `One or more of your files could not be added due to exceeding the total upload size limit.`;
      this.showAlert(this.errorMessage);
    }

    this.uploadedFiles = this.uploader.queue;
  }

  private calculateTotalFileSize() {
    this.uploadedFileSize = 0;

    for (const queueItem of this.uploader.queue) {
      const uploadedFile: number = queueItem.file.size / (1024 * 1024);
      this.uploadedFileSize = this.uploadedFileSize + uploadedFile;
    }
  }

  private showAlert(message: string) {
    return this.alertCtrl
      .create({
        header: 'Cannot Add File(s)',
        message,
        buttons: [
          {
            text: 'OK',
            role: 'cancel',
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

  private isGuid(fileName: string): boolean {
    const name = fileName.split('.');
    if (name) {
      const match = name[0].match(this.pattern);
      if (match) {
        return true;
      } else if (name[0].toLowerCase() === 'image') {
        return true;
      }
    }

    return false;
  }
}
