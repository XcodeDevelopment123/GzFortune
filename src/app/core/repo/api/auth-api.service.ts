import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import {} from 'src/environments/environment';
import { map, switchMap, tap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AuthTokenResponse, RequestOTPResponse } from '../response/auth-response.model';
import { AuthService } from '../../services/auth.service';
import {
  LoginByEmailPasswordRequest,
  LoginByPhoneOtpRequest,
  PhoneRequestOTP,
  VerifyEmailOtpRequest,
} from '../request/auth-request.model';
import { UserStateService } from '../../services/user-state.service';
import { dtoToModel } from 'src/app/shared/utils/dto-to-model';
import { Member, memberMapper } from '../../models/member.model';
interface ApiResponse<T> {
  success: boolean;
  data: T;
}
interface MemberDto {
  Image?: string | null /* 其它后端字段 PascalCase */;
}

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private baseApi = inject(BaseApiService);
  private authService = inject(AuthService);
  private userStateService = inject(UserStateService);

  private ctrl: string = '/MemberLogin';
  private accCtrl: string = '/MemberAccount';
  private memberAuth: string = '/MemberAuth';

  getAccessToken(): Observable<string | null> {
    const username = 'admin';
    const password = 'kl4934A4!';
    return this.baseApi
      .post<AuthTokenResponse>(`/JWTToken/Post?UserName=${username}&Password=${password}`, null)
      .pipe(
        switchMap(async (res: AuthTokenResponse) => {
          if (res.SuccessToken) {
            await this.authService.setAccessToken(res.SuccessToken);
            return res.SuccessToken as string;
          }
          return null;
        }),
      );
  }

  loginByEmailAndPassword(req: LoginByEmailPasswordRequest): Observable<Member> {
    return this.baseApi.post(`${this.ctrl}/CheckEmailPassword`, req).pipe(
      map((res) => dtoToModel<Member, any>(res)), // <—— 传 data
      switchMap((m) =>
        from(
          this.userStateService.setKeepLoginRequest({
            PhoneNumber: m.phoneNumber,
            DeviceId: m.deviceId ?? '',
          }),
        ).pipe(map(() => m)),
      ),
      tap((m) => {
        this.authService.setAuthenticated(true);
        this.userStateService.updateMemberInfo(m);
      }),
    );
  }
  loginByPhoneNumberAndOtp(req: LoginByPhoneOtpRequest): Observable<Member> {
    return this.baseApi.post(`${this.ctrl}/MemberMobileLoginGetProfile`, req).pipe(
      map((res) => dtoToModel<Member, any>(res)),
      switchMap((res) => {
        return from(
          this.userStateService.setKeepLoginRequest({
            PhoneNumber: res.phoneNumber,
            DeviceId: res.deviceId!,
          }),
        ).pipe(map(() => res));
      }),
      tap((res) => {
        this.authService.setAuthenticated(true);
        this.userStateService.updateMemberInfo(res);
      }),
    );
  }

  requestWhatsappOtp() {}

  requestPhoneOTP(req: PhoneRequestOTP): Observable<any> {
    return this.baseApi.post<RequestOTPResponse>(`${this.accCtrl}/RequestOTP`, req).pipe(
      map((res) => {
        return res;
      }),
    );
  }

  requestLoginOTP(req: PhoneRequestOTP): Observable<RequestOTPResponse> {
    return this.baseApi.post<RequestOTPResponse>(`${this.memberAuth}/MemberLogin`, req);
  }

  // Register flow: request SMS OTP (no member created yet)
  requestRegisterOtpSms(req: PhoneRequestOTP): Observable<RequestOTPResponse> {
    return this.baseApi.post<RequestOTPResponse>(`${this.memberAuth}/RequestRegisterOtpSms`, req);
  }

  // Register flow: verify SMS OTP
  verifyRegisterOtp(req: VerifyEmailOtpRequest): Observable<any> {
    return this.baseApi.post<any>(`${this.memberAuth}/VerifyRegisterOtp`, req);
  }
  ResendOtpWithEmail(req: PhoneRequestOTP): Observable<RequestOTPResponse> {
    return this.baseApi.post<RequestOTPResponse>(`${this.memberAuth}/ResendOtpWithEmail`, req);
  }

  // 校验邮箱 OTP
  verifyLoginOtp(req: VerifyEmailOtpRequest): Observable<any> {
    return this.baseApi.post<any>(`${this.memberAuth}/VerifyLoginOtp`, req);
  }
}
