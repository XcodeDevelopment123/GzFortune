import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from 'src/app/core/repo/api/auth-api.service';
import { PhoneRequestOTP } from 'src/app/core/repo/request/auth-request.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { DeviceInfoService } from 'src/app/shared/services/device-info.service';
import { LoadingHelperService } from 'src/app/shared/services/loading-helper.service';
import { StateSessionService } from 'src/app/shared/services/state-session.service';
import { StringHelperService } from 'src/app/shared/services/string-helper.service';
import { VerifyOtpKey, VerifyOTPPageType } from 'src/app/shared/statics/interface-helper';
import { phoneNumberValidator } from 'src/app/shared/utils/phone-number.validator';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-phone-login',
  templateUrl: './phone-login.component.html',
  styleUrls: ['./phone-login.component.scss'],
  standalone: false,
})
export class PhoneLoginComponent implements OnInit {
  private readonly verifyOTPPageType: VerifyOTPPageType = 'login-phone';

  form?: FormGroup;
  isLoginFailed: boolean = false;
  loginFailedMessage: string = '';
  constructor(
    private fb: FormBuilder,
    private authApiService: AuthApiService,
    private authService: AuthService,
    private router: Router,
    private deviceInfoService: DeviceInfoService,
    private stringHelper: StringHelperService,
    private loadingHelper: LoadingHelperService,
    private stateSession: StateSessionService,
    private userStateService: UserStateService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      phoneNumber: ['', [Validators.required, phoneNumberValidator('MY')]],
    });
  }

  async login() {
    const phoneNumber = this.form?.get('phoneNumber')?.value;
    if (!phoneNumber) {
      this.isLoginFailed = true;
      this.loginFailedMessage = 'Please enter phone number';
      console.error('form are invalid');
      return;
    }

    this.loadingHelper.show();

    this.isLoginFailed = false;
    this.loginFailedMessage = '';

    const deviceId = await this.deviceInfoService.getDeviceId();

    const req: PhoneRequestOTP = {
      phoneNumber: this.stringHelper.removeAllWhiteSpace(phoneNumber),
      deviceId: deviceId.identifier,
      Channel: 1, // SMS
    };

    this.authApiService.requestLoginOTP(req).subscribe({
      next: (res) => {
        this.loadingHelper.hide();
        if (res) {
          console.log('OTP requested successfully', res);
          localStorage.setItem(
            'ContactId',
            res.ContactId ? res.ContactId.toString() : res.contactId?.toString() || '',
          );
          const redirect = this.stateSession.getReturnUrl('/home');
          this.stateSession.setDataAndNavigate(
            `auth/otp-verify/${this.verifyOTPPageType}`,
            VerifyOtpKey.LOGIN_PHONE,
            res,
            { queryParams: { redirect } },
          );
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loadingHelper.hide();
        console.error('Phone login error:', err);
        if (err.error instanceof ProgressEvent) {
          this.isLoginFailed = true;
          this.loginFailedMessage = 'Network issue, please try again later';
          return;
        } else {
          this.isLoginFailed = true;
          this.loginFailedMessage = err.error ?? 'Please try again later';
        }
      },
    });
  }
}
