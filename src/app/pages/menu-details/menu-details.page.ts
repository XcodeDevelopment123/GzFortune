import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { combineLatest, firstValueFrom, forkJoin, Observable, take } from 'rxjs';
import { AppService } from 'src/app/shared/services/app.service';
import { LoadingHelperService } from 'src/app/shared/services/loading-helper.service';
import { PageStateService } from 'src/app/shared/services/page-state.service';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';
import { MenuApiService } from 'src/app/core/repo/api/menu-api.service';
import { Menu } from 'src/app/core/models/menu.model';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { Member } from 'src/app/core/models/member.model';
import { AddCart, CartMenuItem } from 'src/app/core/models/cart.model';
import { CartAPiService } from 'src/app/core/repo/api/cart-api.service';
import { PageParamKey } from 'src/app/shared/statics/interface-helper';
import { GeneralTextareaComponent } from 'src/app/shared/input-components/general-textarea/general-textarea.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { StateSessionService } from 'src/app/shared/services/state-session.service';

@Component({
  selector: 'app-menu-details',
  templateUrl: './menu-details.page.html',
  styleUrls: ['./menu-details.page.scss'],
  standalone: false,
})
export class MenuDetailsPage implements OnInit {
  @ViewChild('detailContainer', { static: false })
  detailContainerRef!: ElementRef;
  @ViewChildren('variationRefs') variationRefs!: QueryList<ElementRef>;
  @ViewChild(GeneralTextareaComponent, { static: false })
  remarkTextarea!: GeneralTextareaComponent;

  isEditMode: boolean = false;
  cartItemId: string = '';

  isFavorite: boolean = false;
  menuId: string = '';
  menuUnitPrice: number = 0;
  selectedSize: string = 'regular';
  quantity: number = 1;

  menuDetail: Menu | null = null;

  memberInfo!: Member;
  cartId: string = '';
  public remark: string = '';

  OutletAddress: string = '';
  merchantRestaurantAddress: string = '';
  phoneNumber: string = '';
  favLoading = false;

  // 用户当前的选择
  variationSelections: { [key: string]: any } = {};
  variationValidationErrors: { [key: string]: boolean } = {};

  constructor(
    private pageStateService: PageStateService,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private toastHelper: ToastHelperService,
    private loadingHelper: LoadingHelperService,
    private appService: AppService,
    private menuApiService: MenuApiService,
    private userStateService: UserStateService,
    private cartApiService: CartAPiService,
    private auth: AuthService,
    private router: Router,
    private stateSession: StateSessionService,
  ) {
    // this.variationSelections = {
    //   size: 'large',
    //   sugar: 'less',
    //   addons: ['pearls', 'oatmilk'],
    // };
  }

