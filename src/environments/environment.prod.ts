export const environment = {
  production: true,
  enableLogging: false,
  googleMapsApiKey: 'AIzaSyDuWYhKjZcRLMciw70bWBnXwx_7JkarmeM',
  apiUrl: 'https://gzfortune.api2.xcode.com.my/api',
  serverUrl: 'https://gzfortune.api2.xcode.com.my',
  //apiUrl: 'https://gzfortuneapi.letianse.com/api',
  //serverUrl: 'https://gzfortuneapi.letianse.com',
  androidAppVersion: '1.3.6',
  iosAppVersion: '1.3.6',
  androidStore: 'https://play.google.com/store/apps/details?id=com.gz.fortune',
  appleStore:
    'https://apps.apple.com/my/app/luckypot%E5%B9%B8%E6%B9%98%E8%8F%9C%E9%A6%86/id6753709372',

  // Platform indicator: 'APP' = Mobile (Capacitor/Native), 'WEB' = Browser (PWA)
  platform: 'WEB' as 'APP' | 'WEB',

  // PWA version — bump this to force all web clients to reload
  pwaVersion: '1.3.6',

  // OneSignal App ID (shared between Native and Web push)
  oneSignalAppId: '491eab16-2d96-4351-afb9-2186f4e07d7e',
};

