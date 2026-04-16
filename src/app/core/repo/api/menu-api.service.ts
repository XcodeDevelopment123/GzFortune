import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { map, Observable } from 'rxjs';
import { Menu, menuMapper, MenuCategory, menuCategoryMapper } from '../../models/menu.model';
import { dtoToModel } from 'src/app/shared/utils/dto-to-model';

@Injectable({ providedIn: 'root' })
export class MenuApiService {
  private baseApi = inject(BaseApiService);
  private ctrl: string = '/ManageMenu';
  private ctrl2: string = '/ManageCategory';
  private favoriteCtrl: string = '/ManageFavourite';

  userGetMenuList(): Observable<Menu[]> {
    return this.baseApi
      .get<Menu[]>(`${this.ctrl}/GetMenuList`)
      .pipe(map((res) => res.map((dto) => dtoToModel<Menu, any>(dto, menuMapper))));
  }

  userGetMenuCategoryList(): Observable<MenuCategory[]> {
    return this.baseApi
      .get<MenuCategory[]>(`${this.ctrl2}/GetCategoryList`)
      .pipe(map((res) => res.map((dto) => dtoToModel<MenuCategory, any>(dto, menuCategoryMapper))));
  }

  getMenu(menuId: string): Observable<Menu> {
    const body = { MenuId: menuId };
    return this.baseApi
      .post<Menu>(`${this.ctrl}/FindMenu`, body)
      .pipe(map((dto) => dtoToModel<Menu, any>(dto, menuMapper)));
  }

  addFavouriteItem(phoneNumber: string, menuId: string): Observable<string> {
    const req = { PhoneNumber: phoneNumber, MenuId: menuId };
    return this.baseApi.post(`${this.favoriteCtrl}/AddFavourite`, req, {
      responseType: 'text' as 'json',
    });
  }

  removeFavouriteItem(phoneNumber: string, menuId: string): Observable<string> {
    const req = { PhoneNumber: phoneNumber, MenuId: menuId };
    return this.baseApi.post(`${this.favoriteCtrl}/DeleteFavourite`, req, {
      responseType: 'text' as 'json',
    });
  }

  getAllFavouriteItems(phoneNumber: string): Observable<Menu[]> {
    const req = { PhoneNumber: phoneNumber };
    return this.baseApi.post<Menu[]>(`${this.favoriteCtrl}/GetMenu`, req);
  }
}
