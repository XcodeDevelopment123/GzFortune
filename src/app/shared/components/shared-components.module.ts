import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { QRCodeComponent } from 'angularx-qrcode';
import { QrCodeModalComponent } from './qr-code-modal/qr-code-modal.component';
import { DateSelectorComponent } from './date-selector/date-selector.component';
import { LoadingComponent } from './loading/loading.component';
import { LottieWrapperComponent } from './lottie-wrapper/lottie-wrapper.component';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { SelectPaymentMethodModalComponent } from './select-payment-method-modal/select-payment-method-modal.component';
import { SelectVoucherModalComponent } from './select-voucher-modal/select-voucher-modal.component';
import { SubPaymentSelectorModalComponent } from './sub-payment-selector-modal/sub-payment-selector-modal.component';
import { TransactionListComponent } from '../components/transaction-list/transaction-list.component';


@NgModule({
  declarations: [
    HeaderComponent,
    QrCodeModalComponent,
    SelectPaymentMethodModalComponent,
    SelectVoucherModalComponent,
    SubPaymentSelectorModalComponent,
    DateSelectorComponent,
    LoadingComponent,
    LottieWrapperComponent,
    MenuItemComponent,
    TransactionListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonicModule,
    ReactiveFormsModule,
    QRCodeComponent,
  ],
  exports: [
    HeaderComponent,
    QrCodeModalComponent,
    SelectPaymentMethodModalComponent,
    SelectVoucherModalComponent,
    SubPaymentSelectorModalComponent,
    DateSelectorComponent,
    LoadingComponent,
    LottieWrapperComponent,
    MenuItemComponent,
    TransactionListComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedComponentsModule {}
