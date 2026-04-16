import { ReturnStatement, ThisReceiver } from '@angular/compiler';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject, take, takeUntil } from 'rxjs';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { AlertHelperService } from 'src/app/shared/services/alert-helper.service';
import { PageStateService } from 'src/app/shared/services/page-state.service';
import { PageParamKey, PaymentCheckoutPageType } from 'src/app/shared/statics/interface-helper';

@Component({
  selector: 'app-payment-checkout',
  templateUrl: './payment-checkout.page.html',
  styleUrls: ['./payment-checkout.page.scss'],
  standalone: false,
})
export class PaymentCheckoutPage implements OnInit, OnDestroy {
  paymentPageType!: PaymentCheckoutPageType;
  orderId?: string | null;
  phoneNumber: string = '';

  processing: boolean = false;

  isPaymentSuccess: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private pageStateService: PageStateService,
    private alertHelper: AlertHelperService,
    private navCtrl: NavController,
    private router: Router,
    private userStateService: UserStateService,
  ) {}

  private destroy$ = new Subject<void>();

  async ngOnInit() {
    this.userStateService.memberInfo.pipe(take(1)).subscribe({
      next: (res) => {
        if (res) {
          this.phoneNumber = res.phoneNumber;
        }
      },
    });

    const type = (this.route.snapshot.paramMap.get('type') as PaymentCheckoutPageType) || '';
    const orderId = this.route.snapshot.queryParamMap.get(PageParamKey.Order_Id);
    const successParam = this.route.snapshot.queryParamMap.get('success');
    if (!orderId) {
      //Prompt Error
      var alert = await this.alertHelper.createBasicAlert('No Order Found', 'Please try again');

      await alert.present();
      const { role, data } = await alert.onWillDismiss();
      this.navCtrl.back();
      return;
    }

    this.orderId = orderId;
    this.paymentPageType = type;

    this.pageStateService
      .onPaymentCheckoutPageBack()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.handleBackEvent());

    this.processing = true;
    this.isPaymentSuccess = successParam === 'true';

    setTimeout(() => {
      //Payment failed
      // this.handlePaymentFailed();
      // return;
      if (!this.isPaymentSuccess) {
        this.handlePaymentFailed();
        return;
      }

      this.isPaymentSuccess = true;
      this.processing = false;
    }, 3000);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  backToHome() {
    this.navCtrl.navigateRoot('home');
  }

  viewOrder() {
    this.navCtrl.navigateRoot('home');
    this.router.navigate([`/history-details/order/${this.orderId}`], {
      queryParams: { phone: this.phoneNumber },
    });
  }

  private async handleBackEvent() {
    if (!this.processing && this.isPaymentSuccess) {
      this.navCtrl.navigateRoot('order');
      return;
    }

    if (!this.processing && !this.isPaymentSuccess) {
      this.navCtrl.navigateRoot('home');
      this.router.navigate(['/history-list/order'], {
        queryParams: { phone: this.phoneNumber },
      });
      return;
    }

    //Try quit when payment processing
    var alert = await this.alertHelper.createConfirmAlert(
      'Payment is processing',
      'Do you confirm to cancel and quit?',
    );

    await alert.present();
    const { role, data } = await alert.onWillDismiss();

    if (role === 'cancel') {
      return;
    }

    //navigate to order page
    this.navCtrl.navigateRoot('home');
    this.router.navigate(['/history-list/order'], {
      queryParams: { phone: this.phoneNumber },
    });
  }

  private async handlePaymentFailed() {
    var alert = await this.alertHelper.createBasicAlert('Payment failed', 'Please try again');

    await alert.present();
    const { role, data } = await alert.onWillDismiss();

    this.navCtrl.navigateRoot('home');
    this.router.navigate(['/history-list/order'], {
      queryParams: { phone: this.phoneNumber },
    });
  }
}
