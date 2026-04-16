import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  catchError,
  delay,
  EMPTY,
  finalize,
  firstValueFrom,
  lastValueFrom,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { CreatePickUpRequest, OrderHistory } from 'src/app/core/models/delivery.model';
import { HistoryApiService } from 'src/app/core/repo/api/history-api.service';
import { RazorApiService } from 'src/app/core/repo/api/razorpay-api.service';
import { Checkout } from 'capacitor-razorpay';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';
import { DeliveryApiService } from 'src/app/core/repo/api/delivery-api.service';
import { AddCart, CartMenuItem } from 'src/app/core/models/cart.model';
import { LoadingHelperService } from 'src/app/shared/services/loading-helper.service';
import { CartAPiService } from 'src/app/core/repo/api/cart-api.service';
import { NavController } from '@ionic/angular';
import { PageStateService } from 'src/app/shared/services/page-state.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { Member } from 'src/app/core/models/member.model';
import type { InfiniteScrollCustomEvent } from '@ionic/angular';
import { DateHelperService } from 'src/app/shared/services/date-helper.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
  standalone: false,
})
export class OrderListComponent implements OnInit {
  phoneNumber: string = '';
  orderType: string = 'at-restaurant';
  orderhistory: OrderHistory[] = [];
  filteredOrderHistory: OrderHistory[] = [];
  memberInfo!: Member;

