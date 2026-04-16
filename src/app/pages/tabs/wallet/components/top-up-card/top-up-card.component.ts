import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Member } from 'src/app/core/models/member.model';
import { CreatePaymentLinkResponse } from 'src/app/core/models/razorpay.model';
import { RazorApiService } from 'src/app/core/repo/api/razorpay-api.service';
import { LoadingHelperService } from 'src/app/shared/services/loading-helper.service';
import { Checkout } from 'capacitor-razorpay';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';
import { take } from 'rxjs';
import { UserApiService } from 'src/app/core/repo/api/user-api.service';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-top-up-card',
  templateUrl: './top-up-card.component.html',
  styleUrls: ['./top-up-card.component.scss'],
  standalone: false,
})
export class TopUpCardComponent implements OnInit {
  @Input() memberInfo!: Member;
  @Output() walletUpdated = new EventEmitter<any>();
  topupAmount: number = 0;
  lastPaymentId: string = '';

  constructor(
    private razorApiService: RazorApiService,
    private loadingHelper: LoadingHelperService,
    private toastHelper: ToastHelperService,
    private userApiService: UserApiService,
    private userStateService: UserStateService,
  ) {}

  ngOnInit() {}

  updateAmount(amount: number) {
    this.topupAmount = amount;
  }

  handleTopup() {
    const phone = this.memberInfo.phoneNumber;
    const amount = this.topupAmount;

    this.loadingHelper.show();

    this.razorApiService
      .createTopUpPaymentLink(phone, amount)
      .pipe(take(1))
      .subscribe({
        next: async (res) => {
          console.log('Top-up payment link created:', res);
          if (res) {
            await this.payWithRazorpay(res);
          }
          this.loadingHelper.hide();
        },
        error: (err) => {
          console.error('Error creating top-up payment link:', err);
          this.toastHelper.presentFailedToast('Failed to create payment link');
          this.loadingHelper.hide();
        },
      });
  }

  async payWithRazorpay(paymentLink: CreatePaymentLinkResponse) {
    const options = this.getRazorpayOptions();
    options.order_id = paymentLink.curlecOrderId;

    try {
      console.log('📣 Opening Razorpay payment sheet', options);
      const data: any = await Checkout.open(options);
      console.log('✅ Payment success response:', data);

      // ✅ 成功付款后刷新钱包
      this.refreshWalletAfterTopup(true);
    } catch (error) {
      console.error('❌ Payment failed or cancelled', error);
      this.refreshWalletAfterTopup(false);
    }
  }

  getRazorpayOptions() {
    return {
      key: 'rzp_test_RH7nkv5xmwB3yb',
      amount: Math.round(this.topupAmount * 100).toString(), // 转换为分
      currency: 'MYR',
      description: '',
      order_id: '',
      redirect: false,
      prefill: {
        name: this.memberInfo.name,
        email: this.memberInfo.email,
        contact: this.memberInfo.phoneNumber,
      },
      timeout: 300, // 可选：秒数
      retry: { enabled: false },
    };
  }

  private refreshWalletAfterTopup(success: boolean) {
    this.userApiService.getWalletDetails(this.memberInfo.phoneNumber).subscribe({
      next: (res) => {
        this.walletUpdated.emit(res);
        this.userStateService.updateWalletInfo(res);
        if (success) {
          this.loadingHelper.show();
          setTimeout(() => {
            this.loadingHelper.hide();

            setTimeout(() => {
              this.toastHelper.presentSuccessToast('Payment Successful, wallet state refreshed.');
            }, 100);
          }, 2000);
        } else {
          this.loadingHelper.show();
          setTimeout(() => {
            this.loadingHelper.hide();

            setTimeout(() => {
              this.toastHelper.presentFailedToast('Payment failed, wallet state refreshed.');
            }, 100);
          }, 2000);
        }
      },
      error: (err) => {
        console.error('❌ Failed to update wallet', err);
        this.toastHelper.presentFailedToast('Failed to refresh wallet');
      },
    });
  }
}
