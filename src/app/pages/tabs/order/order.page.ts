import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { of, Subject, switchMap, take, takeUntil, forkJoin, firstValueFrom } from 'rxjs';
import { PageStateService } from 'src/app/shared/services/page-state.service';
import { StorageHelperService } from 'src/app/shared/services/storage-helper.service';
import { OrderTypePre, PageParamKey } from 'src/app/shared/statics/interface-helper';
import { AppService } from 'src/app/shared/services/app.service';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';
import { MenuItemComponent } from 'src/app/shared/components/menu-item/menu-item.component';
import { LoadingHelperService } from 'src/app/shared/services/loading-helper.service';
import { MenuApiService } from 'src/app/core/repo/api/menu-api.service';
import { MenuCategory, Menu, MenuGroup } from 'src/app/core/models/menu.model';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { Member } from 'src/app/core/models/member.model';
import { CartAPiService } from 'src/app/core/repo/api/cart-api.service';
// import { Outlet } from '../../general/outlets/outlets.page';
import { Outlet } from 'src/app/core/models/outlet.model';
import { Geolocation } from '@capacitor/geolocation';
import { OutletApiService } from 'src/app/core/repo/api/outlet-api-service';
import { DistanceCalculator } from 'src/app/shared/utils/distance-calculator';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
  standalone: false,
})
export class OrderPage implements OnInit, OnDestroy {
  ORDER_TYPE_PRE = OrderTypePre;
  @ViewChild('orderInfoFullDetail') orderInfoFullDetail!: ElementRef;
  @ViewChildren('menuSection', { read: ElementRef })
  menuSections!: QueryList<ElementRef>;
  @ViewChildren('categorySection', { read: ElementRef })
  categorySection!: QueryList<ElementRef>;
  @ViewChildren('menuItem') menuItemsRef!: QueryList<MenuItemComponent>;

  @ViewChild('menuRight', { static: false }) menuRightRef!: ElementRef;
  @ViewChild('menuLeft', { static: false }) menuLeftRef!: ElementRef;
  @ViewChild('cartFab', { static: false }) cartButtonRef!: ElementRef;
  @ViewChild('cartBadge', { static: false }) badgeElRef!: ElementRef;
  triggerCartBadgeAnimate: boolean = false;
  orderInfoFullDetailHeight = 0;

  isScrolledBottom: boolean = false;
  private sectionTops: { id: string; offsetTop: number }[] = [];
  private lastScrollTop = 0;
  private scrollTimeout: any = null; //debounce

  orderType!: OrderTypePre;
  orderTypeLabels = {
    [OrderTypePre.DELIVERY]: 'Delivery',
    [OrderTypePre.PICKUP]: 'Pickup',
    // default empty string
  };

  outlets: Outlet[] = [];

  selectedOutlet: Outlet | null = null;

  selectedCategoryId: string = 'coffee';
  categories: MenuCategory[] = [];
  menuItems: MenuGroup[] = [];

  orderStatus = 'Pending';
  private destroy$ = new Subject<void>();

  memberInfo!: Member;

  currentCartId: string = '';

  phoneNumber: string = '';

  constructor(
    private router: Router,
    private storageHelper: StorageHelperService,
    private pageStateService: PageStateService,
    private toastHelper: ToastHelperService,
    private appService: AppService,
    private loadingHelper: LoadingHelperService,
    private menuApiService: MenuApiService,
    private userStateService: UserStateService,
    private cartApiService: CartAPiService,
    private outletApiService: OutletApiService,
  ) {}

