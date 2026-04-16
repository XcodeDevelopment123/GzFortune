import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WalletPageRoutingModule } from './wallet-routing.module';

import { WalletPage } from './wallet.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { QRCodeComponent } from 'angularx-qrcode';
import { SharedInputComponentsModule } from 'src/app/shared/input-components/shared-input-components.module';
import { TopUpCardComponent } from './components/top-up-card/top-up-card.component';
import { QrCodeCardComponent } from './components/qr-code-card/qr-code-card.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WalletPageRoutingModule,
    SharedComponentsModule,
    SharedInputComponentsModule,
    QRCodeComponent,
  ],
  declarations: [WalletPage, TopUpCardComponent, QrCodeCardComponent,],
})
export class WalletPageModule {}
