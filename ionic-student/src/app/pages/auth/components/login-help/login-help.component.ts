import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ViewDidEnter } from '@ionic/angular';

@Component({
  selector: 'pec-login-help',
  templateUrl: './login-help.component.html',
  styleUrls: ['./login-help.component.scss'],
})
export class LoginHelpComponent implements ViewDidEnter {
  public url: string;

  constructor(private router: Router) {}

  public closePage() {
    this.router.navigate(['/login']);
  }

  public ionViewDidEnter() {
    this.url = window.history.state.url;

    if (!this.url) {
      this.closePage();
    }
  }
}
