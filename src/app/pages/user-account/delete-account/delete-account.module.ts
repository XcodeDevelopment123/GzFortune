import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeleteAccountPageRoutingModule } from './delete-account-routing.module';

import { DeleteAccountPage } from './delete-account.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { SharedInputComponentsModule } from 'src/app/shared/input-components/shared-input-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeleteAccountPageRoutingModule,
    SharedComponentsModule,
    SharedInputComponentsModule,
  ],
  declarations: [DeleteAccountPage],
})
export class DeleteAccountPageModule {}
