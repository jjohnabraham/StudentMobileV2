import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import 'hammerjs';

if (environment.production) {
  enableProdMode();
}

declare let __webpack_public_path__: any;

if (window.cecPreferences['com.careered.content']) {
  __webpack_public_path__ = window.cecPreferences['com.careered.content'];
  // document.head.innerHTML =
  //   document.head.innerHTML + "<base href='" + window.cecPreferences['com.careered.content'] + "' />";
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));
