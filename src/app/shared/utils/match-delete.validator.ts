import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function matchDeleteValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    return control.value !== 'DELETE' ? { notMatchDelete: true } : null;
  };
}
