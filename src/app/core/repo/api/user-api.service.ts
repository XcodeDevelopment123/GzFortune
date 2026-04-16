import { inject, Injectable, RESPONSE_INIT } from '@angular/core';
import { from, Observable } from 'rxjs';
import {} from 'src/environments/environment';
import { map, switchMap, tap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AuthService } from '../../services/auth.service';
import { RegisterMemberRequest } from '../request/auth-request.model';
import { UserStateService } from '../../services/user-state.service';
import { KeepLoginUserRequest } from '../request/user-request.model';
import { dtoToModel } from 'src/app/shared/utils/dto-to-model';
import { Member, MemberAddress, memberMapper } from '../../models/member.model';
import { MemberEditProfileRequest } from '../request/member-request.model';
import { Wallet, walletMapper } from '../../models/wallet.model';
import { RazorPayCreate } from '../../models/razorpay.model';
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

type MemberDto = {
  UserId: string;
  Name: string;
  Email: string;
  PhoneNumber: string;
  BirthDate: string;
  ReferralCode: string;
  ReferralBy: string;
  Tier: string;
  Image: string;
  FirstLogin: string;
  EmailSubcribe: string;
  NotificationStatus: string;
  AccountStatus: string;
  RegisterTime: string;
  DeviceId: string | null;
  WalletId: string;
  Balance: number;
  TotalTopupAmount: number;
  Point: number;
  CreateDate: string;
  ExpireDate: string;
  Status: string;
  PointBonus: number;
  TotalStamp: number;
};

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private baseApi = inject(BaseApiService);
  private authService = inject(AuthService);
  private userStateService = inject(UserStateService);

  private ctrl: string = '/MemberLogin';
  private memberAuth: string = '/MemberAuth';
  private accCtrl: string = '/MemberAccount';
  private detailCtrl: string = '/MemberDetails';
  private addressCtrl: string = '/ManageMemberAddress';
  private walletCtrl: string = '/MemberWallet';

  registerMember(req: RegisterMemberRequest): Observable<any> {
    // const formData = new FormData();

    // if (req.image) {
    //   formData.append('Image', req.image, req.image.name);
    // }

    // formData.append('Name', req.name);
    // formData.append('Email', req.email);
    // formData.append('PhoneNumber', req.phoneNumber);
    // formData.append('ReferralBy', req.referralBy ?? '');
    // formData.append('Password', req.password);
    // formData.append('Birthday', req.birthDate ?? '');

    // NOTE: register is handled by MemberAuth controller so server can enforce "OTP verified before create".
    return this.baseApi.post(`${this.memberAuth}/MemberRegister`, req).pipe(
      map((res) => dtoToModel<Member, any>(res)),
      switchMap((res) => {
        const member = dtoToModel<Member, any>(res);

        return from(
          this.userStateService.setKeepLoginRequest({
            PhoneNumber: member.phoneNumber,
            DeviceId: member.deviceId!,
          }),
        ).pipe(map(() => res));
      }),
      tap((res) => {
        this.authService.setAuthenticated(true);
        this.userStateService.updateMemberInfo(res);
      }),
    );
  }

  getMemberDetails(req: KeepLoginUserRequest) {
    return this.baseApi
      .post<ApiResponse<MemberDto>>(`${this.detailCtrl}/GetMemberDetails`, req)
      .pipe(
        map((res) => dtoToModel<Member, MemberDto>(res.data, memberMapper)), // ✅ 先取 data
        tap((m) => this.userStateService.updateMemberInfo(m)),
      );
  }

  editProfile(req: MemberEditProfileRequest): Observable<any> {
    return this.baseApi.post(`${this.accCtrl}/MemberEditProfile`, req).pipe(
      map((res) => dtoToModel<Member, any>(res, memberMapper)),
      tap((res) => {
        console.log(res);
        this.userStateService.updateMemberInfo(res);
      }),
    );
  }

  resetPassword(phoneNumber: string, newPassword: string): Observable<any> {
    const body = {
      PhoneNumber: phoneNumber,
      NewPassword: newPassword,
    };

    return this.baseApi.post<any>(`${this.accCtrl}/MemberResetPassword`, body);
  }

  getWalletDetails(phoneNumber: string): Observable<Wallet> {
    const req = { PhoneNumber: phoneNumber };
    return this.baseApi.post<Wallet>(`${this.walletCtrl}/MemberGetWalletDetails`, req).pipe(
      map((res) => dtoToModel(res, walletMapper)),
      tap((wallet) => this.userStateService.updateWalletInfo(wallet)),
    );
  }

  memberSpend(body: RazorPayCreate): Observable<string> {
    return this.baseApi.post(`${this.walletCtrl}/MemberSpendWallet`, body, {
      responseType: 'text' as 'json',
    });
  }

  getAllMemberAddress(phoneNumber: string): Observable<MemberAddress[]> {
    const req = { PhoneNumber: phoneNumber };
    return this.baseApi
      .post<string>(`${this.addressCtrl}/GetAllMemberAddress`, req, {
        responseType: 'text' as 'json',
      })
      .pipe(
        map((res) => {
          if (!res || res.trim() === 'Havent add any address') {
            return [];
          }
          try {
            var jsonObj = JSON.parse(res);
            return jsonObj;
          } catch {
            return [];
          }
        }),
        map((list) => list.map((item: any) => dtoToModel(item))),
      );
  }

  updateAccountStatusDeactivate(phoneNumber: string): Observable<void> {
    const req = { PhoneNumber: phoneNumber };

    return this.baseApi
      .post(
        `${this.accCtrl}/UpdateAccountStatusDeactive`,
        req,
        { responseType: 'text' as 'json' }, // <-- 加这一句！！
      )
      .pipe(map(() => void 0));
  }
}
