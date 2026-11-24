import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonInput, NavController } from '@ionic/angular';
import { take } from 'rxjs';
import { AuthApiService } from 'src/app/core/repo/api/auth-api.service';
import { UserApiService } from 'src/app/core/repo/api/user-api.service';
import {
  LoginByPhoneOtpRequest,
  PhoneRequestOTP, OTP_CHANNEL, OtpDeliveryChannel } from 'src/app/core/repo/request/auth-request.model';
import {
  RequestOTPResponse,
  ResetPasswordOtpSessionData,
} from 'src/app/core/repo/response/auth-response.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoadingHelperService } from 'src/app/shared/services/loading-helper.service';
import { StateSessionService } from 'src/app/shared/services/state-session.service';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';
import { VerifyOtpKey, VerifyOTPPageType } from 'src/app/shared/statics/interface-helper';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { environment } from 'src/environments/environment';
import { StringHelperService } from 'src/app/shared/services/string-helper.service';

@Component({
  selector: 'app-otp-verify',
  templateUrl: './otp-verify.page.html',
  styleUrls: ['./otp-verify.page.scss'],
  standalone: false,
})
export class OtpVerifyPage implements OnInit {
  @ViewChild('otpInput', { static: true }) otpInput!: IonInput;

  private verifyType!: VerifyOTPPageType;
  private verifyOtpRes: RequestOTPResponse | null = null;
  // Register flow: keep the pending register request until OTP verified
  private registerRequest: any | null = null;
  /** Single-use proof from VerifyRegisterOtp; kept only to retry an unconfirmed registration. */
  private registrationProof: string | null = null;

  otpLength = 6;
  otpDigits: string[] = new Array(this.otpLength).fill('');
  currentIndex = 0;

  otpCode = '';
  /**
   * Channel of the last SUCCESSFUL OTP delivery. The first login code goes by SMS; a successful e-mail resend
   * switches to Email, a successful SMS resend back to SMS; a failed resend leaves it unchanged.
   */
  otpChannel: OtpDeliveryChannel = OTP_CHANNEL.SMS;
  isFirstTry = true;

  // 新增：就地重置密码
  isVerified = false;
  newPassword = '';
  confirmPassword = '';

  phonenumber = '';

  redirectUrl = '/home';

  smsResendCooldown = 0;
  emailResendCooldown = 0;

  private smsResendIntervalId: any = null;
  private emailResendIntervalId: any = null;

  constructor(
    private stateSession: StateSessionService,
    private route: ActivatedRoute,
    private loadingHelper: LoadingHelperService,
    private authApiService: AuthApiService,
    private toastHelper: ToastHelperService,
    private navCtrl: NavController,
    private authService: AuthService,
    private userApiService: UserApiService,
    private userstateService: UserStateService,
    private stringHelper: StringHelperService,
  ) {}

  // 展示“已发送到”的掩码目标（后端返回）
  get maskedDestination(): string | null {
    const r = this.verifyOtpRes;
    if (!r) return null;
    return (r as any).Destination ?? (r as any).destination ?? null;
  }

  get isRegisterFlow(): boolean {
    return this.verifyType === 'register';
  }

  get canResendEmail(): boolean {
    // Register flow is SMS-only for now
    return !this.isRegisterFlow;
  }

  ngOnInit() {
    this.updateOtpDigits();
    this.verifyType = (this.route.snapshot.paramMap.get('type') as VerifyOTPPageType) || '';

    if (this.verifyType === 'forgot-password') {
      const data = this.stateSession.getData<RequestOTPResponse>(VerifyOtpKey.FORGOT_PASS);
      this.verifyOtpRes = data ?? null;
    } else if (this.verifyType === 'reset-password') {
      const data = this.stateSession.getData<ResetPasswordOtpSessionData>(
        VerifyOtpKey.RESET_PASSWORD,
      );
      this.verifyOtpRes = data?.otpData ?? null;
      this.newPassword = data?.newPassword ?? '';
    } else if (this.verifyType === 'login-phone') {
      const data = this.stateSession.getData<RequestOTPResponse>(VerifyOtpKey.LOGIN_PHONE);
      this.verifyOtpRes = data ?? null;
    } else if (this.verifyType === 'register') {
      const data = this.stateSession.getData<any>(VerifyOtpKey.REGISTER);
      this.verifyOtpRes = data?.otpData ?? null;
      this.registerRequest = data?.registerRequest ?? null;
    }
    this.phonenumber = this.verifyOtpRes?.PhoneNumber || '';
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirect') || '/home';
  }
  ngOnDestroy() {
    if (this.smsResendIntervalId) clearInterval(this.smsResendIntervalId);
    if (this.emailResendIntervalId) clearInterval(this.emailResendIntervalId);
  }

