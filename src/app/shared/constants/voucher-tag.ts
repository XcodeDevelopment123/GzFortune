import { VoucherType } from 'src/app/core/models/voucher.model';

export const typeToClassMap: Record<VoucherType, string> = {
  Discount: 'discount',
  'Free Shipping': 'free-shipping',
  'Free Drink': 'free-drink',
  'Buy 1 Free 1': 'buy1free1',
  'New User Only': 'new-user',
  'Birthday Promo': 'birthday',
};
