import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, take, delay } from 'rxjs';
import { Reward } from 'src/app/core/models/reward.model';
import { RewardApiService } from 'src/app/core/repo/api/reward-api.service';
import { ModalHelperService } from 'src/app/shared/services/modal-helper.service';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';
import { Share } from '@capacitor/share';
import { AuthService } from 'src/app/core/services/auth.service';
import { AlertHelperService } from 'src/app/shared/services/alert-helper.service';
import { StateSessionService } from 'src/app/shared/services/state-session.service';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { UserApiService } from 'src/app/core/repo/api/user-api.service';
import { UserStateService } from 'src/app/core/services/user-state.service';


@Component({
  selector: 'app-reward',
  templateUrl: './reward.page.html',
  styleUrls: ['./reward.page.scss'],
  standalone: false,
})
export class RewardPage implements OnInit, OnDestroy {
  rewardDetail?: Reward;
  phoneNumber: string = '';
  point: number = 0;

  loaded = false;

  constructor(
    private navController: NavController,
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
    private rewardApi: RewardApiService,
    private toastHelper: ToastHelperService,
    private modalHelper: ModalHelperService,
    private alertHelper: AlertHelperService,
    private stateSession: StateSessionService,
    private alertCtrl: AlertController,
    private userApiService: UserApiService,
    private userStateService: UserStateService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.phoneNumber = this.route.snapshot.queryParamMap.get('phoneNumber') ?? '';
    this.point = Number(this.route.snapshot.queryParamMap.get('point')) || 0;

    if (!id) {
      this.toastHelper.presentFailedToast('Something went wrong, Try again later');
      return;
    }

    this.rewardApi
      .userGetRewardById(id)
      .pipe(take(1), delay(2000))
      .subscribe((rewardDetail) => {
        this.rewardDetail = rewardDetail;
        this.loaded = true;
        console.log('rewardDetail', this.rewardDetail);
      });
  }

  ngOnDestroy() {}

  async confirmRedeem(reward: Reward) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Redeem',
      message: `Are you sure you want to redeem ${reward.name}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Redeem',
          handler: () => {
            this.RedeemReward(this.rewardDetail); // 原本的 modal 呼叫
          },
        },
      ],
    });

    await alert.present();
  }
  async RedeemReward(reward?: Reward) {
    try {
      // 1️⃣ 先兑换
      const res = await this.rewardApi
        .RedeemVoucher(reward?.rewardId ?? '', this.phoneNumber ?? '')
        .toPromise();

      alert(res);

      // 2️⃣ 兑换成功后，马上拿最新钱包 / point
      if (this.phoneNumber) {
        const phonenumber = this.phoneNumber;

        const walletRes: any = await this.userApiService.getWalletDetails(phonenumber).toPromise();

        console.log('Wallet after redeem:', walletRes);

        // 👉 通知 HomePage：「point 变成多少了」
        this.userStateService.setPoint(walletRes.point);
        // （真正改 this.memberInfo.point 的动作在 HomePage 里）
      }

      // 3️⃣ 再回到 Home
      this.navController.navigateRoot('/tabs/home'); // 如果你的 home 路由是 /home 就改回 /home
    } catch (error: any) {
      console.error('Redeem failed', error);
      alert(error?.error ?? 'Redeem failed');
    }
  }

  async openQrModal() {
    const isAuth = await firstValueFrom(this.auth.isAuthenticated$.pipe(take(1)));
    if (!isAuth) {
      const alert = await this.alertHelper.createConfirmAlert(
        'Login required',
        'Please login to redeem your reward QR code.',
      );
      await alert.present();
      const { role } = await alert.onDidDismiss();
      if (role === 'confirm') {
        this.stateSession.setReturnUrl(this.router.url);
        await this.router.navigate(['/auth/login']);
      }
      return;
    }

    const modal = await this.modalHelper.createQrCodeWithRewardData(this.rewardDetail, '');
    await modal.present();
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
