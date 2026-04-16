import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NavController } from '@ionic/angular';
import { catchError, delay, EMPTY, finalize, map, switchMap, take, tap } from 'rxjs';
import { AddCart, CartMenuItem } from 'src/app/core/models/cart.model';
import { OrderHistory } from 'src/app/core/models/delivery.model';
import { Member } from 'src/app/core/models/member.model';
import { Outlet } from 'src/app/core/models/outlet.model';
import { CartAPiService } from 'src/app/core/repo/api/cart-api.service';
import { OutletApiService } from 'src/app/core/repo/api/outlet-api-service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { DateHelperService } from 'src/app/shared/services/date-helper.service';
import { LoadingHelperService } from 'src/app/shared/services/loading-helper.service';
import { PageStateService } from 'src/app/shared/services/page-state.service';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';

@Component({
  selector: 'app-order-history-details',
  templateUrl: './order-history-details.component.html',
  styleUrls: ['./order-history-details.component.scss'],
  standalone: false,
})
export class OrderHistoryDetailsComponent implements OnInit, OnChanges {
  @Input() orderDetails: OrderHistory | null = null;
  outlets: Outlet | null = null;
  menuItemList: CartMenuItem[] = [];
  memberInfo!: Member;

  constructor(
    private outletApiService: OutletApiService,
    private loadingHelper: LoadingHelperService,
    private cartApiService: CartAPiService,
    private toastHelper: ToastHelperService,
    private pageStateService: PageStateService,
    private userStateService: UserStateService,
    private navCtrl: NavController,
    private dateHelper: DateHelperService,
  ) {}

  ngOnInit() {
    this.userStateService.memberInfo.pipe(take(1)).subscribe({
      next: (res) => {
        if (res) {
          this.memberInfo = res;
        }
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orderDetails'] && this.orderDetails) {
      const outletsId = this.orderDetails.outletsId;

      this.outletApiService
        .getOutletById(outletsId)
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            this.outlets = res;
          },
          error: (err) => {
            console.error('❌ Failed to fetch outlet:', err);
          },
        });
      this.menuItemList = this.orderDetails?.menuItemList || [];
      console.log(this.orderDetails);
      console.log(this.menuItemList);
    }
  }

  getLocaleDate(date: string): string {
    return this.dateHelper.formatLocale(date);
  }

  orderAgain() {
    if (!this.orderDetails?.memberPhone || !this.menuItemList.length) {
      console.error('❌ Missing member phone or menu items');
      return;
    }

    this.loadingHelper.show();

    this.cartApiService
      .getUserCartByPhone(this.orderDetails.memberPhone)
      .pipe(
        take(1),
        switchMap((cart) => {
          if (cart) {
            const existingMenuItems = cart.menuItemList || [];
            const mergedItems = [...existingMenuItems];

            for (const newItem of this.menuItemList) {
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
              menuItemList: JSON.stringify(this.menuItemList),
              memberId: this.memberInfo?.userId || '',
              memberPhone: this.orderDetails?.memberPhone || '',
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
}
