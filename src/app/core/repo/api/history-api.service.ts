import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import { OrderHistory, orderHistoryMapper } from '../../models/delivery.model';
import { dtoToModel } from 'src/app/shared/utils/dto-to-model';
import { TransactionHistory } from '../../models/transactionhistory.model';

export interface WarelyTransactionDto {
  event_id: string;
  event_type: string;
  occurred_at: string;
  member_id: number;
  contact_id: number;
  reference_id: string;
  amount: number;
  status: string;
  details: {
    payment_type?: string;
    reason?: string;
    balance_after?: number;
    void_reason?: string | null;
    invoice_no?: string;
    final_total?: number;
    campaign_name?: string;
    coupon_name?: string;
    coupon_code?: string;
    source?: string;
    adjustment_type?: string;
    balance_before?: number;
    adjustment_amount?: number;
  };
}

export interface WarelySaleDto {
  sales_transaction_id: number;
  invoice_no: string;
  transaction_date: string | null;
  location_id: number;
  amounts: {
    gross: number;
    tax: number;
    discount: number;
    service_charge: number;
    round_off: number;
    net: number;
  };
}

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

  private ctrl3: string = '/MemberWallet';

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

  // ✅ 新增：根据 Contact ID 获取交易记录 (Warely)
  getMemberTransactions(contactId: number): Observable<TransactionHistory[]> {
    const body = { ContactID: contactId };
    return this.baseApi
      .post<{ data: WarelyTransactionDto[] }>(
        `${this.ctrl3}/MemberTransactionList/transaction/list`,
        body,
      )
      .pipe(
        map((res) => {
          const list = res?.data || [];
          return list.map((d) => ({
            id: 0,
            historyId: d.event_id,
            type: d.event_type,
            phoneNumber: '', // Not available in this API but can be filled if needed
            status: d.status,
            dateTime: d.occurred_at,
            referenceNumber: d.reference_id,
            merchantId: null,
            amount: Number(d.amount ?? 0),
            stamp: 0,
            description: d.details?.reason || d.details?.campaign_name || d.event_type,
            point: d.event_type === 'points_adjustment' ? Number(d.amount ?? 0) : 0,
            rewardId: d.details?.coupon_code || null,
            previousBalance:
              d.details?.balance_after !== undefined
                ? d.details.balance_after - Number(d.amount ?? 0)
                : null,
            previousPoints: d.details?.balance_before ?? null,
          }));
        }),
        catchError(() => of([])),
      );
  }

  // ✅ 新增：根据 Contact ID 获取销售记录 (Warely)
  getMemberSales(contactId: number): Observable<TransactionHistory[]> {
    const body = { ContactID: contactId };
    return this.baseApi
      .post<{ data: WarelySaleDto[] }>(`${this.ctrl3}/MemberSalesList/sales/list`, body)
      .pipe(
      map((res) => {
        const list = res?.data || [];
        return list.map((d) => ({
          id: 0,
          historyId: `sale-${d.sales_transaction_id}`,
          type: 'Payment', // Sales are generally payments
          phoneNumber: '',
          status: 'completed',
          dateTime: d.transaction_date || '', // Handle null if necessary
          referenceNumber: d.invoice_no,
          merchantId: d.location_id.toString(),
          amount: Number(d.amounts?.net ?? 0),
          stamp: 0,
          description: `Invoice: ${d.invoice_no}`,
          point: 0,
          rewardId: null,
          previousBalance: null,
          previousPoints: null,
        }));
      }),
      catchError(() => of([])),
    );
  }

  // ✅ 新增：根据 Contact ID 获取钱包历史 (Warely)
  getMemberWalletHistory(contactId: number): Observable<TransactionHistory[]> {
    const body = {
      ContactID: contactId,
      StartDate: '2025-01-01',
      EndDate: new Date().toISOString().split('T')[0],
      PerPage: 100,
      Page: 1,
    };
    return this.baseApi
      .post<{ data: any[] }>(`${this.ctrl3}/MemberWalletHistory/wallet/history`, body)
      .pipe(
      map((res) => {
        // Currently data is empty as per user report, mapping will be added when structure is known
        const list = res?.data || [];
        return [];
      }),
      catchError(() => of([])),
    );
  }

  // ✅ 更新：一次拿完全部记录 (合并三个新接口)
  getAllRecordByPhoneNumber(
    phoneNumber: string,
    contactId?: number,
  ): Observable<TransactionHistory[]> {
    if (!contactId) {
      // Fallback to old API if contactId is not provided
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

    // Call all three new APIs and combine
    return forkJoin([
      this.getMemberTransactions(contactId),
      this.getMemberSales(contactId),
      this.getMemberWalletHistory(contactId),
    ]).pipe(
      map(([transactions, sales, walletHistory]) => {
        // Merge and de-duplicate by historyId or referenceNumber
        const combined = [...transactions, ...sales, ...walletHistory];
        const unique = new Map<string, TransactionHistory>();

        combined.forEach((item) => {
          const key = item.historyId || item.referenceNumber;
          if (!unique.has(key)) {
            unique.set(key, item);
          }
        });

        return Array.from(unique.values()).sort(
          (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
        );
      }),
    );
  }
}
