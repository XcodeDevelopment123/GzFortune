import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StartOrderPageRoutingModule } from './start-order-routing.module';

import { StartOrderPage } from './start-order.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StartOrderPageRoutingModule,
    SharedComponentsModule,
  ],
  declarations: [StartOrderPage],
})
export class StartOrderPageModule {}
