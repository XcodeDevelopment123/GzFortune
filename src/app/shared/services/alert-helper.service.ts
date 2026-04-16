import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { environment } from 'src/environments/environment';
import { App } from '@capacitor/app';



@Injectable({
  providedIn: 'root',
})
export class AlertHelperService {
  constructor(
    private alertController: AlertController,
    private platform: Platform,
  ) {}

  async createBasicAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      cssClass: 'juicy-alert',
      buttons: [
        {
          text: 'OK',
          role: 'confirm',
          cssClass: 'alert-button-confirm',
        },
      ],
      backdropDismiss: false,
    });

    return alert;
  }

  async createConfirmAlert(header: string, message: string): Promise<HTMLIonAlertElement> {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      cssClass: 'juicy-alert',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-button-cancel',
        },
        {
          text: 'Yes',
          role: 'confirm',
          cssClass: 'alert-button-confirm',
        },
      ],
      backdropDismiss: false,
    });

    return alert;
  }

  async crateUpdateAppAlert(header: string, message: string): Promise<HTMLIonAlertElement> {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      cssClass: 'juicy-alert',
      buttons: [
        {
          text: 'Yes',
          role: 'confirm',
          cssClass: 'alert-button-confirm',
          handler: async () => {
            if (this.platform.is('ios')) {
              // iOS: Redirect to App Store
              await Browser.open({
                url: environment.appleStore,
              });
            } else{
              // Android: Redirect to Play Store
              await Browser.open({
                url: environment.androidStore,
              });
            }

            App.exitApp();
          },
        },
      ],
      backdropDismiss: false,
    });

    return alert;
  }
}