  private startSmsResendCooldown(seconds: number = 180) {
    if (this.smsResendIntervalId) clearInterval(this.smsResendIntervalId);

    this.smsResendCooldown = seconds;
    this.smsResendIntervalId = setInterval(() => {
      this.smsResendCooldown--;
      if (this.smsResendCooldown <= 0) {
        this.smsResendCooldown = 0;
        clearInterval(this.smsResendIntervalId);
        this.smsResendIntervalId = null;
      }
    }, 1000);
  }

  private startEmailResendCooldown(seconds: number = 180) {
    if (this.emailResendIntervalId) clearInterval(this.emailResendIntervalId);

    this.emailResendCooldown = seconds;
    this.emailResendIntervalId = setInterval(() => {
      this.emailResendCooldown--;
      if (this.emailResendCooldown <= 0) {
        this.emailResendCooldown = 0;
        clearInterval(this.emailResendIntervalId);
        this.emailResendIntervalId = null;
      }
    }, 1000);
  }

  focusInput() {
    this.otpInput.setFocus();
  }

  onOtpInput(event: any) {
    const rawValue = (event.data || event.target.value || '')
      .replace(/\D/g, '')
      .slice(0, this.otpLength);
    const chars = rawValue.split('');
    this.otpDigits = new Array(this.otpLength).fill('');
    for (let i = 0; i < chars.length; i++) this.otpDigits[i] = chars[i];

    this.currentIndex = chars.length;
    this.otpCode = chars.join('');
    this.otpInput.value = this.otpCode;
    if (chars.length === this.otpLength && this.isFirstTry) {
      this.onComplete();
      this.isFirstTry = false;
    }
  }

  updateOtpDigits() {
    this.otpDigits = new Array(this.otpLength).fill('');
    this.currentIndex = 0;
    this.otpCode = '';
    this.otpInput.value = '';
  }

  resendOtp() {
    if (this.isVerified) return;
    if (this.smsResendCooldown > 0) return; // ✅ SMS 冷却

    switch (this.verifyType) {
      case 'forgot-password':
      case 'reset-password':
      case 'login-phone':
      case 'register':
        this.handleResendOtpByPhone();
        break;
    }
  }

  resendOtpWithEmail() {
    if (this.isVerified) return;
    if (this.emailResendCooldown > 0) return; // ✅ Email 冷却

    switch (this.verifyType) {
      case 'forgot-password':
      case 'reset-password':
      case 'login-phone':
        this.handleResendOtpByEmail();
        break;
    }
  }

  onComplete() {
    if (this.otpCode.length !== this.otpLength) return;

    switch (this.verifyType) {
      case 'login-phone':
        this.handleLoginByPhone();
        break;
      case 'forgot-password':
        this.handleVerifyThenShowPassword();
        break; // ★ 必须有
      case 'reset-password':
        this.handleResetPassword();
        break;
      case 'register':
        this.handleRegisterVerifyThenRegister();
        break;
    }
  }

