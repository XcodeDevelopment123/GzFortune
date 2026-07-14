import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, take, switchMap } from 'rxjs';
import { Voucher } from 'src/app/core/models/voucher.model';
import { RewardApiService } from 'src/app/core/repo/api/reward-api.service';
import { ModalHelperService } from 'src/app/shared/services/modal-helper.service';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';
import { Share } from '@capacitor/share';
import { AuthService } from 'src/app/core/services/auth.service';
import { AlertHelperService } from 'src/app/shared/services/alert-helper.service';
import { StateSessionService } from 'src/app/shared/services/state-session.service';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-voucher-detail',
  templateUrl: './voucher-detail.page.html',
  styleUrls: ['./voucher-detail.page.scss'],
  standalone: false,
})
export class VoucherDetailPage implements OnInit, OnDestroy {
  voucherDetail?: Voucher;
  loaded = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
    private rewardApi: RewardApiService,
    private toastHelper: ToastHelperService,
    private modalHelper: ModalHelperService,
    private alertHelper: AlertHelperService,
    private stateSession: StateSessionService,
    private userStateService: UserStateService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    // 优先从 router state 获取数据（包含图片）
    const state = window.history.state;
    if (state && state.voucherDetail) {
      this.voucherDetail = state.voucherDetail;
      this.loaded = true;
    }

    if (!id) {
      this.toastHelper.presentFailedToast('Something went wrong, Try again later');
      return;
    }

    // 如果 state 没数据，再请求接口
    if (!this.voucherDetail) {
      this.userStateService.memberInfo.pipe(
        take(1),
        switchMap((user) => {
          if (user?.phoneNumber) {
            return this.rewardApi.userGetVoucherByPhone(user.phoneNumber, user.contactId);
          } else {
            return this.rewardApi.getAllVoucher();
          }
        }),
        take(1)
      ).subscribe({
        next: (list) => {
          this.voucherDetail = list.find(v => 
            (v.id && v.id.toString() === id) || 
            v.rewardId === id || 
            v.voucherNo === id
          );
          this.loaded = true;
          console.log('voucherDetail from API fallback', this.voucherDetail);
        },
        error: (err) => {
          console.error('Failed to fallback load voucher', err);
          this.loaded = true;
        }
      });
    }
  }

  ngOnDestroy() {}

  isExpired(voucher: Voucher): boolean {
    if (!voucher) return false;
    if (voucher.status === 'Expired') return true;
    const now = new Date();
    return new Date(voucher.expireDate) <= now;
  }

  getFormattedTnc(tnc?: string): string {
    if (!tnc) return '';
    return tnc.replace(/\\n/g, '<br/>').replace(/\n/g, '<br/>');
  }

  async openQrModal() {
    const alert = await this.alertHelper.createBasicAlert(
      'Redeem',
      'Please redeem at the counter during checkout!',
    );
    await alert.present();
  }

  async share(type: string, id: string) {
    await Share.share({
      title: 'Share Referral Code',
      text: 'Join Our App now to get more reward \n',
      url: `https://juicyportal.xcode.com.my/sharelink/${type}/${id}`,
      dialogTitle: 'Share With',
    });
  }
}
