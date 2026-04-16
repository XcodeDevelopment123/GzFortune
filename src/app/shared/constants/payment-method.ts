import { PaymentMethod, SubPaymentOption } from '../models/payment.model';

export const paymentMethods: PaymentMethod[] = [
  {
    key: 'app-wallet',
    label: 'Juicy Wallet',
    icon: 'assets/images/app-logo.png',
  },
  {
    key: 'curlec',
    label: 'Payment Gateway',
    icon: 'assets/icon/curlec-logo.svg',
  },
  {
    key: 'e-wallet',
    label: 'E-Wallet',
    requiresSubSelection: true,
    icon: 'assets/icon/payment-method-wallet.png',
  },
  {
    key: 'fpx',
    label: 'FPX Online Banking',
    requiresSubSelection: true,
    icon: 'assets/icon/payment-method-fpx.png',
  },
  {
    key: 'card',
    label: 'Credit/Debit Card',
    icon: 'assets/icon/payment-method-cddc.png',
  },
  {
    key: 'google',
    label: 'Google Pay',
    icon: 'assets/icon/payment-method-google.png',
  },
];

export const EWalletSubPaymentMethods: SubPaymentOption[] = [
  { name: 'Touch n Go', img: 'assets/images/stamp-item-gift-active.png' },
  { name: 'Boost', img: 'assets/images/stamp-item-gift-active.png' },
  { name: 'GrabPay', img: 'assets/images/stamp-item-gift-active.png' },
];

export const FpxSubPaymentMethods: SubPaymentOption[] = [
  {
    name: 'Public Bank',
    img: 'assets/images/stamp-item-gift-active.png',
  },
  { name: 'Maybank', img: 'assets/images/stamp-item-gift-active.png' },
  { name: 'CIMB Bank', img: 'assets/images/stamp-item-gift-active.png' },
];
