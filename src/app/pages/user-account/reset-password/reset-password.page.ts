import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { passwordValidator } from 'src/app/shared/utils/password.validator';
import { matchPasswordValidatorGroup } from 'src/app/shared/utils/match-password.validator';
import { NavController } from '@ionic/angular';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { firstValueFrom } from 'rxjs';
import { LoadingHelperService } from 'src/app/shared/services/loading-helper.service';
import { PhoneRequestOTP } from 'src/app/core/repo/request/auth-request.model';
import { VerifyOtpKey, VerifyOTPPageType } from 'src/app/shared/statics/interface-helper';
import { DeviceInfoService } from 'src/app/shared/services/device-info.service';
import { AuthApiService } from 'src/app/core/repo/api/auth-api.service';
import { StateSessionService } from 'src/app/shared/services/state-session.service';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';
import { take } from 'rxjs';
import { UserApiService } from 'src/app/core/repo/api/user-api.service';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: false,
})
export class ResetPasswordPage implements OnInit {
  private readonly verifyOTPPageType: VerifyOTPPageType = 'reset-password';

  form!: FormGroup;
  password: string = '';

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private UserStateService: UserStateService,
    private loadingHelper: LoadingHelperService,
    private deviceInfoService: DeviceInfoService,
    private authApiService: AuthApiService,
    private stateSession: StateSessionService,
    private toastHelper: ToastHelperService,
    private userApiService: UserApiService,

  ) {}

  ngOnInit() {
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, passwordValidator]],
        rePassword: ['', Validators.required],
      },
      { validators: matchPasswordValidatorGroup },
    );
  }

  async onContinue() {
    if (this.form.valid) {
      const password = this.form.value.password;
      const member = await firstValueFrom(this.UserStateService.memberInfo);
      const phoneNumber = member?.phoneNumber;
      if (!phoneNumber) {
        console.error('⚠️ phoneNumber is missing');
        return;
      }
      this.loadingHelper.show();

      this.userApiService
        .resetPassword(member?.phoneNumber, password)
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

      // const deviceId = await this.deviceInfoService.getDeviceId();

      // const req: PhoneRequestOTP = {
      //   phoneNumber: phoneNumber,
      //   deviceId: deviceId.identifier,
      // };

      // this.loadingHelper.show();
      // this.authApiService.requestPhoneOTP(req).subscribe({
      //   next: (res) => {
      //     this.loadingHelper.hide();

      //     this.stateSession.setDataAndNavigate(
      //       `auth/otp-verify/${this.verifyOTPPageType}`,
      //       VerifyOtpKey.RESET_PASSWORD,
      //       {
      //         otpData: res,
      //         phoneNumber: phoneNumber,
      //         newPassword: password,
      //       },
      //     );
      //   },
      //   error: (err) => {
      //     this.loadingHelper.hide();

      //     if (err.error instanceof ProgressEvent) {
      //       this.toastHelper.presentFailedToast('Network issue, please try again later');
      //     } else {
      //       this.toastHelper.presentFailedToast(err.error ?? 'Request failed, please try again');
      //     }

      //     console.error('Reset Password → OTP Request Failed:', err);
      //   },
      // });
    }
  }

  updatePassword(value: string) {
    this.password = value;
  }
}
