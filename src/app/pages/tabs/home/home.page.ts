import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil, forkJoin, of, take, tap, catchError, finalize, switchMap,filter } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { Member } from 'src/app/core/models/member.model';
import { Highlight } from 'src/app/core/models/highlight.model';
import { Reward } from 'src/app/core/models/reward.model';
import { Voucher } from 'src/app/core/models/voucher.model';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { HighlightApiService } from 'src/app/core/repo/api/highlight-api.service';
import { RewardApiService } from 'src/app/core/repo/api/reward-api.service';
import { UserApiService } from 'src/app/core/repo/api/user-api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  memberInfo!: Member;
  highlightList: Highlight[] = [];
  rewardList: Reward[] = [];
  voucherList: Voucher[] = [];
  private destroy$ = new Subject<void>();

  public memberInforLoaded: boolean = false;
  public reweradLoaded: boolean = false;
  public highlightLoaded: boolean = false;

  private hasTriggeredNotification = false;

  constructor(
    private userStateService: UserStateService,
    private highlightApi: HighlightApiService,
    private rewardApi: RewardApiService,
    private userApiService: UserApiService,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    this.userStateService.memberInfo.pipe(takeUntil(this.destroy$)).subscribe((m) => {
      if (m) this.memberInfo = m;
      this.memberInforLoaded = true;
    });

    // ✅ 再做你下面那段 “拿到 phoneNumber 才打 wallet” 的逻辑
    this.userStateService.memberInfo
      .pipe(
        filter((m): m is Member => !!m?.phoneNumber),
        take(1),
        tap((m) => (this.memberInfo = m)), // ✅ 关键：保证 this.memberInfo 有值
        tap(() => this.userStateService.setWalletLoading(true)),
        switchMap((m) =>
          this.userApiService.getWalletDetails('+6' + m.phoneNumber).pipe(
            take(1),
            catchError((err) => {
              console.error(err);
              return of(null);
            }),
            finalize(() => this.userStateService.setWalletLoading(false)),
          ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((res) => {
        if (res) this.handleWalletResponse(res);
      });

    this.loadRewardsOnce();
    this.loadHighlightsOnce();
  }

  ionViewWillEnter() {
    this.userStateService.memberInfo
      .pipe(
        filter((m): m is Member => !!m?.phoneNumber),
        take(1),
        switchMap((m) => this.userApiService.getWalletDetails('+6' + m.phoneNumber).pipe(take(1))),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (res: any) => this.handleWalletResponse(res),
        error: (err) => console.error('Wallet refresh on enter failed', err),
      });
  }

  doRefresh(event: any) {
    this.reweradLoaded = false;
    this.highlightLoaded = false;

    // ✅ 让 Header 先进入 skeleton
    this.userStateService.setWalletLoading(true);

    this.reloadAll()
      .pipe(
        finalize(() => {
          // ✅ 不管成功失败都结束 skeleton
          this.userStateService.setWalletLoading(false);
          event.target.complete();
        }),
      )
      .subscribe();
  }

  private reloadAll() {
    return forkJoin({
      wallet: this.loadWalletOnce(),
      rewards: this.loadRewardsOnce(true),
      highlights: this.loadHighlightsOnce(true),
    });
  }

  private loadWalletOnce() {
    if (!this.memberInfo?.phoneNumber) return of(null);

    const phonenumber = '+6' + this.memberInfo.phoneNumber;
    return this.userApiService.getWalletDetails(phonenumber).pipe(
      take(1),
      tap((res: any) => this.handleWalletResponse(res)),
      catchError((err) => {
        console.error('Wallet reload failed', err);
        return of(null);
      }),
    );
  }

  private loadRewardsOnce(fromRefresh: boolean = false) {
    if (!fromRefresh) this.reweradLoaded = false;

    const obs$ = this.rewardApi.userGetReward().pipe(
      take(1),
      tap((res) => {
        this.rewardList = res;
        this.reweradLoaded = true;
      }),
      catchError((err) => {
        console.error('Reward load failed', err);
        this.reweradLoaded = true;
        return of([] as Reward[]);
      }),
    );

    if (!fromRefresh) obs$.pipe(takeUntil(this.destroy$)).subscribe();
    return obs$;
  }

  private loadHighlightsOnce(fromRefresh: boolean = false) {
    if (!fromRefresh) this.highlightLoaded = false;

    const obs$ = this.highlightApi.userGetHighlight().pipe(
      take(1),
      tap((res) => {
        this.highlightList = res;
        this.highlightLoaded = true;
      }),
      catchError((err) => {
        console.error('Highlight load failed', err);
        this.highlightLoaded = true;
        return of([] as Highlight[]);
      }),
    );

    if (!fromRefresh) obs$.pipe(takeUntil(this.destroy$)).subscribe();
    return obs$;
  }

  private handleWalletResponse(res: any) {
    if (!res) return;

    console.log('Wallet details updated:', res);
    this.userStateService.updateWalletInfo(res);

    if (this.memberInfo) {
      this.memberInfo.point = res.point;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
