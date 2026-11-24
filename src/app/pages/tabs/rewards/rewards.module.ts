import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RewardsPageRoutingModule } from './rewards-routing.module';

import { RewardsPage } from './rewards.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { SharedInputComponentsModule } from 'src/app/shared/input-components/shared-input-components.module';
import { StampTabComponent } from './components/stamp-tab/stamp-tab.component';
import { StampCardComponent } from './components/stamp-card/stamp-card.component';
import { StampTncModalComponent } from './components/stamp-tnc-modal/stamp-tnc-modal.component';
import { PartnerOffersTabComponent } from './components/partner-offers-tab/partner-offers-tab.component';
import { PartnerWalletTabComponent } from './components/partner-wallet-tab/partner-wallet-tab.component';
import { VoucherCodeModalComponent } from './components/voucher-code-modal/voucher-code-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RewardsPageRoutingModule,
    SharedComponentsModule,
    SharedInputComponentsModule,
  ],
  declarations: [
    RewardsPage,
    StampTabComponent,
    StampCardComponent,
    StampTncModalComponent,
    PartnerOffersTabComponent,
    PartnerWalletTabComponent,
    VoucherCodeModalComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RewardsPageModule {}
