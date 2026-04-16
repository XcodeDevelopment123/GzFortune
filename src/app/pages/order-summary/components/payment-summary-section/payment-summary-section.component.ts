import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CartResponse } from 'src/app/core/models/cart.model';
import { VoucherDelivery } from 'src/app/core/models/delivery.model';

@Component({
  selector: 'app-payment-summary-section',
  templateUrl: './payment-summary-section.component.html',
  styleUrls: ['./payment-summary-section.component.scss'],
  standalone: false,
})
export class PaymentSummarySectionComponent implements OnInit {
  @Input() cartData: CartResponse | null = null;
  @Input() selectedVoucher: VoucherDelivery | null = null;
  @Input() pointDiscount: number = 0;
  @Input() redeemedPoints: number = 0;

  public baseSubTotal: number = 0;
  public voucherDiscount: number = 0;
  public voucherDisplay: string = '- RM 0.00';

  public subtotalBeforeTax: number = 0;
  public sstAmount: number = 0;
  public grandTotal: number = 0;

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.cartData) return;

    this.baseSubTotal = this.cartData.subTotal || 0;

    // 1️⃣ 解析 Voucher 折扣金额
    this.voucherDiscount = 0;
    this.voucherDisplay = '- RM 0.00';
    const discount = this.selectedVoucher?.discountAmount?.trim();

    if (discount) {
      if (discount.endsWith('%')) {
        const percent = parseFloat(discount.replace('%', '').trim());
        this.voucherDiscount = (this.baseSubTotal * percent) / 100;
        this.voucherDisplay = `- ${percent.toFixed(0)}%`;
      } else if (discount.toLowerCase().startsWith('rm')) {
        const rm = parseFloat(discount.replace(/rm/i, '').trim());
        this.voucherDiscount = rm;
        this.voucherDisplay = `- RM ${rm.toFixed(2)}`;
      }
    }

    // 2️⃣ 计算 Subtotal（不含税前）
    let subtotal = this.baseSubTotal - this.voucherDiscount - (this.pointDiscount || 0);
    if (subtotal < 0) subtotal = 0;
    this.subtotalBeforeTax = this.roundAwayFromZero(subtotal, 2);

    // 3️⃣ 计算 Tax (6%)
    const tax = this.subtotalBeforeTax * 0.06;
    this.sstAmount = this.roundAwayFromZero(tax, 2);

    // 4️⃣ Grand Total
    const total = this.subtotalBeforeTax + this.sstAmount;
    this.grandTotal = this.roundAwayFromZero(total, 2);

    // 回写 cartData 中的 grandTotal（如你需要外部读取）
    this.cartData.grandTotal = this.grandTotal;
  }

  private roundAwayFromZero(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }
}
