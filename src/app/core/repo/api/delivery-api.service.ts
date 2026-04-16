import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { map, Observable } from 'rxjs';
import {
  CreatePickUpRequest,
  OrderHistory,
  VoucherDelivery,
  VoucherDeliveryList,
  voucherDeliveryMapper,
} from '../../models/delivery.model';
import { dtoToModel } from 'src/app/shared/utils/dto-to-model';

@Injectable({ providedIn: 'root' })
export class DeliveryApiService {
  private baseApi = inject(BaseApiService);
  private ctrl: string = '/ManageDelivery';
  private ctrl2: string = '/ManageDeliveryVoucher';

  getAllDeliveryVoucherByPhone(phone: string): Observable<VoucherDeliveryList> {
    const body = { PhoneNumber: phone };
    return this.baseApi
      .post<VoucherDeliveryList[]>(`${this.ctrl2}/GetAllDeliveryVoucherByPhone`, body)
      .pipe(
        map((res) =>
          res.map((dto) => dtoToModel<VoucherDelivery, any>(dto, voucherDeliveryMapper)),
        ),
      );
  }

  createPickUp(body: CreatePickUpRequest): Observable<string> {
    return this.baseApi.post(`${this.ctrl}/CreatePickUp`, body, {
      responseType: 'text' as 'json',
    });
  }

  updateUserOrderStatus(ordererId: string): Observable<OrderHistory> {
    const body = { OrdererId: ordererId };
    return this.baseApi.post<OrderHistory>(`${this.ctrl}/UserUpdateStatus`, body, {
      responseType: 'text' as 'json',
    });
  }
}
