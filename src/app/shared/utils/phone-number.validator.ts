import { ValidatorFn, AbstractControl } from '@angular/forms';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';

/**
 * Custom Angular validator to check if a phone number is valid
 * based on a specified country code.
 *
 * @param countryCode - The ISO 3166-1 alpha-2 country code (e.g., 'MY', 'US'). Defaults to 'MY'.
 * @returns A ValidatorFn that validates phone number format according to the given country.
 *
 * @example
 * // Malaysia number
 * this.form = this.fb.group({
 *   phone: ['', phoneNumberValidator('MY')]
 * });
 */
export function phoneNumberValidator(countryCode: CountryCode = 'MY'): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value;
    if (!value) return null;

    try {
      const phoneNumber = parsePhoneNumberFromString(value, countryCode);
      const isValid = phoneNumber?.isValid();

      return isValid
        ? null
        : { phoneFormat: { requiredFormat: `Invalid phone format for ${countryCode}` } };
    } catch (e) {
      return { phoneFormat: { error: 'Invalid phone number format or country code' } };
    }
  };
}
