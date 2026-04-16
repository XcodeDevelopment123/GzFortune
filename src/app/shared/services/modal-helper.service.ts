import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { QrCodeModalComponent } from '../components/qr-code-modal/qr-code-modal.component';
import { DateSelectorComponent } from '../components/date-selector/date-selector.component';
import { SelectVoucherModalComponent } from '../components/select-voucher-modal/select-voucher-modal.component';
import { SelectPaymentMethodModalComponent } from '../components/select-payment-method-modal/select-payment-method-modal.component';
import { SubPaymentSelectorModalComponent } from '../components/sub-payment-selector-modal/sub-payment-selector-modal.component';
import { SubPaymentOption } from '../models/payment.model';
import { VoucherDelivery, VoucherDeliveryList } from 'src/app/core/models/delivery.model';
import { Reward } from 'src/app/core/models/reward.model';

@Injectable({
  providedIn: 'root',
})
export class ModalHelperService {
  constructor(private modalCtrl: ModalController) {}

  async createQrCodeModal(qrData: string, labelText: string) {
    return await this.modalCtrl.create({
      component: QrCodeModalComponent,
      componentProps: {
        qrData: qrData,
        labelText: labelText,
      },
      cssClass: 'qr-code-modal',
      backdropDismiss: true,
    });
  }

  async createQrCodeWithRewardData(Reward: any, labelText: string) {
    console.log('Reward in modal helper:', Reward);
    return await this.modalCtrl.create({
      component: QrCodeModalComponent,
      componentProps: {
        qrData: Reward.voucherNo,
        labelText: Reward.voucherNo,
      },
      cssClass: 'qr-code-modal',
      backdropDismiss: true,
    });
  }

  async createDateSelectorModal() {
    return await this.modalCtrl.create({
      component: DateSelectorComponent,
      cssClass: 'date-selector-modal',
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      backdropDismiss: true,
    });
  }

  async createSelectPaymentMethodModal(method: string | null, subOptions: SubPaymentOption | null) {
    return await this.modalCtrl.create({
      component: SelectPaymentMethodModalComponent,
      backdropDismiss: true,
      componentProps: {
        selectedPaymentMethod: method,
        selectedSubOption: method && subOptions ? { [method]: subOptions } : {},
      },
    });
  }

  async createSelectVoucherModal(deliveryVoucher: VoucherDeliveryList) {
    const modal = await this.modalCtrl.create({
      component: SelectVoucherModalComponent,
      componentProps: {
        deliveryVoucher: deliveryVoucher,
        backdropDismiss: true,
      },
      cssClass: 'select-voucher-modal',
    });

    return modal;
  }

  async createSubPaymentSelectorModal(type: string) {
    return await this.modalCtrl.create({
      component: SubPaymentSelectorModalComponent,
      componentProps: {
        type: type,
      },
      backdropDismiss: true,
    });
  }

  async dismissModal(data?: any) {
    this.modalCtrl.dismiss(data);
  }
}
