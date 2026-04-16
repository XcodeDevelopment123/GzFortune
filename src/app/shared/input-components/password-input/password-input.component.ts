import { Component } from '@angular/core';
import { BaseInputComponent } from '../base-input.component';

@Component({
  selector: 'app-password-input',
  templateUrl: './password-input.component.html',
  styleUrls: ['./password-input.component.scss'],
  standalone: false,
})
export class PasswordInputComponent extends BaseInputComponent {
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  check(type: string): boolean {
    return this.formControl?.errors?.['passwordStrength']?.[type] ?? false;
  }

  get notSameAsPassword() {
    return this.formControl?.parent?.hasError('notSameAsPassword') && this.formControl?.touched;
  }
}
