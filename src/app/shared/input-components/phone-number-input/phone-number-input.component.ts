import { Component } from '@angular/core';
import { MaskitoOptions, MaskitoElementPredicate } from '@maskito/core';
import { BaseInputComponent } from '../base-input.component';

@Component({
  selector: 'app-phone-number-input',
  templateUrl: './phone-number-input.component.html',
  styleUrls: ['./phone-number-input.component.scss'],
  standalone: false,
})
export class PhoneNumberInputComponent extends BaseInputComponent {
  readonly phoneMask: MaskitoOptions = {
    mask: ['+', '6', '0', ' ', '1', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/],
  };

  readonly maskPredicate: MaskitoElementPredicate = async (el) =>
    (el as HTMLIonInputElement).getInputElement();
}
