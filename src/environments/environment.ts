// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  enableLogging: true,
  googleMapsApiKey: 'AIzaSyDuWYhKjZcRLMciw70bWBnXwx_7JkarmeM',
  //apiUrl: 'https://gzfortune.api2.xcode.com.my/api',
  //serverUrl: 'https://gzfortune.api2.xcode.com.my',
  apiUrl: 'https://gzfortuneapi.letianse.com/api',
  serverUrl: 'https://gzfortuneapi.letianse.com',
  androidAppVersion: '1.3.6',
  iosAppVersion: '1.3.6',
  androidStore: 'https://play.google.com/store/apps/details?id=com.gz.fortune',
  appleStore: 'https://apps.apple.com/my/app/id6766782701',

  // Platform indicator: 'APP' = Mobile (Capacitor/Native), 'WEB' = Browser (PWA)
  platform: 'APP' as 'APP' | 'WEB',

  // PWA version — bump this to force all web clients to reload
  pwaVersion: '1.3.6',

  // OneSignal App ID (shared between Native and Web push)
  oneSignalAppId: '491eab16-2d96-4351-afb9-2186f4e07d7e',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
