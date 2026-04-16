import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { AuthApiService } from 'src/app/core/repo/api/auth-api.service';
import { RegisterMemberRequest } from 'src/app/core/repo/request/auth-request.model';
import { LoadingHelperService } from 'src/app/shared/services/loading-helper.service';
import { StateSessionService } from 'src/app/shared/services/state-session.service';
import { StringHelperService } from 'src/app/shared/services/string-helper.service';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';
import { DeviceInfoService } from 'src/app/shared/services/device-info.service';
import { VerifyOtpKey, VerifyOTPPageType } from 'src/app/shared/statics/interface-helper';
import { matchPasswordValidatorGroup } from 'src/app/shared/utils/match-password.validator';
import { passwordValidator } from 'src/app/shared/utils/password.validator';
import { phoneNumberValidator } from 'src/app/shared/utils/phone-number.validator';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {
  form?: FormGroup;
  isFailed: boolean = false;
  failedMessage: string = '';
  private readonly verifyOTPPageType: VerifyOTPPageType = 'register';
  constructor(
    private fb: FormBuilder,
    private authApiService: AuthApiService,
    private stringHelper: StringHelperService,
    private loadingHelper: LoadingHelperService,
    private toastHelper: ToastHelperService,
    private deviceInfoService: DeviceInfoService,
    private stateSession: StateSessionService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group(
      {
        image: [null],
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.required, phoneNumberValidator('MY')]],
        birthday: ['', [this.optionalYmdValidator()]],
        password: ['', [Validators.required, passwordValidator()]],
        rePassword: ['', [Validators.required]],
        referralBy: ['', [Validators.maxLength(5)]],
      },
      { validators: matchPasswordValidatorGroup },
    );
  }

  async submit() {
    try {
      (document.activeElement as HTMLElement | null)?.blur();
      this.loadingHelper.show();

      if (!this.form) {
        this.loadingHelper.hide();
        return;
      }

      this.form.markAllAsTouched();
      if (this.form.invalid) {
        this.loadingHelper.hide();
        this.toastHelper.presentFailedToast('Please complete the required fields');
        return;
      }
      const req = this.getRequest();
      req.phoneNumber = this.stringHelper.removeAllWhiteSpace(req.phoneNumber);

      req.birthday = req.birthday ? req.birthday : '';

      req.imageByte = ''; // 空字符串或不设都可
      req.image = '';
      req.EmailSubcribe = 'true';

      // 1) Request SMS OTP for registration (server will NOT create member yet)
      const deviceId = await this.deviceInfoService.getDeviceId();
      const otpRes = await lastValueFrom(
        this.authApiService.requestRegisterOtpSms({
          phoneNumber: req.phoneNumber,
          deviceId: deviceId.identifier,
          Channel: 1,
        }),
      );

      // Ensure otp response carries deviceId so otp-verify page can reuse
      (otpRes as any).DeviceId = deviceId.identifier;

      // 2) Go to OTP verify page with a draft register request
      const redirect = '/home';
      this.stateSession.setDataAndNavigate(
        `auth/otp-verify/${this.verifyOTPPageType}`,
        VerifyOtpKey.REGISTER,
        { otpData: otpRes, registerRequest: req },
        { queryParams: { redirect } },
      );
      this.toastHelper.presentSuccessToast('OTP sent. Please verify to continue.', 'top');
    } catch (err) {
      console.error('Register error:', err);
      this.isFailed = true;

      const errorMessage = await this.parseApiError(err);
      this.toastHelper.presentFailedToast(`Register Failed: ${errorMessage}`);
      this.failedMessage = errorMessage;
    } finally {
      this.loadingHelper.hide();
    }
  }

  enableToSubmit(): boolean {
    if (!this.form) return false;

    const req = this.getRequest();

    const birthCtrl = this.form.get('birthday'); // ✅ 修正这里
    const birthdayInvalid = birthCtrl?.invalid; // optionalYmdValidator 会给 invalid

    return (
      !birthdayInvalid &&
      req.name?.trim() !== '' &&
      req.email?.trim() !== '' &&
      req.phoneNumber?.trim() !== '' &&
      req.password?.trim() !== ''

      // req.birthday?.trim() !== undefined
    );
  }

  private getRequest() {
    return this.form?.value as RegisterMemberRequest;
  }

  private async parseApiError(err: any): Promise<string> {
    if (err?.error instanceof Blob) {
      try {
        const text = await err.error.text();
        const json = JSON.parse(text);
        return this.extractProblemDetails(json);
      } catch {
        return 'Please try again later';
      }
    }

    if (typeof err?.error === 'object' && err?.error) {
      return this.extractProblemDetails(err.error);
    }

    if (typeof err?.error === 'string') {
      return err.error;
    }

    return err?.message || 'Please try again later';
  }

  private extractProblemDetails(p: any): string {
    if (p?.errors && typeof p.errors === 'object') {
      const messages: string[] = [];
      Object.keys(p.errors).forEach((field) => {
        const fieldErrors = p.errors[field];
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach((msg) => messages.push(`${field}: ${msg}`));
        }
      });
      if (messages.length > 0) return messages.join('\n');
    }
    if (p?.detail) return p.detail;
    if (p?.title) return p.title;
    if (p?.message) return p.message;
    return 'Please try again later';
  }

  private optionalYmdValidator(): ValidatorFn {
    return (c: AbstractControl): ValidationErrors | null => {
      const v = (c.value ?? '').toString().trim();
      if (!v) return null; // optional

      // 1) 格式与范围
      const m = v.match(/^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/);
      if (!m) return { dateFormat: true };

      // 2) 排除不存在的日期（例如 2025-02-30）
      const y = Number(m[1]);
      const mm = Number(m[2]);
      const dd = Number(m[3]);

      const dt = new Date(y, mm - 1, dd);
      const ok = dt.getFullYear() === y && dt.getMonth() === mm - 1 && dt.getDate() === dd;

      return ok ? null : { dateInvalid: true };
    };
  }
}
