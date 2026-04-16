import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Reward } from 'src/app/core/models/reward.model';
import { ModalHelperService } from 'src/app/shared/services/modal-helper.service';
import { AlertController } from '@ionic/angular';
import { RewardApiService } from 'src/app/core/repo/api/reward-api.service';
import { Device } from '@capacitor/device';

@Component({
  selector: 'app-point-tab',
  templateUrl: './point-tab.component.html',
  styleUrls: ['./point-tab.component.scss'],
  standalone: false,
})
export class PointTabComponent implements OnInit {
  @Input() userPoint: number = 0;
  //userPoint = 20;
  @Input() rewards: Reward[] = [];
  @Input() userPhoneNumber: string = '';
  @Output() redeemed = new EventEmitter<void>();

  sortedRewards: Reward[] = [];

  constructor(
    private modalHelper: ModalHelperService,
    private alertCtrl: AlertController,
    private rewardApi: RewardApiService,
  ) {}

  async ngOnInit() {
    this.sortedRewards = [...this.rewards].sort((a, b) => a.point - b.point);
    console.log(this.sortedRewards);
    await this.checkDevice();
  }

  // 单独写一个检测函数保持代码整洁
  async checkDevice() {
    const info = await Device.getInfo();
    // alert(info.model); // 建议加个log方便调试
    // alert(info.name); // 建议加个log方便调试

    if (info.model === 'iPhone14,5' || info.model === 'iPhone 14,5') {
      document.body.classList.add('model-iphone-13');
    }
  }

  // 4. 使用 ngOnDestroy 替代 ionViewWillLeave
  ngOnDestroy() {
    document.body.classList.remove('model-iphone-13');
  }

  // 如果 rewards 可能是 async 才进来（ngOnInit 后才有值）
  ngOnChanges() {
    this.sortedRewards = [...this.rewards].sort((a, b) => a.point - b.point);
  }

  async openQrModal(Reward: Reward) {
    const modal = await this.modalHelper.createQrCodeWithRewardData(Reward, '');
    await modal.present();
  }

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
            this.RedeemReward(reward); // 原本的 modal 呼叫
          },
        },
      ],
    });

    await alert.present();
  }

  async RedeemReward(reward: Reward) {
    try {
      const res = await this.rewardApi
        .RedeemVoucher(reward.rewardId, this.userPhoneNumber)
        .toPromise();

      this.userPoint -= reward.point;
      alert(res);
      this.redeemed.emit(); // 🔥 通知父组件刷新 Voucher List
    } catch (error: any) {
      alert(error.error);
      console.error('Redeem failed', error);
    }
  }
}















// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { Reward } from 'src/app/core/models/reward.model';
// import { ModalHelperService } from 'src/app/shared/services/modal-helper.service';
// import { AlertController } from '@ionic/angular';
// import { RewardApiService } from 'src/app/core/repo/api/reward-api.service';
// import { Device } from '@capacitor/device';

// @Component({
//   selector: 'app-point-tab',
//   templateUrl: './point-tab.component.html',
//   styleUrls: ['./point-tab.component.scss'],
//   standalone: false,
// })
// export class PointTabComponent implements OnInit {
//   @Input() userPoint: number = 0;
//   //userPoint = 20;
//   @Input() rewards: Reward[] = [];
//   @Input() userPhoneNumber: string = '';
//   @Output() redeemed = new EventEmitter<void>();

//   sortedRewards: Reward[] = [];

//   constructor(
//     private modalHelper: ModalHelperService,
//     private alertCtrl: AlertController,
//     private rewardApi: RewardApiService,
//   ) {}

//   async ngOnInit() {
//     this.applyRewardFilterAndSort();
//     await this.checkDevice();
//   }

//   private applyRewardFilterAndSort() {
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);

//     this.sortedRewards = (this.rewards ?? [])
//       .filter((r) => this.isRewardDisplayable(r, todayStart))
//       .sort((a, b) => (a.point ?? 0) - (b.point ?? 0));
//   }

//   private isRewardDisplayable(r: Reward, todayStart: Date): boolean {
//     // 1) status 过滤：只显示 Active
//     if ((r as any).status && String((r as any).status).toLowerCase() !== 'active') {
//       return false;
//     }

//     // 2) expireDate / expiryDate 过滤：过期不显示
//     const exp = this.getExpiryDate(r);
//     if (!exp) return true; // 如果没给过期日：你可以选择显示 or 不显示（这里选择显示）

//     // 如果 exp < 今天00:00 就视为过期
//     return exp.getTime() >= todayStart.getTime();
//   }

//   private getExpiryDate(r: Reward): Date | null {
//     const anyR = r as any;
//     const raw: string | null = anyR.expireDate ?? anyR.expiryDate ?? null;

//     if (!raw) return null;

//     // "YYYY-MM-DD" -> 当地时间 00:00:00
//     if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
//       const [y, m, d] = raw.split('-').map(Number);
//       return new Date(y, m - 1, d, 0, 0, 0, 0);
//     }

//     // ISO 字符串（例如 "2026-01-14T00:00:00"）
//     const dt = new Date(raw);
//     return isNaN(dt.getTime()) ? null : dt;
//   }

//   // 单独写一个检测函数保持代码整洁
//   async checkDevice() {
//     const info = await Device.getInfo();
//     // alert(info.model); // 建议加个log方便调试
//     // alert(info.name); // 建议加个log方便调试

//     if (info.model === 'iPhone14,5' || info.model === 'iPhone 14,5') {
//       document.body.classList.add('model-iphone-13');
//     }
//   }

//   // 4. 使用 ngOnDestroy 替代 ionViewWillLeave
//   ngOnDestroy() {
//     document.body.classList.remove('model-iphone-13');
//   }

//   // 如果 rewards 可能是 async 才进来（ngOnInit 后才有值）
//   ngOnChanges() {
//     this.applyRewardFilterAndSort();
//   }

//   async openQrModal(Reward: Reward) {
//     const modal = await this.modalHelper.createQrCodeWithRewardData(Reward, '');
//     await modal.present();
//   }

//   async confirmRedeem(reward: Reward) {
//     const alert = await this.alertCtrl.create({
//       header: 'Confirm Redeem',
//       message: `Are you sure you want to redeem ${reward.name}?`,
//       buttons: [
//         {
//           text: 'Cancel',
//           role: 'cancel',
//         },
//         {
//           text: 'Redeem',
//           handler: () => {
//             this.RedeemReward(reward); // 原本的 modal 呼叫
//           },
//         },
//       ],
//     });

//     await alert.present();
//   }

//   async RedeemReward(reward: Reward) {
//     try {
//       const res = await this.rewardApi
//         .RedeemVoucher(reward.rewardId, this.userPhoneNumber)
//         .toPromise();

//       this.userPoint -= reward.point;
//       alert(res);
//       this.redeemed.emit(); // 🔥 通知父组件刷新 Voucher List
//     } catch (error: any) {
//       alert(error.error);
//       console.error('Redeem failed', error);
//     }
//   }
// }

