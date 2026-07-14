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
    metadata?: {
      source?: string;
      reward_id?: number;
      reward_name?: string;
      discount_type?: string;
      discount_value?: number;
      pos_transaction_id?: number;
      pos_transaction_ref?: string;
    };
    food_list?: any[];
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
  reward_points?: {
    earned?: number;
    redeemed?: number;
    redeemed_amount?: number;
  };
  items?: any[];
  payments?: any[];
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
            status:
              d.status === 'final' || d.status === 'completed'
                ? 'Success'
                : d.status === 'voided'
                ? 'Cancelled'
                : d.status === 'issued'
                ? 'Issued'
                : d.status,
            dateTime: d.occurred_at,
            referenceNumber: d.reference_id,
            merchantId: null,
            amount: d.event_type === 'sale_spend' ? -Number(d.amount ?? 0) : Number(d.amount ?? 0),
            stamp: 0,
            description: d.details?.metadata?.reward_name
              ? `Redeemed Reward: ${d.details.metadata.reward_name}`
              : d.details?.invoice_no
              ? `Invoice: ${d.details.invoice_no}`
              : d.details?.reason || d.details?.campaign_name || getFriendlyEventType(d.event_type),
            point:
              d.event_type === 'points_adjustment' ||
              d.event_type === 'reward_redeem' ||
              d.event_type === 'points_earned'
                ? Math.abs(Number(d.amount ?? 0))
                : 0,
            rewardId: d.details?.coupon_code || null,
            previousBalance:
              d.details?.balance_after !== undefined
                ? d.details.balance_after - Number(d.amount ?? 0)
                : null,
            previousPoints: d.details?.balance_before ?? null,
            details: d.details,
            items: d.details?.food_list
              ? d.details.food_list.map((item: any) => ({
                  sell_line_id: item.sell_line_id,
                  product_id: item.product_id,
                  variation_id: item.variation_id,
                  product_name: item.product_name,
                  quantity: item.quantity,
                  unit_price_inc_tax: item.unit_price_inc_tax,
                  line_total: item.line_total,
                  remarks: item.remarks,
                }))
              : undefined,
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
            merchantId: d.location_id?.toString() || null,
            amount: -Number(d.amounts?.net ?? 0),
            stamp: 0,
            description: `Invoice: ${d.invoice_no}`,
            point: Number(d.reward_points?.earned ?? 0),
            rewardId: null,
            previousBalance: null,
            previousPoints: null,
            items: d.items || [],
            amounts: d.amounts,
            payments: d.payments,
            sales_transaction_id: d.sales_transaction_id,
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
          const list = res?.data || [];
          return list.map((d) => {
            const amount = Number(d.amount ?? 0);
            const balanceAfter = Number(d.balance_after ?? 0);
            const isCredit = d.transaction_type === 'credit';
            const previousBalance = isCredit ? balanceAfter - amount : balanceAfter + amount;

            return {
              id: d.wallet_transaction_id || 0,
              historyId: `wallet-${d.wallet_transaction_id}`,
              type: isCredit ? 'Top Up' : 'Payment',
              phoneNumber: '',
              status: d.is_void ? 'Cancelled' : 'Success',
              dateTime: d.created_at || '',
              referenceNumber: d.reference_id || d.wallet_transaction_id?.toString() || '',
              merchantId: null,
              amount: isCredit ? amount : -amount,
              stamp: 0,
              description: d.reason || (isCredit ? 'Wallet Topup' : 'Wallet Payment'),
              point: 0,
              rewardId: null,
              previousBalance: previousBalance,
              previousPoints: null,
            };
          });
        }),
        catchError(() => of([])),
      );
  }

  // ✅ 更新：一次拿完全部记录 (仅获取交易记录 API，避免重复)
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

    return this.getMemberTransactions(contactId);
  }
}

function getFriendlyEventType(type: string): string {
  switch (type) {
    case 'sale_spend':
      return 'Credit Spent';
    case 'points_earned':
      return 'Points Earned';
    case 'wallet_topup':
      return 'Wallet Topup';
    case 'reward_redeem':
      return 'Reward Redemption';
    case 'coupon_issued':
      return 'Voucher Issued';
    case 'points_adjustment':
      return 'Points Adjustment';
    default:
      return type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
}
