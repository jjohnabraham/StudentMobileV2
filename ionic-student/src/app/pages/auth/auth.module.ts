import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthPageRoutingModule } from './auth-routing.module';
import { LoginComponent } from './components/login/login.component';
import { SharedModule } from '../../shared/shared.module';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { LoginHelpComponent } from './components/login-help/login-help.component';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AuthPageRoutingModule, SharedModule, ReactiveFormsModule],
  declarations: [LoginComponent, LoginHelpComponent],
  providers: [Keyboard, InAppBrowser, FingerprintAIO],
})
export class AuthModule {}
