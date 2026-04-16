import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderSummaryPageRoutingModule } from './order-summary-routing.module';

import { OrderSummaryPage } from './order-summary.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { VoucherSectionComponent } from './components/voucher-section/voucher-section.component';
import { PaymentMethodSectionComponent } from './components/payment-method-section/payment-method-section.component';
import { PaymentSummarySectionComponent } from './components/payment-summary-section/payment-summary-section.component';
import { CartItemsSectionComponent } from './components/cart-items-section/cart-items-section.component';
import { CartItemComponent } from './components/cart-item/cart-item.component';
import { PickUpOrderInfoSectionComponent } from './components/pick-up-order-info-section/pick-up-order-info-section.component';
import { PointSectionComponent } from './components/point-section/point-section.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderSummaryPageRoutingModule,
    SharedComponentsModule,
  ],
  declarations: [
    OrderSummaryPage,
    VoucherSectionComponent,
    PaymentSummarySectionComponent,
    PaymentMethodSectionComponent,
    CartItemsSectionComponent,
    CartItemComponent,
    PickUpOrderInfoSectionComponent,
    PointSectionComponent,
  ],
})
export class OrderSummaryPageModule {}
