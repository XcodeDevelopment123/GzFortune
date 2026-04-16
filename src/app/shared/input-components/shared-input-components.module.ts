import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TopupAmountInputComponent } from './topup-amount-input/topup-amount-input.component';
import { MaskitoDirective } from '@maskito/angular';
import { ProfilePictureInputComponent } from './profile-picture-input/profile-picture-input.component';
import { PasswordInputComponent } from './password-input/password-input.component';
import { GeneralSelectComponent } from './general-select/general-select.component';
import { GeneralTextareaComponent } from './general-textarea/general-textarea.component';
import { GeneralInputComponent } from './general-input/general-input.component';
import { GeneralDateInputComponent } from './general-date-input/general-date-input.component';
import { PhoneNumberInputComponent } from './phone-number-input/phone-number-input.component';


@NgModule({
  declarations: [
    TopupAmountInputComponent,
    ProfilePictureInputComponent,
    PasswordInputComponent,
    PhoneNumberInputComponent,
    GeneralSelectComponent,
    GeneralTextareaComponent,
    GeneralInputComponent,
    GeneralDateInputComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    MaskitoDirective,
  ],
  exports: [
    TopupAmountInputComponent,
    ProfilePictureInputComponent,
    PasswordInputComponent,
    PhoneNumberInputComponent,

    GeneralSelectComponent,
    GeneralTextareaComponent,
    GeneralInputComponent,
    GeneralDateInputComponent,
  ],
})
export class SharedInputComponentsModule {}
