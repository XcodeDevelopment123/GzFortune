import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VoucherDetailPageRoutingModule } from './voucher-detail-routing.module';

import { VoucherDetailPage } from './voucher-detail.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VoucherDetailPageRoutingModule,
    SharedComponentsModule,
  ],
  declarations: [VoucherDetailPage],
})
export class VoucherDetailPageModule {}
