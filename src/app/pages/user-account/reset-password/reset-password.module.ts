import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResetPasswordPageRoutingModule } from './reset-password-routing.module';

import { ResetPasswordPage } from './reset-password.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { SharedInputComponentsModule } from 'src/app/shared/input-components/shared-input-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResetPasswordPageRoutingModule,
    ReactiveFormsModule,
    SharedComponentsModule,
    SharedInputComponentsModule,
  ],
  declarations: [ResetPasswordPage],
})
export class ResetPasswordPageModule {}
