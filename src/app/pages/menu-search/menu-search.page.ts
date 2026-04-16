import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import {
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  Subject,
  Subscription,
  take,
} from 'rxjs';
import { Member } from 'src/app/core/models/member.model';
import { Menu, MenuCategory, MenuGroup } from 'src/app/core/models/menu.model';
import { CartAPiService } from 'src/app/core/repo/api/cart-api.service';
import { MenuApiService } from 'src/app/core/repo/api/menu-api.service';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-menu-search',
  templateUrl: './menu-search.page.html',
  styleUrls: ['./menu-search.page.scss'],
  standalone: false,
})
export class MenuSearchPage implements OnInit, OnDestroy {
  private searchSubject = new Subject<string>();
  searchQuery: string = '';
  searchResults: any[] = [];
  searchSub!: Subscription;

  categories: MenuCategory[] = [];
  flatMenuItems: Menu[] = [];

  menuItems: MenuGroup[] = [];

  skeletonArray = new Array(4);

  loading: boolean = false;
  noResultFound: boolean = false;

  currentCartId: string = '';
  memberInfo!: Member;

  constructor(
    private navCtrl: NavController,
    private menuApiService: MenuApiService,
    private cartApiService: CartAPiService,
    private userStateService: UserStateService,
  ) {}

  async ngOnInit() {
    await this.loadCurrentCartId();

    this.searchSub = this.searchSubject
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe((query) => {
        this.performSearch(query);
      });

    await this.loadMenuData();
  }

  async loadCurrentCartId() {
    try {
      const memberInfo = await firstValueFrom(this.userStateService.memberInfo.pipe(take(1)));

      if (memberInfo) {
        this.memberInfo = memberInfo;
        const phone = memberInfo.phoneNumber;

        const cartData = await firstValueFrom(this.cartApiService.getUserCartByPhone(phone));
        this.currentCartId = cartData?.cartId || '';

        console.log('✅ Refreshed currentCartId:', this.currentCartId);
      }
    } catch (err) {
      console.error('❌ 获取 CartId 失败', err);
    }
  }

  async loadMenuData() {
    try {
      const [categories, flatMenuItems] = await Promise.all([
        this.menuApiService.userGetMenuCategoryList().toPromise() as Promise<MenuCategory[]>,
        this.menuApiService.userGetMenuList().toPromise() as Promise<Menu[]>,
      ]);

      this.categories = categories;
      this.flatMenuItems = flatMenuItems;

      // console.log('✅ Categories:', categories);
      // console.log('✅ Flat Menu Items:', flatMenuItems);

      this.menuItems = categories.map((cat) => ({
        categoryName: cat.name,
        items: flatMenuItems.filter((item) => item.category === cat.name),
      }));
    } catch (err) {
      console.error('❌ 加载菜单失败:', err);
    }
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onSearchChange(event: any) {
    if (this.searchQuery.trim() === '') {
      this.noResultFound = false;
      this.searchResults = [];
      this.loading = false;
      return;
    }

    this.searchSubject.next(this.searchQuery.trim().toLowerCase());
  }

  performSearch(query: string) {
    this.noResultFound = false;
    if (!query) {
      this.searchResults = [];
      this.loading = false;
      return;
    }

    this.loading = true;

    // 模拟API Call，500ms延迟
    setTimeout(() => {
      this.searchResults = this.flatMenuItems.filter(
        (item) =>
          item.itemName.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query),
      );

      this.noResultFound = this.searchResults.length === 0;
      this.loading = false;
    }, 1000);
  }

  goToMenuDetail(item: any) {
    this.navCtrl.navigateForward(`/menu-details/${item.menuId}`);
  }
}
