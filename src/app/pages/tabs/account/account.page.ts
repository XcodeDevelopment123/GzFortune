import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil, take, of } from 'rxjs';
import { finalize, catchError, tap } from 'rxjs/operators';
import { Member } from 'src/app/core/models/member.model';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { UserApiService } from 'src/app/core/repo/api/user-api.service';
import { environment } from 'src/environments/environment';
import { Device } from '@capacitor/device';


@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false,
})
export class AccountPage implements OnInit, OnDestroy {
  memberInfo!: Member;
  private destroy$ = new Subject<void>();
  Appvertion = '';

  constructor(
    private userStateService: UserStateService,
    private userApiService: UserApiService,
  ) {}

  ngOnInit() {
    // 监听最新 memberInfo
    this.userStateService.memberInfo.pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (res) this.memberInfo = res;
    });

    this.VersionCheck();

  }

  // ✅ 下拉刷新
  doRefresh(event: any) {
    if (!this.memberInfo?.phoneNumber) {
      event.target.complete();
      return;
    }

    this.loadWalletOnce()
      .pipe(finalize(() => event.target.complete()))
      .subscribe();
  }

  private loadWalletOnce() {
    // 如果你 memberInfo.phoneNumber 是 01x... 这种，就用 +6 前缀
    // 如果有时已经是 +60...，就避免重复加
    const raw = this.memberInfo.phoneNumber;
    const phone = raw.startsWith('+') ? raw : '+6' + raw;

    return this.userApiService.getWalletDetails(phone).pipe(
      take(1),
      tap((wallet) => {
        if (!wallet) return;

        // 更新 state
        this.userStateService.updateWalletInfo(wallet);

        // 更新页面 point
        this.memberInfo = { ...this.memberInfo, point: wallet.point };
      }),
      catchError((err) => {
        console.error('Wallet refresh failed', err);
        return of(null);
      }),
    );
  }

  async VersionCheck() {
    const info = await Device.getInfo();

    if (info.platform === 'ios') {
      this.Appvertion = environment.iosAppVersion;
    } else if (info.platform === 'android') {
      this.Appvertion = environment.androidAppVersion;
    } else {
      this.Appvertion = environment.androidAppVersion;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