  async ngOnInit() {
    try {
      const [params, query] = await firstValueFrom(
        combineLatest([this.route.paramMap.pipe(take(1)), this.route.queryParamMap.pipe(take(1))]),
      );

      this.menuId = params.get('id') || '';
      this.cartItemId = query.get(PageParamKey.Cart_Item_Id) || '';
      this.cartId = query.get('cartId') || '';
      this.quantity = Number(query.get(PageParamKey.Quantity)) || 1;
      this.isEditMode = query.get(PageParamKey.Edit) === 'true';
      this.remark = query.get(PageParamKey.Remark) || '';
      this.OutletAddress = query.get('outletAddress') || '';

      console.log('📦 current outlet address', this.OutletAddress);

      if (!this.menuId) {
        console.warn('⚠️ No menu ID found');
        return;
      }

      const memberInfo = await firstValueFrom(this.userStateService.memberInfo.pipe(take(1))).catch(
        () => null,
      );

      if (memberInfo) {
        this.memberInfo = memberInfo;
        this.phoneNumber = memberInfo.phoneNumber;
      }

      const isAuth = await firstValueFrom(this.auth.isAuthenticated$.pipe(take(1))).catch(
        () => false,
      );

      const apiCalls: Observable<any>[] = [this.menuApiService.getMenu(this.menuId).pipe(take(1))];

      if (isAuth && this.phoneNumber) {
        apiCalls.push(this.menuApiService.getAllFavouriteItems(this.phoneNumber).pipe(take(1)));
      }

      const results = await firstValueFrom(forkJoin(apiCalls));

      const menuDetail = results[0];
      if (menuDetail) {
        this.menuDetail = menuDetail;
        this.menuUnitPrice = menuDetail.price || 0;
      } else {
        console.error('❌ Menu detail not found');
        return;
      }

      if (isAuth && this.phoneNumber && results.length > 1) {
        const favList = results[1] as any[];
        const matchedFavoriteItem = (favList || []).find((item) => {
          const itemMenuId = String(item.MenuId || item.menuId || item.id);
          const currentMenuId = String(this.menuId);
          const isMatch = itemMenuId === currentMenuId;

          if (isMatch) {
            console.log('✅ Found matching menu item:', {
              MenuId: item.MenuId,
              ItemName: item.ItemName,
              IsFarvourite: item.IsFarvourite || item.IsFavourite,
              fullData: item,
            });
          }
          return isMatch;
        });

        if (matchedFavoriteItem) {
          this.isFavorite =
            matchedFavoriteItem.IsFarvourite === true || matchedFavoriteItem.IsFavourite === true;
        } else {
          this.isFavorite = false;
        }

        console.log('Final isFavorite result:', this.isFavorite);
      } else {
        this.isFavorite = false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize component:', error);
    }
  }

  async favorite() {
    try {
      const isAuth = await firstValueFrom(this.auth.isAuthenticated$.pipe(take(1)));

      if (!isAuth) {
        this.stateSession.setReturnUrl('/order');
        await this.router.navigate(['/auth/login']);
        return;
      }

      this.toggleFavorite();
    } catch (error) {
      console.error('❌ Failed to check authentication:', error);
    }
  }

  private toggleFavorite() {
    if (this.favLoading || !this.phoneNumber || !this.menuId) {
      console.warn('⚠️ Cannot toggle favorite:', {
        favLoading: this.favLoading,
        phoneNumber: this.phoneNumber,
        menuId: this.menuId,
      });
      return;
    }

    const nextFavoriteState = !this.isFavorite;

    this.isFavorite = nextFavoriteState;
    this.favLoading = true;

    const apiCall$ = nextFavoriteState
      ? this.menuApiService.addFavouriteItem(this.phoneNumber, this.menuId)
      : this.menuApiService.removeFavouriteItem(this.phoneNumber, this.menuId);

    apiCall$.pipe(take(1)).subscribe({
      next: () => {
        const message = nextFavoriteState
          ? 'Add to favorite successfully'
          : 'Remove from favorite successfully';
        this.toastHelper.presentSuccessToast(message, 'top', 1800);

        if (this.phoneNumber) {
          this.menuApiService
            .getAllFavouriteItems(this.phoneNumber)
            .pipe(take(1))
            .subscribe({
              next: (updatedFavList) => {
                console.log('🔄 Updated favorite list after action:', {
                  menuId: this.menuId,
                  updatedList: updatedFavList,
                  menuDetails: (updatedFavList || []).map((item) => ({
                    MenuId: item.menuId,
                    ItemName: item.itemName,
                    IsFarvourite: item.isFarvourite,
                  })),
                });

                const updatedMatchedItem = (updatedFavList || []).find(
                  (item) => String(item.menuId || item.menuId || item.id) === String(this.menuId),
                );

                if (updatedMatchedItem) {
                  const updatedFavoriteStatus = updatedMatchedItem.isFarvourite === true;
                  console.log('✅ Updated favorite status verification:', {
                    found: true,
                    IsFarvourite: updatedMatchedItem.isFarvourite,
                    IsFavourite: updatedMatchedItem.isFarvourite,
                    calculatedStatus: updatedFavoriteStatus,
                    currentComponentStatus: this.isFavorite,
                    statusMatch: updatedFavoriteStatus === this.isFavorite,
                  });
                }
              },
              error: (err) => console.error('❌ Failed to fetch updated favorite list:', err),
            });
        }

        console.groupEnd();
      },
      error: (err) => {
        this.isFavorite = !nextFavoriteState;

        console.error('❌ API Error:', {
          action: nextFavoriteState ? 'ADD' : 'REMOVE',
          menuId: this.menuId,
          error: err,
          rolledBackState: this.isFavorite,
        });
        console.groupEnd();

        this.toastHelper.presentFailedToast?.(
          'Failed to update favorite. Please try again.',
          'top',
          2200,
        );
      },
      complete: () => {
        this.favLoading = false;
      },
    });
  }
  async addToCart() {
    // console.log('📦 Using cartId:', this.cartId);

    // var validate = await this.validateAndScroll();

    // if (!validate) {
    //   console.log('Please complete all required selections.');
    //   return;
    // }

    if (!this.menuDetail || !this.memberInfo) {
      console.warn('Missing menu or member info');
      await this.router.navigate(['/auth/login'], {
        queryParams: { redirect: this.router.url },
      });
      return;
    }
    this.remark = this.remarkTextarea?.value || '';

    const menuItem = {
      MenuId: this.menuDetail.menuId,
      MenuUnitPrice: String(this.menuDetail.price),
      Image: this.menuDetail.image,
      Title: this.menuDetail.itemName,
      Qty: String(this.quantity),
      ProductId: '',
      AddOns: '',
      AddOnsTotalPrice: '0',
      Remark: this.remark || '',
    };

    const payload: AddCart = {
      cartId: this.cartId,
      menuIdList: this.menuDetail.menuId,
      menuItemList: JSON.stringify([menuItem]),
      memberId: this.memberInfo.userId,
      memberPhone: this.memberInfo.phoneNumber,
      subTotal: 0,
      grandTotal: 0,
      deliveryAddress: 'test',
      merchantRestaurantAddress: this.OutletAddress,
    };

    this.cartApiService
      .addToCart(payload)
      .pipe(take(1))
      .subscribe({
        next: (cartId) => {
          console.log('✅ Added to cart. Cart ID:', cartId);
          this.toastHelper.presentSuccessToast('Item added to cart!');
          this.pageStateService.triggerOderPageAddItemToCart({
            type: 'cart-updated',
            from: 'menu-details',
            menuId: this.menuId,
          });
          this.navCtrl.back();
        },
        error: (err) => {
          console.error('❌ Add to cart failed:', err);
          this.toastHelper.presentFailedToast('Add to cart failed');
        },
      });
  }

  async saveToCart() {
    // var validate = await this.validateAndScroll();

    // if (!validate) {
    //   console.log('Please complete all required selections.');
    //   return;
    // }

    //Api update cart item
    this.loadingHelper.show();

    this.remark = this.remarkTextarea?.value || '';

    this.cartApiService
      .getUserCartByPhone(this.memberInfo.phoneNumber)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          const cartData = typeof res === 'string' ? JSON.parse(res) : res;
          const currentCartItems: CartMenuItem[] = cartData.menuItemList || [];

          const mergedItems = this.mergeCartItemsByMenuId(currentCartItems);

          const updatedItems = mergedItems.map((item) => {
            if (item.menuId === this.menuDetail?.menuId) {
              return {
                ...item,
                qty: this.quantity,
                remark: this.remark || '',
                addOns: '',
              };
            }
            return item;
          });

          const payload = {
            cartId: this.cartItemId,
            menuItemList: JSON.stringify(updatedItems),
            menuIdList: this.menuDetail?.menuId || '',
            merchantRestaurantAddress: this.OutletAddress,
            deliveryAddress: 'test',
            receiverName: this.memberInfo?.name || '',
          };

          this.cartApiService
            .editCart(payload)
            .pipe(take(1))
            .subscribe({
              next: () => {
                setTimeout(() => {
                  this.toastHelper.presentSuccessToast('Cart updated successfully');
                  this.pageStateService.triggerEditOrderSummary();
                }, 1000);
                this.navCtrl.back();
              },
              error: (err) => {
                console.error('❌ Failed to update cart item', err);
                this.toastHelper.presentFailedToast('Failed to update cart');
              },
            });
        },
      });
  }

  private mergeCartItemsByMenuId(cartItems: CartMenuItem[]): CartMenuItem[] {
    const mergedMap = new Map<string, CartMenuItem>();

    cartItems.forEach((item) => {
      const existing = mergedMap.get(item.menuId);
      if (existing) {
        existing.qty += item.qty;
      } else {
        mergedMap.set(item.menuId, { ...item });
      }
    });

    return Array.from(mergedMap.values());
  }

  increaseQty() {
    this.quantity++;
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // selectSingle(key: string, value: any) {
  //   this.variationSelections[key] = value;
  // }

  // toggleMultiSelect(key: string, value: any) {
  //   if (!this.variationSelections[key]) {
  //     this.variationSelections[key] = [];
  //   }
  //   const idx = this.variationSelections[key].indexOf(value);
  //   if (idx > -1) {
  //     this.variationSelections[key].splice(idx, 1);
  //   } else {
  //     this.variationSelections[key].push(value);
  //   }
  // }

  // async validateAndScroll(): Promise<boolean> {
  //   const valid = this.validateVariations();

  //   if (!valid) {
  //     const firstInvalidKey = Object.keys(this.variationValidationErrors)[0];
  //     if (firstInvalidKey) {
  //       this.scrollToVariation(firstInvalidKey);
  //     }
  //   }

  //   return valid;
  // }

  get calculatedPrice(): number {
    let extraPrice = 0;

    // for (const variation of this.variationOptions) {
    //   const selected = this.variationSelections[variation.key];

    //   if (variation.type === 'single' && selected) {
    //     const selectedOption = variation.options.find((opt) => opt.value === selected);
    //     if (selectedOption) {
    //       extraPrice += selectedOption.priceChange || 0;
    //     }
    //   }

    //   if (variation.type === 'multi' && Array.isArray(selected)) {
    //     for (const value of selected) {
    //       const selectedOption = variation.options.find((opt) => opt.value === value);
    //       if (selectedOption) {
    //         extraPrice += selectedOption.priceChange || 0;
    //       }
    //     }
    //   }
    // }

    return (this.menuUnitPrice + extraPrice) * this.quantity;
  }

  // private scrollToVariation(key: string) {
  //   const cardContent = this.detailContainerRef.nativeElement as HTMLElement;

  //   const targetRef = this.variationRefs.find(
  //     (ref) => ref.nativeElement.getAttribute('data-key') === key,
  //   );

  //   if (cardContent && targetRef) {
  //     const target = targetRef.nativeElement;
  //     const cardContentTop = cardContent.getBoundingClientRect().top;
  //     const targetTop = target.getBoundingClientRect().top;

  //     const offset = targetTop - cardContentTop - 120;

  //     cardContent.scrollTo({
  //       top: cardContent.scrollTop + offset,
  //       behavior: 'smooth',
  //     });

  //     target.classList.add('highlight');

  //     setTimeout(() => {
  //       target.classList.remove('highlight');
  //     }, 1500);
  //   }
  // }

  // private validateVariations(): boolean {
  //   let isValid = true;
  //   this.variationValidationErrors = {};
  //   for (const variation of this.variationOptions) {
  //     const selected = this.variationSelections[variation.key];
  //     if (variation.required) {
  //       if (
  //         (variation.type === 'single' && !selected) ||
  //         (variation.type === 'multi' && (!selected || selected.length === 0))
  //       ) {
  //         this.variationValidationErrors[variation.key] = true;
  //         isValid = false;
  //       }
  //     }
  //   }

  //   return isValid;
  // }
}
