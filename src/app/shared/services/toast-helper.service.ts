import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastHelperService {
  constructor(private toastController: ToastController) {}

  async presentSuccessToast(
    message: string,
    position: 'top' | 'middle' | 'bottom' = 'middle',
    duration = 2000,
  ) {
    this.present(message, 'juicy-toast juicy-toast-success', position, duration);
  }

  async presentInfoToast(
    message: string,
    position: 'top' | 'middle' | 'bottom' = 'middle',
    duration = 2000,
  ) {
    this.present(message, 'juicy-toast juicy-toast-info', position, duration);
  }

  async presentFailedToast(
    message: string,
    position: 'top' | 'middle' | 'bottom' = 'middle',
    duration = 2000,
  ) {
    this.present(message, 'juicy-toast juicy-toast-failed', position, duration);
  }

  private async present(
    message: string,
    cssClass: string,
    position: 'top' | 'middle' | 'bottom',
    duration: number,
  ) {
    const toast = await this.toastController.create({
      message,
      duration,
      position,
      cssClass,
      animated: true,
      color: '',
      buttons: [
        {
          side: 'end',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await toast.present();
  }
}
