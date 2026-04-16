import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { map, Observable } from 'rxjs';
import { RazorPayCreate, CreatePaymentLinkResponse } from '../../models/razorpay.model';

@Injectable({ providedIn: 'root' })
export class RazorApiService {
  private baseApi = inject(BaseApiService);
  private ctrl: string = '/RazorPay';

  createPaymentLink(payload: RazorPayCreate): Observable<CreatePaymentLinkResponse> {
    return this.baseApi.post<CreatePaymentLinkResponse>(
      `${this.ctrl}/CreatePurchasePaymentOrder`,
      payload,
    );
  }

  getPaymentLink(phonenumber: string, paymentlinkid: string): Observable<string> {
    const body = { PhoneNumber: phonenumber, PaymentLinkId: paymentlinkid };
    return this.baseApi.post<string>(`${this.ctrl}/GetPaymentLinkId`, body, {
      responseType: 'text' as 'json',
    });
  }

  createTopUpPaymentLink(
    phonenumber: string,
    amount: number,
  ): Observable<CreatePaymentLinkResponse | null> {
    const body = { PhoneNumber: phonenumber, Amount: amount };
    return this.baseApi
      .post<any>(`${this.ctrl}/CreateTopupPaymentOrder`, body, {
        responseType: 'text' as 'json',
      })
      .pipe(
        map((res) => {
          try {
            const result = JSON.parse(res);
            return result;
          } catch {
            return null;
          }
        }),
      );
  }
}