  visibleOrders: OrderHistory[] = [];
  pageSize = 10;
  currentIndex = 0;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private historyApiService: HistoryApiService,
    private razorApiService: RazorApiService,
    private toastHelper: ToastHelperService,
    private deliveryApiService: DeliveryApiService,
    private loadingHelper: LoadingHelperService,
    private cartApiService: CartAPiService,
    private navCtrl: NavController,
    private pageStateService: PageStateService,
    private userStateService: UserStateService,
    private dateHelper: DateHelperService,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.phoneNumber = params.get('phone') || '';
      console.log(this.phoneNumber, '✅ received from query param');
      if (this.phoneNumber) {
        this.loadOrderHistory();
      }
    });

    this.userStateService.memberInfo.pipe(take(1)).subscribe({
      next: (res) => {
        if (res) {
          this.memberInfo = res;
        }
      },
    });
  }

  loadOrderHistory() {
    this.historyApiService
      .getHistoryListByPhone(this.phoneNumber)
      .pipe(take(1))
      .subscribe((res) => {
        this.orderhistory = (res || []).sort(
          (a, b) => new Date(b.orderDateTime).getTime() - new Date(a.orderDateTime).getTime(),
        );

        this.applyFilterAndReset();
        console.log('📦 order history sorted:', this.orderhistory);
      });
  }

  async continuePayment(order: OrderHistory) {
    console.log('🟧 Continuing payment for order:', order);

    try {
      const res = await firstValueFrom(
        this.razorApiService.getPaymentLink(this.phoneNumber, order.paymentId),
      );

      console.log('✅ Payment link data retrieved:', res);

      if (typeof res === 'string' && res === 'Expired') {
        this.loadingHelper.show();

        setTimeout(() => {
          this.loadingHelper.hide();
          this.toastHelper.presentFailedToast(
            'Payment link has expired. Please place a new order.',
          );
        }, 2000);

        order.orderStatus = 'Expired';
        return;
      }

      const options = this.getRazorpayOptions(order);
      console.log('🟩 Razorpay options prepared:', options);

      const data = await Checkout.open(options);
      console.log('✅ Payment success response:', data);

      // ✅ 构造 CreatePickUp payload
      const createPickUpPayload: CreatePickUpRequest = {
        cartId: order.cartId,
        paymentMethod: order.paymentType, // 通常是 'curlec'
        stop1AddressName: order.customerDeliveryAddress,
        outletsId: order.outletsId,
      };

      // ✅ 调用 createPickUp
      const pickupOrderId = await lastValueFrom(
        this.deliveryApiService.createPickUp(createPickUpPayload).pipe(
          catchError((err) => {
            this.loadingHelper.show();
            setTimeout(() => {
              this.loadingHelper.hide();
              this.toastHelper.presentFailedToast('Payment succeeded but order creation failed!');
            }, 2000);
            console.error('❌ CreatePickUp 失败:', err);
            throw err;
          }),
        ),
      );

      // ✅ 全部成功 → 提示 & 刷新
      this.loadingHelper.show();
      setTimeout(() => {
        this.loadingHelper.hide();
        this.toastHelper.presentSuccessToast('Payment successful!');
      }, 2000);

      console.log('✅ Order created via pickup:', pickupOrderId);
      order.orderStatus = 'Pending';
      this.loadOrderHistory();
    } catch (error) {
      this.loadingHelper.show();
      setTimeout(() => {
        this.loadingHelper.hide();
        this.toastHelper.presentFailedToast('Payment was cancelled or failed.');
      }, 2000);
      console.error('❌ Payment failed or cancelled', error);
    }
  }

  getRazorpayOptions(order: OrderHistory) {
    return {
      key: 'rzp_test_RH7nkv5xmwB3yb',
      amount: Math.round(order.grandTotal * 100).toString(),
      currency: 'MYR',
      description: '',
      order_id: '',
      redirect: false,
      prefill: {
        name: order.receiverName,
        email: '',
        contact: order.memberPhone,
      },
      timeout: 300, // 可选：秒数
      retry: { enabled: false },
    };
  }

  orderAgain(order: OrderHistory) {
    const body = {
      OrderId: order.orderId,
      PhoneNumber: this.phoneNumber,
    };

    this.loadingHelper.show();
    this.historyApiService
      .getOrderHistoryByOrderId(body)
      .pipe(
        switchMap((res) => {
          const reOrderMenuItems = res.menuItemList;

          if (!reOrderMenuItems || reOrderMenuItems.length === 0) {
            this.loadingHelper.hide();
            this.toastHelper.presentFailedToast('⚠️ No items found in this order');
            return EMPTY;
          }

          return this.cartApiService
            .getUserCartByPhone(this.phoneNumber)
            .pipe(map((cart) => ({ cart, reOrderMenuItems })));
        }),
        switchMap(({ cart, reOrderMenuItems }) => {
          if (cart) {
            const existingMenuItems = cart.menuItemList || [];
            const mergedItems = [...existingMenuItems];

            for (const newItem of reOrderMenuItems) {
              const existingIndex = mergedItems.findIndex((item) => item.menuId === newItem.menuId);
              if (existingIndex > -1) {
                mergedItems[existingIndex].qty += newItem.qty;
              } else {
                mergedItems.push(newItem);
              }
            }

            const payload = {
              cartId: cart.cartId,
              menuItemList: JSON.stringify(mergedItems),
              menuIdList: cart.menuIdList,
              merchantRestaurantAddress: cart.merchantRestaurantAddress,
              deliveryAddress: cart.deliveryAddress,
              receiverName: cart.receiverName,
            };

            return this.cartApiService.editCart(payload).pipe(map(() => ({ cartId: cart.cartId })));
          } else {
            const payload: AddCart = {
              cartId: '',
              menuIdList: '',
              menuItemList: JSON.stringify(reOrderMenuItems),
              memberId: this.memberInfo.userId,
              memberPhone: this.memberInfo.phoneNumber,
              subTotal: 0,
              grandTotal: 0,
              deliveryAddress: 'test',
              merchantRestaurantAddress: '',
            };

            return this.cartApiService.addToCart(payload).pipe(map((cartId) => ({ cartId })));
          }
        }),
        tap(() => {
          this.toastHelper.presentSuccessToast('Items added to cart');
          this.pageStateService.triggerOderPageAddItemToCart({
            type: 'cart-updated',
            from: 'order-again',
          });
        }),
        delay(300),
        tap(() => this.navCtrl.navigateForward(['/order'])),
        finalize(() => this.loadingHelper.hide()),
        catchError((err) => {
          this.loadingHelper.hide();
          this.toastHelper.presentFailedToast('❌ Something went wrong');
          console.error('❌ orderAgain error:', err);
          return EMPTY;
        }),
      )
      .subscribe();
  }

  getMenuSummary(menuItemList: CartMenuItem[]): string {
    if (!menuItemList?.length) return '';

    const firstTitle = menuItemList[0].title; // 注意小写字段名
    if (menuItemList.length === 1) {
      return firstTitle;
    }
    return `${firstTitle} + ${menuItemList.length - 1} Others`;
  }

  getLocaleDate(date: string): string {
    return this.dateHelper.formatLocale(date);
  }

  changeHistoryType(type: 'at-restaurant' | 'delivery') {
    this.orderType = type;
    this.filterOrderHistory();
  }

  filterOrderHistory() {
    this.filteredOrderHistory = this.orderhistory.filter((order) => {
      if (this.orderType === 'at-restaurant') return order.type === 'pickup';
      if (this.orderType === 'delivery') return order.type === 'delivery';
      return false;
    });
  }

  applyFilterAndReset() {
    this.filterOrderHistory();
    this.visibleOrders = [];
    this.currentIndex = 0;
    this.loadMoreOrders();
  }

  // —— 分页 —— //
  async loadMoreOrders(event?: InfiniteScrollCustomEvent) {
    if (this.isLoading) {
      event?.target.complete();
      return;
    }
    const source = this.filteredOrderHistory ?? [];
    if (!source.length) {
      if (event) {
        event.target.complete();
        event.target.disabled = true;
      }
      return;
    }

    this.isLoading = true;

    // ⬇️ 给 spinner 一点可见时间
    await new Promise((r) => setTimeout(r, 600));

    const next = source.slice(this.currentIndex, this.currentIndex + this.pageSize);
    this.visibleOrders = [...this.visibleOrders, ...next];
    this.currentIndex += this.pageSize;

    event?.target.complete();
    if (event && this.visibleOrders.length >= source.length) {
      event.target.disabled = true;
    }
    this.isLoading = false;

    console.log(`✅ loaded ${this.visibleOrders.length}/${source.length}`);
  }

  trackById(_: number, item: OrderHistory) {
    return item.orderId;
  }
}
