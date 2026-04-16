import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Subject,
  forkJoin,
  map,
  take,
  firstValueFrom,
  takeUntil,
  of,
  tap,
  catchError,
  Observable,
} from 'rxjs';
import { IonInfiniteScroll } from '@ionic/angular';

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
  transactionHistory: TransactionWithSource[] = [];
  visibleTransactions: TransactionWithSource[] = [];

  private destroy$ = new Subject<void>();

  pageSize = 10;
  currentIndex = 0;
  isLoading = false;
  ApiLoaded = false;

  @ViewChild(IonInfiniteScroll) infiniteScroll?: IonInfiniteScroll;

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

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.phoneNumber) {
        this.refresh().pipe(takeUntil(this.destroy$)).subscribe();
      }
    });

    // ✅ 已移除：每 10 秒自动刷新 interval
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ 给 WalletPage 调用：手动刷新交易记录
  public refresh(): Observable<TransactionWithSource[]> {
    if (!this.phoneNumber) return of([]);

    this.ApiLoaded = false;
    this.isLoading = false;
    this.transactionHistory = [];
    this.visibleTransactions = [];
    this.currentIndex = 0;

    // 重要：refresh 后要把 infinite scroll 重新打开
    if (this.infiniteScroll) this.infiniteScroll.disabled = false;

    return this.loadCombinedHistory$().pipe(
      tap((list) => {
        this.transactionHistory = list;

        this.visibleTransactions = [];
        this.currentIndex = 0;

        // ✅ 先加载第一批（10条）
        this.loadMoreTransactions();

        // ✅ 如果总数 <= 10，就直接关掉 infinite scroll
        if (this.infiniteScroll) {
          this.infiniteScroll.disabled = this.transactionHistory.length <= this.pageSize;
        }

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
    return this.historyApiService.getAllRecordByPhoneNumber(this.phoneNumber).pipe(
      take(1),
      map((res) =>
        (res || [])
          .map((item) => {
            const t = item.type;

            let source: TransactionWithSource['source'];
            switch (t) {
              case 'Payment':
                source = 'payment';
                break;
              case 'Top Up':
                source = 'topup';
                break;
              case 'Redeem Voucher':
                source = 'Redeem Voucher'; // 如果你 type union 里面真的有这个值
                break;
              default:
                source = 'redeem';
                break;
            }

            // 默认（Payment/TopUp）显示 RM
            let displayAmount = `${source === 'payment' ? '-' : '+'} RM${Number(item.amount ?? 0).toFixed(2)}`;
            let amountClass = source === 'payment' ? 'text-danger' : 'text-success';

            if (t === 'Redeem Reward') {
              displayAmount = `- ${Number(item.point ?? 0)} Points`;
              amountClass = 'text-danger';
            }

            if (t === 'Redeem Voucher') {
              displayAmount = 'Voucher Redeemed';
              amountClass = 'text-success';
            }
            
            const prevBal = item.previousBalance ?? null;
            const prevPts = item.previousPoints ?? null;

            let balanceInfo: string | undefined;
            let pointsInfo: string | undefined;

            // ✅ Balance before/after（只在 Payment / Top Up 且 previousBalance 有值时显示）
            if (prevBal !== null && (t === 'Top Up' || t === 'Payment')) {
              const amt = Number(item.amount ?? 0);
              balanceInfo = `Balance Before: RM${prevBal.toFixed(2)}`;
            }

            // ✅ Points before/after（只在 previousPoints 有值时显示）
            if (prevPts !== null) {
              const deltaPts = Number(item.point ?? 0);
              let afterPts = prevPts;

              if (t === 'Redeem Reward') {
                afterPts = prevPts - deltaPts;
              } else if (t === 'Payment' || t === 'Top Up') {
                afterPts = prevPts + deltaPts;
              }

              // ✅ 只有有变化才显示
              if (afterPts !== prevPts) {
                pointsInfo = `Points Before: ${prevPts}`;
              }
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

  loadMoreTransactions(event?: import('@ionic/angular').InfiniteScrollCustomEvent) {
    if (this.isLoading) {
      event?.target.complete();
      return;
    }

    const source = this.transactionHistory ?? [];
    if (!source.length) {
      if (event) {
        event.target.complete();
        event.target.disabled = true;
      }
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      const next = source.slice(this.currentIndex, this.currentIndex + this.pageSize);
      this.visibleTransactions = this.visibleTransactions.concat(next);
      this.currentIndex += this.pageSize;

      event?.target.complete();
      if (event && this.visibleTransactions.length >= source.length) {
        event.target.disabled = true;
      }
      this.isLoading = false;
      this.ApiLoaded = true;
    }, 400);
  }

  trackByTxn(_: number, t: TransactionWithSource) {
    return (t as any).uid ?? t.id;
  }
}
