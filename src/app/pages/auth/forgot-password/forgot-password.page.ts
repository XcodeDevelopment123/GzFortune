import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthApiService } from 'src/app/core/repo/api/auth-api.service';
import { PhoneRequestOTP } from 'src/app/core/repo/request/auth-request.model';
import { DeviceInfoService } from 'src/app/shared/services/device-info.service';
import { LoadingHelperService } from 'src/app/shared/services/loading-helper.service';
import { StateSessionService } from 'src/app/shared/services/state-session.service';
import { StringHelperService } from 'src/app/shared/services/string-helper.service';
import {
  LoginType,
  VerifyOtpKey,
  VerifyOTPPageType,
} from 'src/app/shared/statics/interface-helper';
import { phoneNumberValidator } from 'src/app/shared/utils/phone-number.validator';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: false,
})
export class ForgotPasswordPage implements OnInit {
  private readonly verifyOTPPageType: VerifyOTPPageType = 'forgot-password';

  form?: FormGroup;

  LoginType = LoginType;
  loginType?: LoginType = LoginType.PHONE;

  isFailed: boolean = false;
  failedMessage: string = '';
  constructor(
    private fb: FormBuilder,
    private authApiService: AuthApiService,
    private loadingHelper: LoadingHelperService,
    private stringHelper: StringHelperService,
    private stateSession: StateSessionService,
    private deviceInfoService: DeviceInfoService,
  ) {}

  get emailCtrl(): FormControl {
    return this.form?.get('email') as FormControl;
  }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, phoneNumberValidator('MY')]],
    });

  }

  submit() {
    if (this.loginType === LoginType.EMAIL) {
      this.handleSubmitEmail();
    } else if (this.loginType === LoginType.PHONE) {
      this.handleSubmitPhone();
    }
  }

  private async handleSubmitEmail() {}

  private async handleSubmitPhone() {
    const phoneNumber = this.form?.get('phoneNumber')?.value;
    if (!phoneNumber) {
      this.isFailed = true;
      this.failedMessage = 'Please enter phone number';
      console.error('form are invalid');
      return;
    }

    this.loadingHelper.show();

    this.isFailed = false;
    this.failedMessage = '';

    const deviceId = await this.deviceInfoService.getDeviceId();

    const req: PhoneRequestOTP = {
      phoneNumber: this.stringHelper.removeAllWhiteSpace(phoneNumber),
      deviceId: deviceId.identifier,
      Channel: 1, // SMS
    };

    this.authApiService.requestLoginOTP(req).subscribe({
      next: (res) => {
        console.log('[requestLoginOTP] raw response =', res);

        this.loadingHelper.hide();
        if (res) {
          this.stateSession.setDataAndNavigate(
            `auth/otp-verify/${this.verifyOTPPageType}`,
            VerifyOtpKey.FORGOT_PASS,
            res,
          );
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loadingHelper.hide();
        console.error('Phone login error:', err);
        this.isFailed = true;
        this.failedMessage = err.error ?? 'Please try again later';
      },
    });
  }
}
