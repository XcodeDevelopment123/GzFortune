import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import { Outlet } from '../general/outlets/outlets.page';
import { Outlet } from 'src/app/core/models/outlet.model';
import { PaymentMethodSectionComponent } from './components/payment-method-section/payment-method-section.component';
import { CartItemsSectionComponent } from './components/cart-items-section/cart-items-section.component';
import { PaymentSummarySectionComponent } from './components/payment-summary-section/payment-summary-section.component';
import { PickUpOrderInfoSectionComponent } from './components/pick-up-order-info-section/pick-up-order-info-section.component';
import { VoucherSectionComponent } from './components/voucher-section/voucher-section.component';
import { PageStateService } from 'src/app/shared/services/page-state.service';
import {
  catchError,
  EMPTY,
  lastValueFrom,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
  throwError,
  filter,
} from 'rxjs';
import { LoadingHelperService } from 'src/app/shared/services/loading-helper.service';
import { OrderTypePre, PageParamKey } from 'src/app/shared/statics/interface-helper';
import { Router } from '@angular/router';
import { CartAPiService } from 'src/app/core/repo/api/cart-api.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { CartMenuItem, CartResponse } from 'src/app/core/models/cart.model';
import { RazorApiService } from 'src/app/core/repo/api/razorpay-api.service';
import { DeliveryApiService } from 'src/app/core/repo/api/delivery-api.service';
import { Member } from 'src/app/core/models/member.model';
import { CreatePickUpRequest, VoucherDeliveryList } from 'src/app/core/models/delivery.model';
import { CreatePaymentLinkResponse, RazorPayCreate } from 'src/app/core/models/razorpay.model';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';
import { Checkout } from 'capacitor-razorpay';
import { UserApiService } from 'src/app/core/repo/api/user-api.service';
import { VoucherDelivery } from 'src/app/core/models/delivery.model';
import { PointSectionComponent } from './components/point-section/point-section.component';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.page.html',
  styleUrls: ['./order-summary.page.scss'],
  standalone: false,
})
export class OrderSummaryPage implements OnInit, OnDestroy {
  @ViewChild('footer') footerRef!: ElementRef;
  @ViewChild('container') containerRef!: ElementRef;
  @ViewChild(PickUpOrderInfoSectionComponent)
  pickUpSection!: PickUpOrderInfoSectionComponent;
  @ViewChild(CartItemsSectionComponent)
  cartSection!: CartItemsSectionComponent;
  @ViewChild(VoucherSectionComponent)
  voucherSection!: VoucherSectionComponent;
  @ViewChild(PaymentSummarySectionComponent)
  summarySection!: PaymentSummarySectionComponent;
  @ViewChild(PaymentMethodSectionComponent)
  paymentMethodSection!: PaymentMethodSectionComponent;

  orderType!: OrderTypePre;

  private destroy$ = new Subject<void>();

  cartData: CartResponse | null = null;

  cartItems: CartMenuItem[] = [];

  memberInfo: Member | null = null;

  deliveryVoucher: VoucherDeliveryList | null = null; // 或者 VoucherDelivery[] | null

  selectedOutlet: Outlet | null = null;

  selectedVoucherId: string = '';

  selectedVoucher: VoucherDelivery | null = null;

  userPoints = 0;
  redeemedPoints: number = 0;
  pointDiscount: number = 0;

  constructor(
    private pageStateService: PageStateService,
    private loadingHelper: LoadingHelperService,
    private router: Router,
    private cartApiService: CartAPiService,
    private userStateService: UserStateService,
    private razorApiService: RazorApiService,
    private deliveryApiService: DeliveryApiService,
    private toastHelper: ToastHelperService,
    private userApiService: UserApiService,
  ) {
    const nav = this.router.getCurrentNavigation();
    this.selectedOutlet = nav?.extras.state?.['outlet'];
  }

