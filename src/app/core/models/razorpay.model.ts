import { MapperMap } from 'src/app/shared/utils/dto-to-model';

export interface RazorPayCreate {
  type: string;
  phoneNumber: string;
  deliveryVouchersId: string;
  pointDiscount: number;
}

export interface CreatePaymentLinkResponse {
  paymentId: string;
  paymentUrl: string;
  orderId: string;
  curlecOrderId: string;
}
