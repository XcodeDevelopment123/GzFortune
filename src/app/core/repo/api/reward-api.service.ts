import { inject, Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { Observable } from 'rxjs';
import { Reward, rewardMapper } from '../../models/reward.model';
import { dtoToModel } from 'src/app/shared/utils/dto-to-model';
import { map, tap } from 'rxjs/operators';
import { Voucher, voucherMapper } from '../../models/voucher.model';

@Injectable({ providedIn: 'root' })
export class RewardApiService {
  private baseApi = inject(BaseApiService);

  private ctrl: string = '/MemberReward';
  private ctrl2: string = '/MemberVoucher';

  userGetReward(): Observable<Reward[]> {
    return this.baseApi
      .get<any[]>(`${this.ctrl}/GetRewards`)
      .pipe(map((list) => list.map((dto) => dtoToModel<Reward, any>(dto, rewardMapper))));
  }

  userGetRewardById(rewardId: string): Observable<Reward> {
    const body = { RewardId: rewardId };
    return this.baseApi
      .post<any>(`${this.ctrl}/FindReward`, body)
      .pipe(
        tap((dto) => console.log('Raw FindReward DTO:', dto)), // 添加这一行来查看原始数据
        map((dto) => dtoToModel<Reward, any>(dto, rewardMapper))
      );
  }

  userGetVoucherByPhone(phoneNumber: string, contactId?: number): Observable<Voucher[]> {
    const body = { PhoneNumber: phoneNumber, ContactId: contactId };

    return this.baseApi
      .post<Voucher[]>(`${this.ctrl2}/GetVoucherByPhone`, body)
      .pipe(map((list) => list.map((dto) => dtoToModel<Voucher, any>(dto, voucherMapper))));
  }


  getAllVoucher(): Observable<Voucher[]> {
    return this.baseApi
      .get<Voucher[]>(`${this.ctrl2}/GetAllVoucher`)
      .pipe(map((list) => list.map((dto) => dtoToModel<Voucher, any>(dto, voucherMapper))));
  }

  RedeemVoucher(RewardId: string, PhoneNumber: string, ContactId?: number): Observable<any> {
    const body = {
      RewardId,
      PhoneNumber,
      ContactId,
    };

    return this.baseApi.post(`${this.ctrl}/RedeemReward`, body, {
      responseType: 'text' as 'json',
    });
  }
}
