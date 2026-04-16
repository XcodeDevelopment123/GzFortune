import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartMenuItem, CartResponse } from 'src/app/core/models/cart.model';
import { PageParamKey } from 'src/app/shared/statics/interface-helper';
import { CartAPiService } from 'src/app/core/repo/api/cart-api.service';
import { PageStateService } from 'src/app/shared/services/page-state.service';
import { Outlet } from 'src/app/core/models/outlet.model';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrls: ['./cart-item.component.scss'],
  standalone: false,
})
export class CartItemComponent implements OnInit {
  @Input() item!: CartMenuItem;
  @Input() cartData: CartResponse | null = null;
  @Input() selectedOutlet: Outlet | null = null;

  constructor(
    private router: Router,
    private cartApiService: CartAPiService,
    private pageStateService: PageStateService,
    private toastHelper: ToastHelperService,
  ) {}

  get totalUnitPrice(): number {
    return (this.item?.qty || 0) * (this.item?.menuUnitPrice || 0);
  }

  ngOnInit() {}

  toEdit() {
    this.router.navigate([`/menu-details/${this.item.menuId}`], {
      queryParams: {
        [PageParamKey.Edit]: true,
        [PageParamKey.Cart_Item_Id]: this.cartData?.cartId,
        [PageParamKey.Quantity]: this.item.qty,
        [PageParamKey.Remark]: this.item.remark,
        outletAddress: this.selectedOutlet?.address,
      },
    });
  }

  removeItem() {
    if (!this.cartData) {
      console.warn('Cart data missing,cannot remove item.');
      return;
    }

    const updatedMenuItems = this.cartData.menuItemList.filter(
      (i) => i.menuId !== this.item.menuId || i.remark !== this.item.remark,
    );

    const payload = {
      cartId: this.cartData.cartId,
      menuItemList: JSON.stringify(updatedMenuItems),
      menuIdList: updatedMenuItems.map((i) => i.menuId).join(''),
      merchantRestaurantAddress: this.cartData.merchantRestaurantAddress,
      deliveryAddress: this.cartData.deliveryAddress,
      receiverName: this.cartData.receiverName,
    };

    this.cartApiService.editCart(payload).subscribe({
      next: () => {
        console.log('✅ Item removed from cart.');
        this.pageStateService.triggerEditOrderSummary();

        this.pageStateService.triggerOderPageAddItemToCart({
          type: 'cart-updated',
          from: 'order-summary-remove',
        });
        this.toastHelper.presentSuccessToast('✅ Item removed from cart.');
      },
      error: (err) => {
        console.error('❌ Failed to remove item:', err);
      },
    });
  }
}
