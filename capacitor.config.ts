import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gzfortune.gzfortuneapp',
  appName: 'Fortune Claypot',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000, // 启动显示时间 (毫秒)
      launchAutoHide: true,
      backgroundColor: 'rgb(8, 8, 8)',
      showSpinner: false,
    },
  },
};

export default config;
