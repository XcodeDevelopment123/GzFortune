export interface TransactionHistory {
  amount: number;
  dateTime: string;
  description: string;
  historyId: string;
  id: number;
  merchantId: string | null;
  phoneNumber: string;
  point: number;
  referenceNumber: string;
  stamp: number;
  status: string;
  type: string;

  rewardId?: string | null;
  previousBalance?: number | null;
  previousPoints?: number | null;
}

export type TransactionWithSource = TransactionHistory & {
  source: 'payment' | 'topup' | 'redeem' | 'Redeem Voucher';
  displayAmount: string;
  amountClass: string;
  uid: string;

  balanceInfo?: string;
  pointsInfo?: string;
};
