// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'https://int-studentapp.careered.com/api/alpha/', // window['cecPreferences']['com.careered.api']
  themeId: 9, //  window['cecPreferences']['com.careered.theme_id']
  assetsUrl: 'assets/', // window['cecPreferences']['com.careered.url']
  messengerApiUrl: 'https://int-messenger.aiuniv.edu/', // window['cecPreferences']['com.careered.messengerapi']
  contentUrl: '', // window['cecPreferences']['com.careered.content']
  messengerUrl: '', // window['cecPreferences']['com.careered.messengerurl']
  environment: 'dev', // window['cecPreferences']['com.careered.environment']
  customUrlScheme: 'ctustudentint', // window['cecPreferences']['com.careered.customurlscheme']
  onboardingScreensVersion: '4.0.5', // window['cecPreferences']['com.careered.onboardingscreensversion']
  cacheSuffix: '', // window['cecPreferences']['com.careered.cacheSuffix']
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
