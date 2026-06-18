import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Subject,
  map,
  take,
  firstValueFrom,
  takeUntil,
  of,
  tap,
  catchError,
  Observable,
} from 'rxjs';

import { HistoryApiService } from 'src/app/core/repo/api/history-api.service';
import { TransactionWithSource } from 'src/app/core/models/transactionhistory.model';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';
import { DateHelperService } from 'src/app/shared/services/date-helper.service';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
  standalone: false,
})
export class TransactionListComponent implements OnInit, OnDestroy {
  phoneNumber: string = '';
  contactId?: number;
  transactionHistory: TransactionWithSource[] = [];
  visibleTransactions: TransactionWithSource[] = [];

  private destroy$ = new Subject<void>();

  pageSize = 10;
  currentIndex = 0;
  ApiLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private historyApiService: HistoryApiService,
    private router: Router,
    private toastHelper: ToastHelperService,
    private dateHelper: DateHelperService,
    private userStateService: UserStateService,
  ) {}

  async ngOnInit() {
    const member = await firstValueFrom(this.userStateService.memberInfo);
    this.phoneNumber = member?.phoneNumber || '';
    this.contactId = member?.contactId;

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.phoneNumber) {
        this.refresh().pipe(takeUntil(this.destroy$)).subscribe();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public refresh(): Observable<TransactionWithSource[]> {
    if (!this.phoneNumber) return of([]);

    this.ApiLoaded = false;
    this.transactionHistory = [];
    this.visibleTransactions = [];
    this.currentIndex = 0;

    return this.loadCombinedHistory$().pipe(
      tap((list) => {
        this.transactionHistory = list;
        this.visibleTransactions = [];
        this.currentIndex = 0;

        // ✅ 加载第一批数据
        this.loadMoreTransactions();

        this.ApiLoaded = true;
      }),
      catchError((err) => {
        console.error('Load combined history failed', err);
        this.ApiLoaded = true;
        return of([]);
      }),
    );
  }

  private loadCombinedHistory$(): Observable<TransactionWithSource[]> {
    return this.historyApiService.getAllRecordByPhoneNumber(this.phoneNumber, this.contactId).pipe(
      take(1),
      map((res) =>
        (res || [])
          .map((item) => {
            const t = item.type;
            let source: TransactionWithSource['source'];
            switch (t) {
              case 'Payment':
              case 'sale_spend':
                source = 'payment';
                break;
              case 'Top Up':
              case 'wallet_topup':
                source = 'topup';
                break;
              case 'Redeem Voucher':
              case 'coupon_issued':
                source = 'Redeem Voucher';
                break;
              case 'points_adjustment':
                source = 'redeem';
                break;
              default:
                source = 'redeem';
                break;
            }

            const rawAmount = Number(item.amount ?? 0);
            let displayAmount = `${rawAmount < 0 ? '-' : '+'} RM${Math.abs(rawAmount).toFixed(2)}`;
            let amountClass = source === 'payment' ? 'text-danger' : 'text-success';

            if (t === 'Redeem Reward' || t === 'points_adjustment') {
              displayAmount = `${Number(item.point ?? 0) < 0 ? '-' : '+'} ${Math.abs(Number(item.point ?? 0))} Points`;
              amountClass = Number(item.point ?? 0) < 0 ? 'text-danger' : 'text-success';
            }

            if (t === 'Redeem Voucher' || t === 'coupon_issued') {
              displayAmount = 'Voucher Redeemed';
              amountClass = 'text-success';
            }

            const prevBal = item.previousBalance ?? null;
            const prevPts = item.previousPoints ?? null;

            let balanceInfo: string | undefined;
            let pointsInfo: string | undefined;

            if (prevBal !== null && (source === 'topup' || source === 'payment')) {
              balanceInfo = `Balance Before: RM${prevBal.toFixed(2)}`;
            }

            if (prevPts !== null) {
              pointsInfo = `Points Before: ${prevPts}`;
            }

            return {
              ...item,
              source,
              displayAmount,
              amountClass,
              uid: `${t}-${item.id ?? item.historyId ?? item.referenceNumber ?? item.dateTime}`,
              balanceInfo,
              pointsInfo,
            };
          })
          .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()),
      ),
      catchError(() => of([] as TransactionWithSource[])),
    );
  }

  goToDetails(history: TransactionWithSource) {
    this.router.navigate(['/history-details/transaction', history.historyId], {
      state: { history },
    });
  }

  getLocaleDate(date: string): string {
    return this.dateHelper.formatLocale(date);
  }

  // ✅ 极简版同步加载逻辑，去掉了所有 Event 参数和状态拦截
  loadMoreTransactions() {
    const source = this.transactionHistory ?? [];
    if (!source.length || this.visibleTransactions.length >= source.length) {
      return;
    }

    const next = source.slice(this.currentIndex, this.currentIndex + this.pageSize);
    this.visibleTransactions = this.visibleTransactions.concat(next);
    this.currentIndex += this.pageSize;
  }

  trackByTxn(_: number, t: TransactionWithSource) {
    return (t as any).uid ?? t.id;
  }
}
