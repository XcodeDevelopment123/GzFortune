import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RewardsPageRoutingModule } from './rewards-routing.module';

import { RewardsPage } from './rewards.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { SharedInputComponentsModule } from 'src/app/shared/input-components/shared-input-components.module';
import { PointTabComponent } from './components/point-tab/point-tab.component';
import { StampTabComponent } from './components/stamp-tab/stamp-tab.component';
import { VoucherTabComponent } from './components/voucher-tab/voucher-tab.component';
import { StampCardComponent } from './components/stamp-card/stamp-card.component';
import { StampTncModalComponent } from './components/stamp-tnc-modal/stamp-tnc-modal.component';

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
    PointTabComponent,
    StampTabComponent,
    StampCardComponent,
    VoucherTabComponent,
    StampTncModalComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RewardsPageModule {}