  /**
   * Register: verify the OTP (the backend returns a short-lived, single-use RegistrationProof), then call
   * MemberRegister with that proof; the backend creates the member in Warely. If registration could not be
   * confirmed (timeout / 503), "Verify" again retries with the SAME proof — the OTP is not re-verified and no
   * second account can be created.
   */
  private handleRegisterVerifyThenRegister() {
    if (!this.verifyOtpRes) return;
    if (!this.registerRequest) {
      this.toastHelper.presentFailedToast(
        'Missing register data. Please go back and register again.',
      );
      return;
    }

    this.loadingHelper.show();

    if (this.registrationProof) {
      this.submitRegistration(this.registrationProof);
      return;
    }

    const phone = this.verifyOtpRes?.PhoneNumber ?? '';
    const deviceId = (this.verifyOtpRes as any)?.DeviceId ?? '';
    const otp = this.otpCode;

    this.authApiService
      .verifyRegisterOtp({ PhoneNumber: phone, otp, deviceId })
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          const proof: string | undefined = res?.RegistrationProof;
          if (!proof) {
            this.loadingHelper.hide();
            this.toastHelper.presentFailedToast('Verification failed. Please request a new OTP.');
            return;
          }
          this.registrationProof = proof;
          this.submitRegistration(proof);
        },
        error: (err: HttpErrorResponse) => {
          this.loadingHelper.hide();
          this.toastHelper.presentFailedToast(err.error ?? 'Invalid OTP.');
        },
      });
  }

  private submitRegistration(proof: string) {
    this.userApiService
      .registerMember({ ...this.registerRequest, registrationProof: proof })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.registrationProof = null;
          this.loadingHelper.hide();
          this.toastHelper.presentSuccessToast('Register success, Welcome to GzFortune!', 'top');
          this.stateSession.consumeReturnUrl('/home');
          this.navCtrl.navigateRoot(this.redirectUrl, { replaceUrl: true });
        },
        error: (err: HttpErrorResponse) => {
          this.loadingHelper.hide();
          const retryable = err?.status === 0 || err?.status === 503 || err?.status === 504;
          // A definitive answer (e.g. already registered, conflict, expired proof) needs a fresh OTP next time.
          if (!retryable) this.registrationProof = null;
          const message = typeof err?.error === 'string' ? err.error : null;
          this.toastHelper.presentFailedToast(
            retryable
              ? message ?? 'We could not confirm your registration yet. Tap Verify to try again.'
              : message ?? 'Register failed.',
          );
        },
      });
  }


  /** 登录场景（如果还在用） */
  private handleLoginByPhone() {
    if (!this.verifyOtpRes) return;

    this.loadingHelper.show();

    const phone = this.verifyOtpRes?.PhoneNumber ?? '';
    const deviceId = (this.verifyOtpRes as any)?.DeviceId ?? '';
    const otp = this.otpCode;

    this.authApiService
      .verifyLoginOtp({ PhoneNumber: phone, otp, deviceId, Channel: this.otpChannel })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadingHelper.hide();
          this.stateSession.consumeReturnUrl('/home');
          this.navCtrl.navigateRoot(this.redirectUrl, { replaceUrl: true });
          this.userApiService
            .getMemberDetails({ PhoneNumber: phone, DeviceId: deviceId })
            .pipe(take(1))
            .subscribe((res) => {
              this.authService.setAuthenticated(true);
              this.userstateService.updateMemberInfo(res);
              const OneSignal = window.plugins.OneSignal;
              OneSignal.login(res.userId);
            });
          this.userstateService.setKeepLoginRequest({
            PhoneNumber: this.stringHelper.removeAllWhiteSpace(phone),
            DeviceId: deviceId.identifier ?? localStorage.getItem('Device') ?? '',
          });
        },
        error: (err: HttpErrorResponse) => {
          this.loadingHelper.hide();
          // The backend sends distinct messages: wrong/expired code (400), membership needs linking (409),
          // or Warely temporarily unavailable (503 — the code stays valid, so tapping Verify again is safe).
          const message = typeof err?.error === 'string' && err.error ? err.error : null;
          const temporary = err?.status === 0 || (err?.status ?? 0) >= 500;
          this.toastHelper.presentFailedToast(
            message ?? (temporary ? 'We could not confirm your account yet. Please tap Verify again in a moment.' : 'Invalid OTP.'),
          );
        },
      });
  }

  private handleResendOtpByPhone() {
    if (!this.verifyOtpRes) return;

    this.loadingHelper.show();

    const req: PhoneRequestOTP = {
      phoneNumber: this.verifyOtpRes.PhoneNumber,
      deviceId: (this.verifyOtpRes as any).DeviceId ?? '',
      Channel: 1, // SMS
    };

    const resend$ =
      this.verifyType === 'register'
        ? this.authApiService.requestRegisterOtpSms(req)
        : this.authApiService.requestLoginOTP(req);

    resend$.pipe(take(1)).subscribe({
      next: (res) => {
        this.loadingHelper.hide();
        this.verifyOtpRes = res;
        this.otpChannel = OTP_CHANNEL.SMS;
        this.updateOtpDigits();
        this.toastHelper.presentSuccessToast('OTP resent to your SMS.');

        this.startSmsResendCooldown(180);
      },
      error: (err: HttpErrorResponse) => {
        this.loadingHelper.hide();
        this.toastHelper.presentFailedToast(err.error ?? 'Resend failed, please try again.');
      },
    });
  }

  private handleResendOtpByEmail() {
    if (!this.verifyOtpRes) return;

    this.loadingHelper.show();

    const req: PhoneRequestOTP = {
      phoneNumber: this.verifyOtpRes.PhoneNumber,
      deviceId: (this.verifyOtpRes as any).DeviceId ?? '',
      Channel: 2, // Email
    };

    this.authApiService
      .ResendOtpWithEmail(req)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.loadingHelper.hide();
          this.verifyOtpRes = res;
          this.otpChannel = OTP_CHANNEL.EMAIL;
          this.updateOtpDigits();
          this.toastHelper.presentSuccessToast('OTP resent to your email.');

          // ✅ 这里开始 35 秒冷却
          this.startEmailResendCooldown(180);
        },
        error: (err: HttpErrorResponse) => {
          this.loadingHelper.hide();
          this.toastHelper.presentFailedToast(err.error ?? 'Resend failed, please try again.');
          // 失败时是否也要冷却，看你需求，如果要，可以在这里也调用 this.startResendCooldown(180);
        },
      });
  }

  /** 忘记/重置：先服务器校验 OTP，再在本页展开密码输入 */
  private handleVerifyThenShowPassword() {
    const phone = this.verifyOtpRes?.PhoneNumber ?? '';
    const deviceId = (this.verifyOtpRes as any)?.DeviceId ?? '';
    const otp = this.otpCode;

    if (!phone || !otp) {
      this.toastHelper.presentFailedToast('Missing information.');
      return;
    }

    this.loadingHelper.show();

    // const TargetOtp = localStorage.getItem('OTP') || '';
    // if (otp === TargetOtp) {
    //   this.loadingHelper.hide();
    //   this.isVerified = true;
    //   // 锁定 OTP 输入区
    //   this.otpInput.disabled = true;
    // } else {
    //   this.loadingHelper.hide();
    //   this.toastHelper.presentFailedToast('Invalid OTP.');
    // }
    this.authApiService
      .verifyLoginOtp({ PhoneNumber: phone, otp, deviceId, Channel: this.otpChannel })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadingHelper.hide();
          this.isVerified = true;
          // 锁定 OTP 输入区
          this.otpInput.disabled = true;
        },
        error: (err: HttpErrorResponse) => {
          this.loadingHelper.hide();
          this.toastHelper.presentFailedToast(err.error ?? 'Invalid OTP.');
        },
      });
  }

  /** reset-password 入口（已拿到 newPassword 的场景） */
  private handleResetPassword() {
    const phone = this.verifyOtpRes?.PhoneNumber ?? '';
    const deviceId = (this.verifyOtpRes as any)?.DeviceId ?? '';
    const otp = this.otpCode;
    const password = this.newPassword;

    if (!phone || !otp || !password) {
      this.toastHelper.presentFailedToast('Missing information.');
      return;
    }

    this.loadingHelper.show();

    const TargetOtp = localStorage.getItem('OTP') || '';
    if (otp === TargetOtp) {
      this.userApiService
        .resetPassword(phone, password)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.loadingHelper.hide();
            this.toastHelper.presentSuccessToast('Password reset successful!');
            this.navCtrl.navigateRoot('/home');
          },
          error: () => {
            this.loadingHelper.hide();
            this.toastHelper.presentFailedToast('Password reset failed.');
          },
        });
    } else {
      this.loadingHelper.hide();
      this.toastHelper.presentFailedToast('Invalid OTP.');
    }

    // this.authApiService
    //   .verifyEmailOtp({ phoneNumber: phone, otp, deviceId })
    //   .pipe(take(1))
    //   .subscribe({
    //     next: () => {
    //       this.userApiService
    //         .resetPassword(phone, password)
    //         .pipe(take(1))
    //         .subscribe({
    //           next: () => {
    //             this.loadingHelper.hide();
    //             this.toastHelper.presentSuccessToast('Password reset successful!');
    //             this.navCtrl.navigateRoot('/home');
    //           },
    //           error: () => {
    //             this.loadingHelper.hide();
    //             this.toastHelper.presentFailedToast('Password reset failed.');
    //           },
    //         });
    //     },
    //     error: (err: HttpErrorResponse) => {
    //       this.loadingHelper.hide();
    //       this.toastHelper.presentFailedToast(err.error ?? 'Invalid OTP.');
    //     },
    //   });
  }

  submitNewPassword() {
    const phone = this.verifyOtpRes?.PhoneNumber ?? '';
    const pwd = (this.newPassword || '').trim();
    const confirm = (this.confirmPassword || '').trim();

    if (!this.isVerified) {
      this.toastHelper.presentFailedToast('Please verify OTP first.');
      return;
    }
    if (!pwd || !confirm) {
      this.toastHelper.presentFailedToast('Please enter password.');
      return;
    }
    if (pwd.length < 6) {
      this.toastHelper.presentFailedToast('Password must be at least 6 characters.');
      return;
    }
    if (pwd !== confirm) {
      this.toastHelper.presentFailedToast('Passwords do not match.');
      return;
    }

    this.loadingHelper.show();
    this.userApiService
      .resetPassword(phone, pwd)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadingHelper.hide();
          this.toastHelper.presentSuccessToast('Password reset successful!');
          this.navCtrl.navigateRoot('/home');
        },
        error: () => {
          this.loadingHelper.hide();
          this.toastHelper.presentFailedToast('Password reset failed.');
        },
      });
  }

  canSubmitPassword(): boolean {
    return (
      this.isVerified &&
      !!this.newPassword &&
      !!this.confirmPassword &&
      this.newPassword.length >= 8 &&
      this.newPassword === this.confirmPassword
    );
  }
}
