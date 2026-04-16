import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateEditAddressPageRoutingModule } from './create-edit-address-routing.module';

import { CreateEditAddressPage } from './create-edit-address.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { SharedInputComponentsModule } from 'src/app/shared/input-components/shared-input-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreateEditAddressPageRoutingModule,
    SharedComponentsModule,
    SharedInputComponentsModule,
    ReactiveFormsModule,
  ],
  declarations: [CreateEditAddressPage],
})
export class CreateEditAddressPageModule {}
