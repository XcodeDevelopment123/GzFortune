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
    this.incOrDec =
      this.history.type === 'Payment' || this.history.type === 'Redeem Reward' ? 'dec' : 'inc';
  }

  getLocaleDate(date: string): string {
    return this.dateHelper.formatLocale(date);
  }

  // ✅ 只有 Payment / Top Up / Redeem Reward 才需要显示 points（而且 point > 0）
  get showPoints(): boolean {
    const h = this.history;
    if (!h) return false;
    if ((h.point ?? 0) <= 0) return false;

    return h.type === 'Payment' || h.type === 'Top Up' || h.type === 'Redeem Reward';
  }

  get pointsTitle(): string {
    return this.history?.type === 'Redeem Reward' ? 'Points Used' : 'Points Earned';
  }

  get pointsText(): string {
    const h = this.history;
    if (!h) return '';
    const sign = h.type === 'Redeem Reward' ? '-' : '+';
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
      (h.type === 'Payment' || h.type === 'Top Up')
    );
  }

  get balanceInfoText(): string {
    const h = this.history;
    if (!h) return '';
    if (h.balanceInfo) return h.balanceInfo;

    const prev = Number(h.previousBalance ?? 0);
    const amt = Number(h.amount ?? 0);

    return `Balance Before: RM${prev.toFixed(2)}`;
  }

  get showPointsInfo(): boolean {
    const h = this.history;
    if (!h) return false;
    if (h.pointsInfo) return true;

    const prevPts = h.previousPoints;
    if (prevPts === null || prevPts === undefined) return false;

    // Redeem Reward / Payment / Top Up 才会改变 points（按你目前逻辑）
    return h.type === 'Redeem Reward' || h.type === 'Payment' || h.type === 'Top Up';
  }

  get pointsInfoText(): string {
    const h = this.history;
    if (!h) return '';
    if (h.pointsInfo) return h.pointsInfo;

    const prev = Number(h.previousPoints ?? 0);
    const delta = Number(h.point ?? 0);

    let after = prev;
    if (h.type === 'Redeem Reward') after = prev - delta;
    else if (h.type === 'Payment' || h.type === 'Top Up') after = prev + delta;

    return `Points Before: ${prev}`;
  }
}
