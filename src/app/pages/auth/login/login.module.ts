import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { SharedComponentsModule } from 'src/app/shared/components/shared-components.module';
import { SharedInputComponentsModule } from 'src/app/shared/input-components/shared-input-components.module';
import { EmailLoginComponent } from './components/email-login/email-login.component';
import { PhoneLoginComponent } from './components/phone-login/phone-login.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    LoginPageRoutingModule,
    SharedComponentsModule,
    SharedInputComponentsModule,
  ],
  declarations: [LoginPage, EmailLoginComponent, PhoneLoginComponent],
})
export class LoginPageModule {}
