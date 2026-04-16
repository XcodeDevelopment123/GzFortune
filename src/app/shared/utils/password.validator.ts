import { ValidatorFn, AbstractControl } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null;

    const value = control.value;
    const requirements = {
      hasUppercase: /[A-Z]/.test(value),
      hasLowercase: /[a-z]/.test(value),
      hasNumber: /\d/.test(value),
      hasSpecialChar: /[@$!%*?&]/.test(value),
      hasMinLength: value.length >= 8,
    };

    const isValid = Object.values(requirements).every(Boolean);

    return isValid ? null : { passwordStrength: requirements };
  };
}
