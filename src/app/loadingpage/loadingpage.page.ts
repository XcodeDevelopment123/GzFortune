import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { App } from '@capacitor/app';
import { AlertHelperService } from 'src/app/shared/services/alert-helper.service';

@Component({
  selector: 'app-loadingpage',
  templateUrl: './loadingpage.page.html',
  styleUrls: ['./loadingpage.page.scss'],
  standalone: false,
})
export class LoadingpagePage implements OnInit, OnDestroy {
  private backSub?: Subscription;

  constructor(
    private platform: Platform,
    private alertHelper: AlertHelperService,
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.platform.ready().then(async () => {
      const alert = await this.alertHelper.crateUpdateAppAlert(
        'Update Available',
        'A new version of the app is available. Please update to the latest version.',
      );
      await alert.present();
    });
  }

  // ✅ Ionic 页面生命周期：进入页面时才开始拦截
  ionViewDidEnter() {
    this.backSub = this.platform.backButton.subscribeWithPriority(9999, async () => {
      App.exitApp(); // 退出 App
    });
  }

  // ✅ 离开页面就取消拦截，避免影响其它页面
  ionViewWillLeave() {
    this.backSub?.unsubscribe();
    this.backSub = undefined;
  }

  ngOnDestroy() {
    this.backSub?.unsubscribe();
  }
}