  ngOnInit() {
    this.orderType = OrderTypePre.PICKUP;

    this.userStateService.memberInfo
      .pipe(
        filter((res): res is Member => !!res),
        take(1),
      )
      .subscribe((res) => {
        this.memberInfo = res;
        this.userPoints = res.availablePoint ?? 0;
      });

    this.fetchCartData();

    this.deliveryApiService
      .getAllDeliveryVoucherByPhone(this.memberInfo?.phoneNumber || '')
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.deliveryVoucher = res;
          console.log('delivery voucher', this.deliveryVoucher);
        },
      });

    this.pageStateService
      .onTriggerEditOrderSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('trigger refresh cart page');
        this.fetchCartData();
        //call api to retrieve latest cart
        setTimeout(() => {
          this.loadingHelper.hide();
        }, 500);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const footerHeight = this.footerRef.nativeElement.offsetHeight;

      this.containerRef.nativeElement.style.paddingBottom = `${footerHeight + 12}px`;
    }, 50);
  }

  private processCartItems() {
    if (!this.cartData?.menuItemList) return;

    let rawItems: CartMenuItem[] = this.cartData!.menuItemList;
    const mergedItems: CartMenuItem[] = [];

    for (const item of rawItems) {
      const key = `${item.menuId}|${item.addOns}|${item.productId}|${item.remark ?? ''}`;

      const existing = mergedItems.find(
        (x) => `${x.menuId}|${x.addOns}|${x.productId}|${x.remark ?? ''}` === key,
      );

      if (existing) {
        existing.qty += item.qty;
      } else {
        mergedItems.push({ ...item });
      }
    }

    this.cartItems = mergedItems;
    console.log('Cart item', this.cartItems);
  }

  fetchCartData() {
    if (this.memberInfo) {
      const phone = this.memberInfo.phoneNumber;

      this.cartApiService
        .getUserCartByPhone(phone)
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            this.cartData = res;
            this.processCartItems();
            console.log('CartData', this.cartData);
          },
          error: (err) => {
            console.error('❌ Failed to get cart:', err);
          },
        });
    }
  }

  orderNow() {
    if (this.memberInfo) {
      var paymentMethod = this.paymentMethodSection.paymentMethod;
      console.log('✅ 当前选择的支付方式：', paymentMethod);

      if (paymentMethod === 'curlec') {
        const payload: RazorPayCreate = {
          type: this.orderType,
          phoneNumber: this.memberInfo.phoneNumber,
          deliveryVouchersId: this.selectedVoucher?.deliveryVouchersId || '',
          pointDiscount: this.redeemedPoints,
        };

        this.razorApiService.createPaymentLink(payload).subscribe({
          next: async (res) => {
            await this.payWithRazorpay(res);
          },
          error: (err) => {
            console.error('❌ 创建 Payment Link 失败:', err);
            this.toastHelper.presentFailedToast('Failed to create payment link');
          },
        });
        return;
      }

      if (paymentMethod === 'app-wallet') {
        const payload: RazorPayCreate = {
          type: this.orderType,
          phoneNumber: this.memberInfo.phoneNumber,
          deliveryVouchersId: this.selectedVoucher?.deliveryVouchersId || '',
          pointDiscount: this.redeemedPoints,
        };

        const resPickUp: CreatePickUpRequest = {
          cartId: this.cartData?.cartId ?? '',
          paymentMethod,
          stop1AddressName: this.selectedOutlet?.address ?? '',
          outletsId: this.selectedOutlet?.outletsId ?? '',
        };

        this.userApiService
          .memberSpend(payload)
          .pipe(
            tap(() => console.log('✅ Wallet Spend 成功')),
            switchMap(() => {
              console.log('⏩ 开始 CreatePickup...');
              return this.deliveryApiService.createPickUp(resPickUp).pipe(
                catchError((err) => {
                  if (
                    err?.status === 400 &&
                    typeof err?.error === 'string' &&
                    err.error.includes('Order History not found')
                  ) {
                    // 钱包不够
                    console.warn('❌ 钱包不足，CreatePickup 被拒绝');
                    this.toastHelper.presentFailedToast('Payment failed: Insufficient balance !');
                    return EMPTY;
                  }
                  // 其他错误
                  return throwError(() => err);
                }),
              );
            }),
          )
          .subscribe({
            next: (res) => {
              console.log('✅ create pick up:', res);
              this.toastHelper.presentSuccessToast('Payment successful!');
              const paymentPageUrl = `/general/payment-checkout/${this.orderType}`;
              this.router.navigate([paymentPageUrl], {
                queryParams: {
                  [PageParamKey.Order_Id]: res,
                  success: true,
                },
              });
            },
            error: (err) => {
              console.error('❌system error:', err);
              this.toastHelper.presentFailedToast('Payment failed');
            },
          });
      }
    }
  }

  async payWithRazorpay(paymentLink: CreatePaymentLinkResponse) {
    const options = this.getRazorpayOptions();

    try {
      console.log('📣 Opening Razorpay payment sheet', options);
      const data = await Checkout.open(options);
      console.log('✅ Payment success response:', data);

      this.toastHelper.presentSuccessToast('Payment successful!');

      // 🔧 构造 CreatePickUp 的 payload
      const createPickUpPayload: CreatePickUpRequest = {
        cartId: this.cartData?.cartId ?? '',
        paymentMethod: 'curlec',
        stop1AddressName: this.selectedOutlet?.address ?? '',
        outletsId: this.selectedOutlet?.outletsId ?? '',
      };

      // ✅ 调用 createPickUp
      const orderId = await lastValueFrom(
        this.deliveryApiService.createPickUp(createPickUpPayload).pipe(
          catchError((err) => {
            console.error('❌ CreatePickUp 失败:', err);
            this.toastHelper.presentFailedToast('Payment succeeded but order creation failed!');
            throw err; // 阻止跳转
          }),
        ),
      );

      // ✅ 支付成功 + 订单成功 → 跳转
      const paymentPageUrl = `/general/payment-checkout/${this.orderType}`;
      this.router.navigate([paymentPageUrl], {
        queryParams: {
          [PageParamKey.Order_Id]: orderId,
          success: true,
        },
      });
    } catch (error) {
      console.error('❌ Payment failed or cancelled', error);

      const paymentPageUrl = `/general/payment-checkout/${this.orderType}`;
      this.router.navigate([paymentPageUrl], {
        queryParams: {
          [PageParamKey.Order_Id]: paymentLink.orderId,
          success: false,
        },
      });
    }
  }

  getRazorpayOptions() {
    return {
      key: 'rzp_test_RH7nkv5xmwB3yb',
      amount: this.cartData?.grandTotal
        ? Math.round(this.cartData.grandTotal * 100).toString()
        : '0',
      currency: 'MYR',
      description: '',
      order_id: '',
      redirect: false,
      prefill: {
        name: this.memberInfo?.name ?? '',
        email: this.memberInfo?.email ?? '',
        contact: this.memberInfo?.phoneNumber ?? '',
      },
      timeout: 300, // 可选：秒数
      retry: { enabled: false },
    };
  }

  canCheckout(): boolean {
    if (!this.paymentMethodSection?.validate()) {
      return false;
    }
    if (this.cartItems === null || this.cartItems.length === 0) {
      return false;
    }

    // return true;
    return false;
  }

  onVoucherSelected(voucher: any) {
    this.selectedVoucher = voucher;
    console.log('Selected voucher:', this.selectedVoucher);
  }

  onVoucherRemoved() {
    this.selectedVoucher = null;
    console.log('Voucher removed', this.selectedVoucher);
  }

  onPointsRedeemed(points: number) {
    this.redeemedPoints = points;
    this.pointDiscount = (points || 0) / 100;
  }

  showPointWarn(msg: string) {
    this.toastHelper?.presentFailedToast?.(msg);
  }
}