  async ngOnInit() {
    this.loadingHelper.hide();
    this.updateOrderType();
    this.fetchCartData();

    const { categories, flatMenuItems } = await firstValueFrom(
      forkJoin({
        categories: this.menuApiService.userGetMenuCategoryList(),
        flatMenuItems: this.menuApiService.userGetMenuList(),
      }),
    );

    this.categories = categories;

    this.menuItems = categories.map((cat) => ({
      categoryName: cat.name,
      items: flatMenuItems.filter((item) => item.category === cat.name),
    }));

    if (this.menuItems.length > 0) {
      this.selectedCategoryId = this.menuItems[0].categoryName;
    }

    // console.log('✅ 分类:', this.categories);
    // console.log('✅ 菜单:', this.menuItems);

    this.pageStateService
      .onTriggerBackToOrderPage()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.updateOrderType();
        },
      });

    this.pageStateService
      .onTriggerOrderOutletSelectPage()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (outlet) => {
          console.log('selected outlet', outlet);

          if (this.selectedOutlet?.id !== outlet.id) {
            this.loadingHelper.show();
            //Call api get outlet menu and update user cart
            this.selectedOutlet = outlet;
            this.updateCartAddress(outlet).subscribe({
              next: () => {
                console.log('✅ Cart address updated');
                this.loadingHelper.hide();
                this.updateContentHeight();
              },
              error: (err) => {
                console.error('❌ Failed to update cart address', err);
                this.loadingHelper.hide();
              },
            });
          }
        },
      });

    this.pageStateService
      .onTriggerOderPageAddItemToCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (req: any) => {
          if (req.type === 'cart-updated' && req.cartId) {
            this.currentCartId = req.cartId; // ✅ 更新最新 cartId
          }

          this.fetchCartData(); // ✅ 重新获取 cart
        },
      });

    this.userStateService.memberInfo.pipe(take(1)).subscribe({
      next: (res) => {
        if (res) {
          this.memberInfo = res;
          this.phoneNumber = res.phoneNumber;
          this.fetchCartData();
        }
      },
    });

    // this.cartApiService
    //   .clearUserCartByPhone(this.phoneNumber)
    //   .pipe(take(1))
    //   .subscribe({
    //     next: (res) => {
    //       console.log('🛒Response:', res);
    //     },
    //     error: (err) => {
    //       console.error('❌ Failed to get cart:', err);
    //     },
    //   });
  }

  private fetchCartData() {
    this.cartApiService
      .getUserCartByPhone(this.phoneNumber)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          // ✅ 若 cart 是 null 或 undefined，手动造一个空对象
          if (!res) {
            console.warn('⚠️ Cart is null, assigning default values.');
            res = {
              id: 0,
              cartId: '',
              menuIdList: '',
              menuItemList: [],
              memberId: '',
              memberPhone: '',
              subTotal: 0,
              grandTotal: 0,
              paymentStatus: '',
              cartCreateTIme: '',
              cartUpdateTime: '',
              deliveryAddress: '',
              receiverName: '',
              merchantRestaurantAddress: '',
            };
          }

          this.currentCartId = res.cartId;

          // ✅ 统一获取 outlet 列表
          this.outletApiService
            .getAllOutlets()
            .pipe(take(1))
            .subscribe({
              next: (outlets) => {
                this.outlets = outlets;

                // ✅ 地址为空 → 自动找最近的 outlet
                if (!res.merchantRestaurantAddress || res.merchantRestaurantAddress.trim() === '') {
                  console.warn('⚠️ Cart address empty, finding nearest outlet...');
                  Geolocation.getCurrentPosition()
                    .then((position) => {
                      const userLat = position.coords.latitude;
                      const userLng = position.coords.longitude;
                      const nearestOutlet = this.findNearestOutlet(userLat, userLng);

                      if (nearestOutlet) {
                        this.selectedOutlet = nearestOutlet;
                        console.log('✅ Auto-selected nearest outlet:', nearestOutlet.name);
                      }

                      const totalQty = res.menuItemList.reduce((sum, item) => sum + item.qty, 0);
                      this.updateBadgeDisplay(totalQty);
                      this.updateContentHeight();
                    })
                    .catch((err) => {
                      console.error('❌ Geolocation error:', err);
                    });
                } else {
                  // ✅ 地址存在 → 还原成 selectedOutlet
                  const matchedOutlet = outlets.find(
                    (o) => o.address.trim() === res.merchantRestaurantAddress.trim(),
                  );

                  if (matchedOutlet) {
                    this.selectedOutlet = matchedOutlet;
                    console.log('✅ Restored outlet from cart:', matchedOutlet.name);
                  } else {
                    console.warn('⚠️ Cannot match cart address to outlet list');
                  }

                  const totalQty = res.menuItemList.reduce((sum, item) => sum + item.qty, 0);
                  this.updateBadgeDisplay(totalQty);
                  this.updateContentHeight();
                }

                console.log('✅ currentCartId set:', this.currentCartId);
              },
              error: (err) => {
                console.error('❌ Outlet list fetch failed:', err);
              },
            });
        },
        error: (err) => {
          console.error('❌ Failed to get cart:', err);
        },
      });
  }

  updateCartAddress(outlet: Outlet) {
    if (!this.memberInfo?.phoneNumber) {
      console.warn('No member info to update cart address');
      return of(null);
    }

    return this.cartApiService.getUserCartByPhone(this.phoneNumber).pipe(
      take(1),
      switchMap((cart) => {
        if (!cart) {
          console.warn('No cart found for member');
          return of(null);
        }

        const payload = {
          cartId: cart.cartId,
          menuItemList: JSON.stringify(cart.menuItemList || []),
          menuIdList: cart.menuIdList,
          merchantRestaurantAddress: outlet.address,
          deliveryAddress: 'test',
          receiverName: this.memberInfo?.name || '',
        };
        return this.cartApiService.editCart(payload).pipe(take(1));
      }),
    );
  }

  private updateBadgeDisplay(count: number) {
    if (!this.badgeElRef) return;

    const badgeEl = this.badgeElRef.nativeElement as HTMLElement;
    badgeEl.innerText = count >= 99 ? '99+' : count.toString();

    this.triggerCartBadgeAnimate = false;
    void badgeEl.offsetWidth;
    this.triggerCartBadgeAnimate = true;

    setTimeout(() => {
      this.triggerCartBadgeAnimate = false;
    }, 400);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      //Delay for correct rendering of view
      this.updateSectionOffsets();
    }, 300);
  }

  changeOrderType() {
    this.router.navigate(['start-order'], {
      queryParams: { [PageParamKey.BTOD]: '1' },
    });
  }

  changeOutletBranch() {
    this.router.navigate(['general/outlets'], {
      queryParams: { [PageParamKey.Order_Outlet_Select]: '1' },
    });
  }

  goToOrderSummary() {
    this.router.navigate(['order-summary'], {
      state: { outlet: this.selectedOutlet },
    });
  }
  // selectCategory(category: any) {
  //   this.scrollToMenuRightByCategoryId(category.id);
  //   this.scrollMenuLeftToCenter(category.id);
  //   this.selectedCategoryId = category.id;
  // }

  selectCategory(category: MenuCategory) {
    this.selectedCategoryId = category.name;
    this.scrollToMenuRightByCategoryName(category.name);
    this.scrollMenuLeftToCenter(category.name);
  }

  onContentScroll(event: Event) {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    const target = event.target as HTMLElement;
    this.scrollTimeout = setTimeout(() => {
      this.headerScrollEvent(target);
      this.menuListScrollEvent(target);
    }, 50);
  }

  updateSectionOffsets() {
    this.sectionTops = this.menuSections.map((ref) => ({
      id: ref.nativeElement.id,
      categoryId: ref.nativeElement.id,
      offsetTop: ref.nativeElement.offsetTop,
    }));
  }

  async addToCart(menuId: string, qty: number) {
    this.loadingHelper.show();
    //Call api to add to cart here
    await this.appService.delay(1000);

    this.loadingHelper.hide();
    this.toastHelper.presentSuccessToast('Add to cart successfully', 'top', 90000);

    const menuItem = this.menuItemsRef.find((ref) => ref.item.itemName === menuId)?.nativeEl;
    const cartButton = this.cartButtonRef.nativeElement;

    if (!menuItem || !cartButton) {
      //If not found element, just do increment
      this.incrementCartBadgeSmooth(qty);
      return;
    }

    this.addToCartAnimation(menuId, qty);
  }

  private async updateOrderType() {
    const orderType = (await this.storageHelper.getCurrentOrderPre()) as OrderTypePre;

    if (!orderType) {
      this.changeOrderType();
      return;
    }

    if (this.orderType === orderType) {
      return;
    }

    this.orderType = orderType;
    this.loadingHelper.show();
    //Api , re-render the page content
    setTimeout(() => {
      this.loadingHelper.hide();
      this.updateContentHeight();
    }, 1000);
  }

  /**
   * Update the content height of order info full detail section after changes in outlet branch or pickup location, and re-render page UI with new data if any change occurred due to API call response
   */
  private updateContentHeight() {
    //Set default value for order info full detail section's native element height to zero
    this.orderInfoFullDetailHeight = 0;

    //Obtain and set height in px after UI render is complete, fixed px for Animation transition
    setTimeout(() => {
      if (this.orderInfoFullDetail)
        this.orderInfoFullDetailHeight = this.orderInfoFullDetail.nativeElement.offsetHeight;
    }, 50);
  }

  private headerScrollEvent(target: HTMLElement) {
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 15;
    const scrollDifference = this.lastScrollTop - scrollTop;

    if (isAtBottom) {
      this.isScrolledBottom = true;
    } else if (scrollDifference > 15) {
      this.isScrolledBottom = false;
    } else if (scrollTop > 20) {
      this.isScrolledBottom = true;
    }
    this.lastScrollTop = scrollTop;
  }

  private menuListScrollEvent(target: HTMLElement) {
    const scrollTop = target.scrollTop;

    let currentCategory = this.sectionTops.find((section, idx) => {
      const next = this.sectionTops[idx + 1];
      if (next) {
        return scrollTop >= section.offsetTop - 50 && scrollTop < next.offsetTop - 50;
      }
      return scrollTop >= section.offsetTop - 50;
    });

    if (currentCategory && currentCategory.id !== this.selectedCategoryId) {
      this.selectedCategoryId = currentCategory.id;
      this.scrollMenuLeftToCenter(currentCategory.id);
    }
  }

  // private scrollToMenuRightByCategoryId(categoryId: string) {
  //   const section = this.menuSections.find((ref) => ref.nativeElement.id === categoryId);

  //   if (section && this.menuRightRef) {
  //     const menuRightEl = this.menuRightRef.nativeElement as HTMLElement;
  //     const sectionEl = section.nativeElement as HTMLElement;

  //     const menuRightTop = menuRightEl.getBoundingClientRect().top;
  //     const sectionTop = sectionEl.getBoundingClientRect().top;

  //     const scrollOffset = sectionTop - menuRightTop + menuRightEl.scrollTop;

  //     menuRightEl.scrollTo({
  //       top: scrollOffset,
  //       behavior: 'smooth',
  //     });
  //   }
  // }

  private scrollToMenuRightByCategoryName(categoryName: string) {
    const section = this.menuSections.find((ref) => ref.nativeElement.id === categoryName);

    if (section && this.menuRightRef) {
      const menuRightEl = this.menuRightRef.nativeElement as HTMLElement;
      const sectionEl = section.nativeElement as HTMLElement;

      const menuRightTop = menuRightEl.getBoundingClientRect().top;
      const sectionTop = sectionEl.getBoundingClientRect().top;

      const scrollOffset = sectionTop - menuRightTop + menuRightEl.scrollTop;

      menuRightEl.scrollTo({
        top: scrollOffset,
        behavior: 'smooth',
      });
    }
  }

  private scrollMenuLeftToCenter(categoryId: string) {
    if (!this.menuLeftRef || !this.categorySection) return;

    const menuLeftEl = this.menuLeftRef.nativeElement as HTMLElement;
    const targetItem = this.categorySection.find((ref) => ref.nativeElement.id === categoryId);
    if (targetItem) {
      const itemEl = targetItem.nativeElement as HTMLElement;

      const menuLeftRectTop = menuLeftEl.getBoundingClientRect().top;
      const menuLeftHeight = menuLeftEl.clientHeight;

      const itemRectTop = itemEl.getBoundingClientRect().top;
      const itemHeight = itemEl.clientHeight;

      const relativeItemCenter = itemRectTop - menuLeftRectTop + itemHeight / 2;

      const targetScrollTop = menuLeftEl.scrollTop + relativeItemCenter - menuLeftHeight / 2;

      menuLeftEl.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth',
      });
    }
  }

  private addToCartAnimation(menuId: string, qty: number) {
    const menuItem = this.menuItemsRef.find((ref) => ref.item.itemName === menuId)?.nativeEl;
    const cartButton = this.cartButtonRef.nativeElement;

    if (!menuItem || !cartButton) return;

    const menuRect = menuItem.getBoundingClientRect();
    const cartRect = cartButton.getBoundingClientRect();

    const itemData = this.menuItems
      .flatMap((category: any) => category.items)
      .find((item: any) => item.name === menuId);

    const imageUrl = itemData?.image || '';

    const flyImg = document.createElement('img');
    flyImg.src = imageUrl;
    flyImg.style.cssText = `
        position: fixed;
        left: ${menuRect.left + window.scrollX}px;
        top: ${menuRect.top + window.scrollY}px;
        width: ${menuRect.width - 10}px;
        height: ${menuRect.height - 20}px;
        border-radius: 50%;
        z-index: 9999;
        pointer-events: none;
        opacity: 1;
        transition: transform 1.1s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 1.1s ease-out;
      `;

    document.body.appendChild(flyImg);

    flyImg.onload = () => {
      // workaround for Android layout delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          flyImg.style.transform = `translate3d(${cartRect.left - menuRect.left}px, ${cartRect.top - menuRect.top}px, 0) scale(0.2)`;
          flyImg.style.opacity = '0.3';
        });
      });
    };

    flyImg.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'transform') {
        flyImg.remove();
        this.incrementCartBadgeSmooth(qty);
      }
    });

    // // fallback for devices not firing transitionend
    // setTimeout(() => {
    //   flyImg.remove();
    //   this.incrementCartBadgeSmooth();
    // }, 1300);
  }

  private async incrementCartBadgeSmooth(count: number) {
    if (!this.badgeElRef) return;

    const badgeEl = this.badgeElRef.nativeElement as HTMLElement;
    let currentCount = parseInt(badgeEl.innerText.replace(/\D/g, ''), 10) || 0;
    const targetCount = Math.min(currentCount + count, 99);

    if (currentCount >= 99) {
      badgeEl.innerText = '99+';
      return;
    }

    const step = 1;
    const delay = 30; // 30ms per increment

    while (currentCount < targetCount) {
      currentCount += step;
      badgeEl.innerText = currentCount.toString();

      this.triggerCartBadgeAnimate = false;
      void badgeEl.offsetWidth;
      this.triggerCartBadgeAnimate = true;

      await this.appService.delay(delay);
    }

    if (currentCount >= 99) {
      badgeEl.innerText = '99+';
    }
    await this.appService.delay(400);
    this.triggerCartBadgeAnimate = false;
  }

  findNearestOutlet(userLat: number, userLng: number): Outlet | null {
    if (!this.outlets || this.outlets.length === 0) return null;

    let nearest = this.outlets[0];
    let minDistance = DistanceCalculator.getDistanceInMeters(
      userLat,
      userLng,
      nearest.latitude,
      nearest.longitude,
    );

    for (const outlet of this.outlets) {
      const distance = DistanceCalculator.getDistanceInMeters(
        userLat,
        userLng,
        outlet.latitude,
        outlet.longitude,
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = outlet;
      }
    }

    return nearest;
  }
}
