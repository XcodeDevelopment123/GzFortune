import { Type } from '@angular/core';

export interface SubPaymentOption {
  name: string;
  img: string;
  value?: string; // 可选：用于实际 API 提交时的 code
}

export interface PaymentMethod {
  key: PaymentMethodType;
  label: string; // UI 显示的名称
  icon?: string; // 主 icon，可用于主列表展示
  requiresSubSelection?: boolean; // 是否需要额外选择（如银行/wallet）
  subOptions?: SubPaymentOption[]; // 可选：预定义子选项
}

export interface SelectedPaymentResult {
  method: string;
  subOption?: SubPaymentOption | null;
}

export type PaymentMethodType = 'fpx' | 'e-wallet' | 'curlec' | 'app-wallet' | 'card' | 'google';
