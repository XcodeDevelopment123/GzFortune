import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { map, Observable } from 'rxjs';
import { OrderHistory, orderHistoryMapper } from '../../models/delivery.model';
import { dtoToModel } from 'src/app/shared/utils/dto-to-model';
import { TransactionHistory } from '../../models/transactionhistory.model';

interface TransactionHistoryDto {
  Id: number;
  HistoryId: string;
  Type: string;
  PhoneNumber: string;
  Status: string;
  DateTime: string;
  ReferenceNumber: string;
  MerchantId: string | null;
  Amount: number;
  Stamp: number;
  Description: string;
  Point: number;
  RewardID?: string | null;
  PreviousBalance?: number | null;
  PreviousPoints?: number | null;
}

@Injectable({ providedIn: 'root' })
export class HistoryApiService {
  private baseApi = inject(BaseApiService);

  private ctrl: string = '/ManageDelivery';

  private ctrl2: string = '/History';

  getHistoryListByPhone(phone: string): Observable<OrderHistory[]> {
    const body = {
      phoneNumber: phone,
      isLatest: false,
    };
    return this.baseApi
      .post<OrderHistory[]>(`${this.ctrl}/OrderHistoriesListByPhoneNumber`, body)
      .pipe(
        map((dtoList) =>
          dtoList.map((dto) => dtoToModel<OrderHistory, any>(dto, orderHistoryMapper)),
        ),
      );
  }

  getOrderHistoryByOrderId(body: {
    OrderId: string;
    PhoneNumber: string;
  }): Observable<OrderHistory> {
    return this.baseApi
      .post<OrderHistory>(`${this.ctrl}/OrderHistoriesListById`, body)
      .pipe(map((dto) => dtoToModel<OrderHistory, any>(dto, orderHistoryMapper)));
  }

  getPaymentHistoryByPhone(phoneNumber: string): Observable<TransactionHistory[]> {
    const body = { phoneNumber: phoneNumber };
    return this.baseApi
      .post<TransactionHistory[]>(`${this.ctrl2}/GetPaymentRecordByPhoneNumber`, body)
      .pipe(
        map((dto) => {
          const rawArray = Array.isArray(dto) ? dto : Object.values(dto);
          return rawArray.map((item) => dtoToModel<TransactionHistory, any>(item));
        }),
      );
  }

  getStampHistoryByPhone(phoneNumber: string): Observable<TransactionHistory[]> {
    const body = { phoneNumber: phoneNumber };
    return this.baseApi
      .post<TransactionHistory[]>(`${this.ctrl2}/GetStampRecordByPhoneNumber`, body)
      .pipe(
        map((dto) => {
          const rawArray = Array.isArray(dto) ? dto : Object.values(dto);
          return rawArray.map((item) => dtoToModel<TransactionHistory, any>(item));
        }),
      );
  }

  getTopUpHistoryByPhone(phoneNumber: string): Observable<TransactionHistory[]> {
    const body = { phoneNumber };
    return this.baseApi
      .post<TransactionHistory[]>(`${this.ctrl2}/GetTopUpRecordByPhoneNumber`, body)
      .pipe(
        map((dto) => {
          const rawArray = Array.isArray(dto) ? dto : Object.values(dto);
          return rawArray.map((item) => dtoToModel<TransactionHistory, any>(item));
        }),
      );
  }

  getRedeemHistoryByPhone(phoneNumber: string): Observable<TransactionHistory[]> {
    const body = { phoneNumber };
    return this.baseApi
      .post<TransactionHistory[]>(`${this.ctrl2}/GetRedeemVoucherRecordByPhoneNumber`, body)
      .pipe(
        map((dto) => {
          const rawArray = Array.isArray(dto) ? dto : Object.values(dto);
          return rawArray.map((item) => dtoToModel<TransactionHistory, any>(item));
        }),
      );
  }

  // ✅ 新增：一次拿完全部记录
  getAllRecordByPhoneNumber(phoneNumber: string): Observable<TransactionHistory[]> {
    const body = { phoneNumber };

    return this.baseApi
      .post<TransactionHistoryDto[] | any>(`${this.ctrl2}/GetAllRecordByPhoneNumber`, body)
      .pipe(
        map((dto) => {
          const rawArray = Array.isArray(dto) ? dto : Object.values(dto);
          return rawArray as TransactionHistoryDto[];
        }),
        map((list) =>
          list.map((d) => ({
            id: d.Id,
            historyId: d.HistoryId,
            type: d.Type,
            phoneNumber: d.PhoneNumber,
            status: d.Status,
            dateTime: d.DateTime,
            referenceNumber: d.ReferenceNumber,
            merchantId: d.MerchantId ?? null,
            amount: Number(d.Amount ?? 0),
            stamp: Number(d.Stamp ?? 0),
            description: d.Description,
            point: Number(d.Point ?? 0),
            rewardId: d.RewardID ?? null,
            previousBalance: d.PreviousBalance ?? null,
            previousPoints: d.PreviousPoints ?? null,
          })),
        ),
      );
  }
}
