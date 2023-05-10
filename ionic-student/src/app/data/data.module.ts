import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedModule],
  providers: [OpenNativeSettings],
})
export class DataModule {}
