import { SubPaymentOption } from './payment.model';

export interface SelectedPayment {
  method: string;
  subOption?: SubPaymentOption | null;
}
