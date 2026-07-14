import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TransactionWithSource } from 'src/app/core/models/transactionhistory.model';
import { DateHelperService } from 'src/app/shared/services/date-helper.service';

@Component({
  selector: 'app-transaction-history-details',
  templateUrl: './transaction-history-details.component.html',
  styleUrls: ['./transaction-history-details.component.scss'],
  standalone: false,
})
export class TransactionHistoryDetailsComponent implements OnInit {
  history?: TransactionWithSource;
  incOrDec: string = 'inc';

  constructor(
    private router: Router,
    private dateHelper: DateHelperService,
  ) {}

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    this.history = nav?.extras?.state?.['history'];

    if (!this.history) {
      console.warn('⚠️ 没有传入交易数据');
      this.router.navigate(['/transaction-list']);
      return;
    }

    // ✅ 控制顶部 amount 的颜色（你原本用 increase class）
    const isPayment = this.history.type === 'Payment' || this.history.type === 'sale_spend';
    const isRedeem = this.history.type === 'Redeem Reward' || this.history.type === 'reward_redeem';
    const isPointsAdj = this.history.type === 'points_adjustment';
    const isNegativePoints = isPointsAdj && (this.history.amount ?? 0) < 0;

    this.incOrDec = (isPayment || isRedeem || isNegativePoints) ? 'dec' : 'inc';
  }

  getLocaleDate(date: string): string {
    return this.dateHelper.formatLocale(date);
  }

  // ✅ 只有 Payment / Top Up / Redeem Reward 才需要显示 points（而且 point > 0）
  get showPoints(): boolean {
    const h = this.history;
    if (!h) return false;
    if ((h.point ?? 0) <= 0) return false;

    return (
      h.type === 'Payment' ||
      h.type === 'sale_spend' ||
      h.type === 'Top Up' ||
      h.type === 'wallet_topup' ||
      h.type === 'Redeem Reward' ||
      h.type === 'reward_redeem' ||
      h.type === 'points_adjustment' ||
      h.type === 'points_earned'
    );
  }

  get pointsTitle(): string {
    const t = this.history?.type;
    const isRedeem =
      t === 'Redeem Reward' ||
      t === 'reward_redeem' ||
      (t === 'points_adjustment' && (this.history?.amount ?? 0) < 0);
    return isRedeem ? 'Points Used' : 'Points Earned';
  }

  get pointsText(): string {
    const h = this.history;
    if (!h) return '';
    const t = h.type;
    const isRedeem =
      t === 'Redeem Reward' ||
      t === 'reward_redeem' ||
      (t === 'points_adjustment' && (h.amount ?? 0) < 0);
    const sign = isRedeem ? '-' : '+';
    return `${sign} ${h.point} Points`;
  }

  get showBalanceInfo(): boolean {
    const h = this.history;
    if (!h) return false;
    // 优先用列表算好的
    if (h.balanceInfo) return true;
    // fallback：有 previousBalance 且是 Payment/Top Up
    return (
      h.previousBalance !== null &&
      h.previousBalance !== undefined &&
      (h.type === 'Payment' ||
        h.type === 'sale_spend' ||
        h.type === 'Top Up' ||
        h.type === 'wallet_topup')
    );
  }

  get balanceInfoText(): string {
    const h = this.history;
    if (!h) return '';
    if (h.balanceInfo) return h.balanceInfo;

    const prev = Number(h.previousBalance ?? 0);
    return `Balance Before: RM${prev.toFixed(2)}`;
  }

  get showPointsInfo(): boolean {
    const h = this.history;
    if (!h) return false;
    if (h.pointsInfo) return true;

    const prevPts = h.previousPoints;
    if (prevPts === null || prevPts === undefined) return false;

    return (
      h.type === 'Redeem Reward' ||
      h.type === 'reward_redeem' ||
      h.type === 'points_adjustment' ||
      h.type === 'points_earned' ||
      h.type === 'Payment' ||
      h.type === 'sale_spend' ||
      h.type === 'Top Up' ||
      h.type === 'wallet_topup'
    );
  }

  get pointsInfoText(): string {
    const h = this.history;
    if (!h) return '';
    if (h.pointsInfo) return h.pointsInfo;

    const prev = Number(h.previousPoints ?? 0);
    return `Points Before: ${prev}`;
  }
}
