import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaymentCheckoutPageRoutingModule } from './payment-checkout-routing.module';

import { PaymentCheckoutPage } from './payment-checkout.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PaymentCheckoutPageRoutingModule,
    SharedComponentsModule,
  ],
  declarations: [PaymentCheckoutPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PaymentCheckoutPageModule {}
