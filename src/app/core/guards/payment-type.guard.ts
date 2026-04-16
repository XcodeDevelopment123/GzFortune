import { CanActivateFn } from '@angular/router';
import { PaymentCheckoutPageType } from 'src/app/shared/statics/interface-helper';

export const paymentTypeGuard: CanActivateFn = (route, state) => {
  const type = route.paramMap.get('type') as PaymentCheckoutPageType;

  const allowedTypes: PaymentCheckoutPageType[] = ['delivery', 'pickup', 'topup'];
  if (!type || !allowedTypes.includes(type)) {
    console.error('Not support payment type :', type);
    return false;
  }
  return true;
};
