import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject, takeUntil, take, finalize, forkJoin, of, tap, catchError } from 'rxjs';
import { UserApiService } from 'src/app/core/repo/api/user-api.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { Member } from 'src/app/core/models/member.model';
import { Wallet } from 'src/app/core/models/wallet.model';
import { TransactionListComponent } from 'src/app/shared/components/transaction-list/transaction-list.component';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
  standalone: false,
})
export class WalletPage implements OnInit, OnDestroy {
  memberInfo!: Member;
  wallet: Wallet | null = null;
  Loaded = false;
  private destroy$ = new Subject<void>();

  @ViewChild(TransactionListComponent) txnList?: TransactionListComponent;

  constructor(
    private userApiService: UserApiService,
    private userStateService: UserStateService,
  ) {}

  ngOnInit() {
    this.userStateService.memberInfo.pipe(takeUntil(this.destroy$)).subscribe({
      next: (member) => {
        if (member) {
          this.memberInfo = member;
          this.loadWalletOnce().pipe(takeUntil(this.destroy$)).subscribe();
        }
      },
    });

    // ✅ 不要 interval(10000)
  }

  doRefresh(event: any) {
    if (!this.memberInfo?.phoneNumber) {
      event.target.complete();
      return;
    }

    forkJoin([this.loadWalletOnce(), this.txnList ? this.txnList.refresh() : of([])])
      .pipe(finalize(() => event.target.complete()))
      .subscribe();
  }

  private loadWalletOnce() {
    this.Loaded = false;

    return this.userApiService.getWalletDetails(this.memberInfo.phoneNumber).pipe(
      take(1),
      tap((res) => {
        this.wallet = res;
        this.Loaded = true;
      }),
      catchError((err) => {
        console.error('Load wallet failed', err);
        this.Loaded = true;
        return of(null);
      }),
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
