import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export const matchPasswordValidatorGroup: ValidatorFn = (
  group: AbstractControl,
): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const rePassword = group.get('rePassword')?.value;

  if (!password || !rePassword) {
    return null;
  }
  return password !== rePassword ? { notSameAsPassword: true } : null;
};
