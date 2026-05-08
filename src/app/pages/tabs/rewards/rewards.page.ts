import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Subject,
  of,
  switchMap,
  startWith,
  distinctUntilChanged,
  takeUntil,
  catchError,
  tap,
  map,
  take,
  forkJoin,
} from 'rxjs';
import { finalize } from 'rxjs/operators';

import { Voucher } from 'src/app/core/models/voucher.model';
import { Reward } from 'src/app/core/models/reward.model';
import { Stamp } from 'src/app/core/models/stamp.model';
import { RewardPageTabs } from 'src/app/shared/statics/interface-helper';

import { RewardApiService } from 'src/app/core/repo/api/reward-api.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { StampApiService } from 'src/app/core/repo/api/stamp-api.service';
import { UserApiService } from 'src/app/core/repo/api/user-api.service';
import { Member } from 'src/app/core/models/member.model';

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.page.html',
  styleUrls: ['./rewards.page.scss'],
  standalone: false,
})
export class RewardsPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  selectedTab: RewardPageTabs = 'voucher';

  voucherList: Voucher[] = [];
  stampList: Stamp[] = [];
  pointRewardList: Reward[] = [];

  memberInfo!: Member;
  userPoint = 0;
  userTier = '';
  userTotalStamp = 0;
  userPhoneNumber = '';
  Loaded = false;

  constructor(
    private rewardApi: RewardApiService,
    private userState: UserStateService,
    private stampApi: StampApiService,
    private route: ActivatedRoute,
    private userApiService: UserApiService,
  ) {}

  ngOnInit() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const tab = params['tab'];
      if (tab === 'voucher' || tab === 'point' || tab === 'stamp') {
        this.selectedTab = tab;
      }
    });

    const user$ = this.userState.memberInfo.pipe(
      startWith(null as any),
      distinctUntilChanged(
        (a: any, b: any) =>
          (a?.phoneNumber || '') === (b?.phoneNumber || '') &&
          (a?.point || 0) === (b?.point || 0) &&
          (a?.tier || '') === (b?.tier || '') &&
          (a?.totalStamp || 0) === (b?.totalStamp || 0),
      ),
      takeUntil(this.destroy$),
    );

    user$
      .pipe(
        tap((user) => {
          this.memberInfo = user;
          this.userPhoneNumber = user?.phoneNumber || '';
          this.userPoint = user?.point || 0;
          this.userTier = user?.tier || '';
          this.userTotalStamp = user?.totalStamp || 0;
        }),
      )
      .subscribe();

    user$
      .pipe(
        switchMap((user) =>
          (user?.phoneNumber
            ? this.rewardApi.userGetVoucherByPhone(user.phoneNumber, user.contactId)
            : this.rewardApi.getAllVoucher()
          ).pipe(
            catchError((err) => {
              console.error('voucher error', err);
              return of<Voucher[]>([]);
            }),
          ),
        ),
        tap((list) => {
          console.log(list);
          this.voucherList = list;
          this.Loaded = true;
        }),
      )
      .subscribe();

    // rewards list（初次读一次）
    this.refreshPointRewardsOnce().pipe(takeUntil(this.destroy$)).subscribe();

    // ✅ 已移除：interval(10000) 每 10 秒刷新 point
  }

  changeTab(tab: RewardPageTabs) {
    this.selectedTab = tab;
  }

  // ✅ 下拉刷新：wallet point + voucher + rewards
  doRefresh(event: any) {
    this.Loaded = false;

    forkJoin([
      this.refreshWalletPointOnce(),
      this.refreshVoucherOnce(),
      this.refreshPointRewardsOnce(),
    ])
      .pipe(finalize(() => event.target.complete()))
      .subscribe();
  }

  onRewardRedeemed() {
    // 兑换后你原本只刷新 voucher，这里顺便也刷新 point（更稳）
    forkJoin([this.refreshWalletPointOnce(), this.refreshVoucherOnce()])
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  private refreshWalletPointOnce() {
    if (!this.memberInfo?.phoneNumber) return of(null);

    const raw = this.memberInfo.phoneNumber;
    const phone = raw.startsWith('+') ? raw : '+6' + raw;

    return this.userApiService.getWalletDetails(phone).pipe(
      take(1),
      tap((wallet) => {
        if (!wallet) return;

        // 更新 state（让别页也同步）
        this.userState.updateWalletInfo(wallet);

        // 更新当前页显示（即时）
        this.userPoint = wallet.point;
      }),
      catchError((err) => {
        console.error('wallet refresh error', err);
        return of(null);
      }),
    );
  }

  private refreshVoucherOnce() {
    const phone = this.userPhoneNumber;

    const req$ = phone
      ? this.rewardApi.userGetVoucherByPhone(phone, this.memberInfo?.contactId)
      : this.rewardApi.getAllVoucher();

    return req$.pipe(
      take(1),
      tap((list) => {
        console.log(list);
        this.voucherList = list;
        this.Loaded = true;
      }),
      catchError((err) => {
        console.error('voucher refresh error', err);
        this.voucherList = [];
        this.Loaded = true;
        return of([] as Voucher[]);
      }),
    );
  }

  private refreshPointRewardsOnce() {
    return this.rewardApi.userGetReward().pipe(
      take(1),
      map((list) => (list || []).filter((r) => r.point && r.point > 0)),
      tap((list) => (this.pointRewardList = list)),
      catchError((err) => {
        console.error('reward list error', err);
        this.pointRewardList = [];
        return of([] as Reward[]);
      }),
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
