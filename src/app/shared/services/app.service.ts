import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { TextZoom } from '@capacitor/text-zoom';
import {
  AlertController,
  LoadingController,
  ModalController,
  NavController,
  Platform,
} from '@ionic/angular';
import { PageStateService } from './page-state.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private router: Router,
    private pageStateService: PageStateService,
  ) {}

  async disableTextZoom() {
    try {
      await TextZoom.set({ value: 1.0 });
    } catch (error) {}
  }

  isMobilePlatform() {
    if (this.platform.is('hybrid')) {
      document.body.classList.add('mobile-app');
      document.documentElement.classList.add('mobile-app');
      return true;
    }
    return false;
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  setupBackButtonEvent() {
    App.removeAllListeners();
    App.addListener('backButton', async (back) => {
      const loading = await this.loadingCtrl.getTop();
      if (loading) {
        return;
      }
      const modal = await this.modalCtrl.getTop();
      if (modal) {
        await modal.dismiss();
        return;
      }

      const alertApp = await this.alertCtrl.getTop();
      if (alertApp) {
        await alertApp.dismiss();
        return;
      }

      const isPop = await this.navCtrl.pop();
      if (isPop) {
        return;
      }

      const currentUrl = this.router.url;
      if (currentUrl.includes('payment-checkout')) {
        this.pageStateService.triggerPaymentCheckoutPageBack();
        return;
      }
    });
  }
}
