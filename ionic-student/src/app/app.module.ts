import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DataModule } from './data/data.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './pages/auth/auth.module';
import { APP_BASE_HREF, LocationStrategy } from '@angular/common';
import { PECLocationStrategy } from './shared/services/pec-location-strategy.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ scrollPadding: false, scrollAssist: true, inputBlurring: true, rippleEffect: false }),
    AppRoutingModule,
    DataModule,
    SharedModule,
    AuthModule,
  ],
  providers: [Keyboard, { provide: LocationStrategy, useClass: PECLocationStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
