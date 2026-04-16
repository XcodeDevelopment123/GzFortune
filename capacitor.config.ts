import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.luckypot.luckypotapp',
  appName: 'Luckypot幸湘菜馆',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000, // 启动显示时间 (毫秒)
      launchAutoHide: true,
      backgroundColor: '#FFFFFFFF',
      showSpinner: false,
    },
  },
};

export default config;
