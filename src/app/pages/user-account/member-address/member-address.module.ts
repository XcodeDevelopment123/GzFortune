import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MemberAddressPageRoutingModule } from './member-address-routing.module';

import { MemberAddressPage } from './member-address.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemberAddressPageRoutingModule,
    SharedComponentsModule,
  ],
  declarations: [MemberAddressPage],
})
export class MemberAddressPageModule {}
