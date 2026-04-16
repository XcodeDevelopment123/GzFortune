import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { AuthApiService } from 'src/app/core/repo/api/auth-api.service';
import { LoginByEmailPasswordRequest } from 'src/app/core/repo/request/auth-request.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { take } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingHelperService } from 'src/app/shared/services/loading-helper.service';
import { StateSessionService } from 'src/app/shared/services/state-session.service';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';

@Component({
  selector: 'app-email-login',
  templateUrl: './email-login.component.html',
  styleUrls: ['./email-login.component.scss'],
  standalone: false,
})
export class EmailLoginComponent implements OnInit {
  form?: FormGroup;
  loginFailedMessage = '';
  isLoginFailed: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authApiService: AuthApiService,
    private authService: AuthService,
    private navCtrl: NavController,
    private loadingHelper: LoadingHelperService,
    private stateSession: StateSessionService,
    private toastHelper: ToastHelperService,
  ) {}

  get emailCtrl(): FormControl {
    return this.form?.get('email') as FormControl;
  }
  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  login() {
    const req = this.form?.value as LoginByEmailPasswordRequest;
    if (!req) {
      console.error('form are invalid');
      return;
    }

    this.loadingHelper.show();

    this.authApiService
      .loginByEmailAndPassword(req)
      .pipe(take(1))
      .subscribe({
        next: (member) => {
          this.loadingHelper.hide();
          const redirect = this.stateSession.getReturnUrl('/home');
          this.stateSession.consumeReturnUrl('/home');
          this.navCtrl.navigateRoot(redirect, { replaceUrl: true });
          console.log('email login success', member);
          this.toastHelper.presentSuccessToast('Login successful!');
        },
        error: (err: HttpErrorResponse | any) => {
          this.loadingHelper.hide();
          console.error('email login failed:', err);

          // 提取后端 error 信息
          const message =
            typeof err?.error === 'string'
              ? err.error // 直接是字符串，比如 "Incorrect Password"
              : err?.error?.error || err?.error?.message || err.message || 'Please try again later';

          this.loginFailedMessage = message;
          this.toastHelper.presentFailedToast(message);
        },
      });
  }
}
