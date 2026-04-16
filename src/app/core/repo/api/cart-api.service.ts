import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { map, Observable } from 'rxjs';
import { AddCart, CartResponse, cartResponseMapper, EditCart } from '../../models/cart.model';
import { dtoToModel } from 'src/app/shared/utils/dto-to-model';

@Injectable({
  providedIn: 'root',
})
export class CartAPiService {
  private baseApi = inject(BaseApiService);

  private ctrl: string = '/MemberOrderCart';

  getUserCartByPhone(phone: string): Observable<CartResponse | null> {
    const body = { phone };

    return this.baseApi
      .post<string>(`${this.ctrl}/GetCartByPhone`, body, {
        responseType: 'text' as 'json', // 因为有时候返回是 'No Cart Found'
      })
      .pipe(
        map((res) => {
          if (!res || res.trim() === 'No Cart Found') return null;

          const parsed = typeof res === 'string' ? JSON.parse(res) : res;
          return dtoToModel<CartResponse, any>(parsed, cartResponseMapper);
        }),
      );
  }

  addToCart(payload: AddCart): Observable<string> {
    return this.baseApi.post<string>(`${this.ctrl}/AddToCart`, payload, {
      responseType: 'text' as 'json',
    });
  }

  editCart(payload: EditCart): Observable<string> {
    return this.baseApi.post<string>(`${this.ctrl}/RemoveAndEditCartItem`, payload, {
      responseType: 'text' as 'json',
    });
  }

  clearUserCartByPhone(phone: string): Observable<CartResponse> {
    const body = { phone: phone };
    return this.baseApi.post<CartResponse>(`${this.ctrl}/ClearCartByPhone`, body, {
      responseType: 'text' as 'json',
    });
  }
}
