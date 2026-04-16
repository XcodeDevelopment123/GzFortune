import { Component, OnInit } from '@angular/core';
import { StorageHelperService } from './shared/services/storage-helper.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import type { RouterDirection } from '@ionic/core/components';
import { AppService } from './shared/services/app.service';
import { StatusBar, Style } from '@capacitor/status-bar';
// import { DefaultWebViewOptions, InAppBrowser } from '@capacitor/inappbrowser';
import { Browser } from '@capacitor/browser';
import { register } from 'swiper/element/bundle';
import { AuthService } from './core/services/auth.service';
import { Subject,take, takeUntil } from 'rxjs';
import { LoadingHelperService } from './shared/services/loading-helper.service';
import { UserStateService } from './core/services/user-state.service';
import { AuthInitializerService } from './core/services/auth-initializer.service';
import { AlertHelperService } from './shared/services/alert-helper.service';
import { MenuController } from '@ionic/angular';
import { Device } from '@capacitor/device';
import { Platform } from '@ionic/angular';
import { environment } from '../environments/environment';
import { MobileAppVersionService } from './core/repo/api/mobileversion.service';
import { App } from '@capacitor/app';
import { NgZone } from '@angular/core';



declare global {
  interface Window {
    plugins: any;
  }
}

register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  isAuthenticated: boolean = true;
  loading: boolean = false;
  DeviceName: string = '';
  Appvertion = '';
  ApiAppvertion = '';
  forceUpdateRequired = false;

  public readonly accountPages: {
    title: string;
    url: string;
    icon: string;
    routerDirection: RouterDirection;
    isOpenBrowser?: boolean;
  }[] = [
    {
      title: 'Edit Profile',
      url: 'account/edit-profile',
      icon: 'person-circle-outline',
      routerDirection: 'forward',
    },
    {
      title: 'Reset Password',
      url: 'account/reset-password',
      icon: 'key-outline',
      routerDirection: 'forward',
    },
    {
      title: 'Wallet',
      url: 'wallet',
      icon: 'wallet-outline',
      routerDirection: 'root',
    },
    // {
    //   title: 'My Addresses',
    //   url: 'account/member-address',
    //   icon: 'location-outline',
    //   routerDirection: 'forward',
    // },
    {
      title: 'Delete My Account',
      url: 'account/delete-account',
      icon: 'trash-outline',
      routerDirection: 'forward',
    },
  ];

  public readonly generalPages: {
    title: string;
    url: string;
    icon: string;
    routerDirection: RouterDirection;
    isOpenBrowser?: boolean;
  }[] = [
    // {
    //   title: 'About Us',
    //   url: 'general/about-us',
    //   icon: 'information-circle-outline',
    //   routerDirection: 'forward',
    // },
    // {
    //   title: 'Outlets',
    //   url: 'general/outlets',
    //   icon: 'location-outline',
    //   routerDirection: 'forward',
    // },
    {
      title: 'Terms & Conditions',
      url: 'https://www.luckypot2u.com/',
      icon: 'document-text-outline',
      routerDirection: 'forward',
      isOpenBrowser: true,
    },
    {
      title: 'Privacy & Policy',
      url: 'https://www.luckypot2u.com/',
      icon: 'document-text-outline',
      routerDirection: 'forward',
      isOpenBrowser: true,
    },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private readonly storageHelper: StorageHelperService,
    private navCtrl: NavController,
    private appService: AppService,
    private loadingHelper: LoadingHelperService,
    private authInitializerService: AuthInitializerService,
    public auth: AuthService,
    private alertHelper: AlertHelperService,
    private userState: UserStateService,
    private router: Router,
    private menuCtrl: MenuController,
    private platform: Platform,
    private mobileAppVersionService: MobileAppVersionService,
    private ngZone: NgZone,
  ) {
    this.platform.ready().then(() => {
      this.initOneSignal();

      // ✅ 冷启动检查一次
      this.VersionCheck();

      // ✅ 从 Play Store / App Store 回来再检查一次
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          this.ngZone.run(() => this.VersionCheck());
        }
      });
    });
  }

  private initOneSignal() {
    // Cancel request notification when its browser
    if (!window.plugins || !window.plugins.OneSignal) {
      console.log('OneSignal plugin not available (maybe running in browser).');
      return;
    }

    const OneSignal = window.plugins.OneSignal;

    // 1) init oneSignal
    OneSignal.initialize('363b873c-4b44-494c-9c7f-fc8948ef5ac0');

    // 2) Request notification access
    OneSignal.Notifications.requestPermission(true).then((accepted: boolean) => {
      console.log('User accepted notifications:' + accepted);

      if (accepted == true) {
        const subId = OneSignal.User.pushSubscription.id;
      }
    });

    // 3) Receive notification when open app
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event: any) => {
      const currentUrl = this.router.url; // 当前页面的路由，比如 '/tabs/home' 或 '/lucky-pot/123'
      console.log('Notification in foreground on page:', currentUrl, event);

      // // 举例：在 /lucky-pot 相关页面就不弹系统通知，而是自己处理
      // if (currentUrl.startsWith('/outlets')) {
      //   event.preventDefault(); // ❗️先拦截，系统通知不会弹出来

      //   const notification = event.notification;
      //   const data = notification.additionalData || {};
      //   console.log('Handle in-app only:', data);
      // } else {
      //   // 其他页面就照常显示系统通知
      //   event.notification.display();
      // }
    });

    // 4) Click Notification
    OneSignal.Notifications.addEventListener('click', (event: any) => {
      console.log('Notification clicked:', event);
      // 在这里根据 event.notification.additionalData 做页面跳转
    });
  }
  async ngOnInit(): Promise<void> {
    this.VersionCheck();

    await this.authInitializerService.init();

    this.loadingHelper.loading$.pipe(takeUntil(this.destroy$)).subscribe((status) => {
      this.loading = status;
    });

    const isFirstTimeOpen = await this.storageHelper.checkFirstTimeOpen();
    // if (!isFirstTimeOpen) {
    //   this.navCtrl.navigateRoot('/on-boarding');
    //   await this.storageHelper.setFirstTimeOpen();
    // }

    // Other initialization logic can go here
    this.appService.disableTextZoom();
    // if (environment.production) {
    //   this.storageHelper.removeCurrentOrderPre();
    // }

    await this.checkDevice();

    if (this.appService.isMobilePlatform()) {
      this.appService.setupBackButtonEvent();
      StatusBar.setStyle({ style: Style.Light });
      StatusBar.setBackgroundColor({ color: '#f8f8f8' });
      StatusBar.setOverlaysWebView({ overlay: true });
    }
  }

  async checkDevice() {
    const info = await Device.getInfo();
    this.DeviceName = info.model;
  }

  async openBrowser(url: string) {
    if (this.appService.isMobilePlatform()) {
      await Browser.open({ url });
    } else {
      window.open(url, '_blank');
    }
  }

  async onLogout() {
    const alert = await this.alertHelper.createConfirmAlert(
      'Logout',
      'Are you sure you want to log out?',
    );
    await alert.present();

    const { role } = await alert.onDidDismiss();
    if (role !== 'confirm') return;

    try {
      await this.auth.logout();

      await (this.userState as any).clearKeepLoginRequest?.();
      (this.userState as any).updateMemberInfo?.(null);
      (this.userState as any).reset?.();

      await this.menuCtrl.close();

      await this.router.navigate(['/auth/login'], { replaceUrl: true });

      const OneSignal = window.plugins.OneSignal;
      OneSignal.logout();
    } catch (e) {
      const err = await this.alertHelper.createBasicAlert('Logout failed', 'Please try again.');
      await err.present();
    }
  }

  async VersionCheck() {
    const info = await Device.getInfo();

    // ✅ 建议用真实 app 版本（比 environment 更可靠）
    let currentVersion = environment.androidAppVersion;
    try {
      const appInfo = await App.getInfo();
      currentVersion = appInfo.version; // e.g. "1.2.3"
    } catch {}

    this.mobileAppVersionService
      .getMobileAppVersion()
      .pipe(take(1))
      .subscribe((res) => {
        const apiVersion = info.platform === 'ios' ? res.iosAppVersion : res.androidAppVersion;

        this.Appvertion = currentVersion;
        this.ApiAppvertion = apiVersion;

        const compareResult = this.compareVersion(this.Appvertion, this.ApiAppvertion);

        // ✅ 更新 flag（给 resume 用）
        this.forceUpdateRequired = compareResult === -1;

        if (this.forceUpdateRequired) {
          // ✅ 关键：路由改成你真实的 loading 页面 path
          if (!this.router.url.startsWith('/loading')) {
            this.navCtrl.navigateRoot('/loading');
          }
          return;
        }

        // （可选）如果不需要更新且目前在 loading 页，可以放行回首页
        if (this.router.url.startsWith('/loadin')) {
          this.navCtrl.navigateRoot('/tabs/home'); // 改成你真实 home
        }
      });
  }

  // result 1 = currentVersion is newer
  // result -1 = apiVersion is newer
  // result 0 = equal
  compareVersion(currentVersion: string, appVersion: string): number {
    const currentParts = currentVersion.split('.').map(Number);
    const appParts = appVersion.split('.').map(Number);

    if (currentParts && appParts) {
      for (let i = 0; i < Math.max(currentParts.length, appParts.length); i++) {
        const current = currentParts[i] || 0;
        const app = appParts[i] || 0;

        if (current > app) {
          console.log('The current app version is newer than the server version.');
          return 1;
        }
        if (current < app) {
          return -1;
        }
      }
    }

    return 0;
  }
}
