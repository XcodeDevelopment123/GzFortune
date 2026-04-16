import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { Member } from 'src/app/core/models/member.model';
import { UserApiService } from 'src/app/core/repo/api/user-api.service';
import { MemberEditProfileRequest } from 'src/app/core/repo/request/member-request.model';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { ImageHelperService } from 'src/app/shared/services/image-helper.service';
import { LoadingHelperService } from 'src/app/shared/services/loading-helper.service';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';
import { phoneNumberValidator } from 'src/app/shared/utils/phone-number.validator';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: false,
})
export class EditProfilePage implements OnInit, OnDestroy {
  form?: FormGroup;

  memberInfo!: Member;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userStateService: UserStateService,
    private userApiService: UserApiService,
    private loadingHelper: LoadingHelperService,
    private toastHelper: ToastHelperService,
    private imageHelper: ImageHelperService,
  ) {}

  get emailCtrl(): FormControl {
    return this.form?.get('email') as FormControl;
  }

  get userCtrl(): FormControl {
    return this.form?.get('name') as FormControl;
  }

  ngOnInit() {
    this.form = this.fb.group({
      image: [],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        { value: '', disabled: true },
        [Validators.required, phoneNumberValidator('MY')],
      ],
      birthDate: [],
    });

    this.userStateService.memberInfo.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        if (res) {
          this.memberInfo = res;
          this.form?.patchValue({
            image: res.image,
            name: res.name,
            email: res.email,
            phoneNumber: res.phoneNumber,
            birthDate: res.birthDate,
          });
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  showDate() {}

  async submit() {
    // ✅ 触发所有字段 touched，让错误显示出来
    this.form?.markAllAsTouched();
    this.form?.updateValueAndValidity();

    const birthCtrl = this.form?.get('birthDate');

    if (birthCtrl?.errors?.['invalidDate']) {
      this.toastHelper.presentFailedToast('Invalid birth date (DD-MM-YYYY)', 'middle');
      return;
    }

    if (this.form?.invalid) {
      this.toastHelper.presentFailedToast('Please check your input', 'middle');
      return;
    }

    this.loadingHelper.show();
    const req = await this.getRequest();
    if (req.Email == null) req.Email = '';

    this.userApiService
      .editProfile(req)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastHelper.presentSuccessToast('Profile has been saved', 'middle');
          this.loadingHelper.hide();
        },
        error: (res) => {
          console.log(res);
          this.toastHelper.presentFailedToast(res.error, 'middle');
          this.loadingHelper.hide();
        },
      });
  }

  private async getRequest(): Promise<MemberEditProfileRequest> {
    const formValue = this.form?.getRawValue(); // make sure to get disabled input value

    let image = formValue.image;
    if (typeof image === 'string' && image.startsWith('http')) {
      image = '';
    } else if (image instanceof File) {
      image = await this.imageHelper.convertImageToBase64(image);
    }

    return {
      PhoneNumber: formValue.phoneNumber,
      UserName: formValue.name,
      Email: formValue.email,
      ImageByte: image,
      Birthday: formValue.birthDate,
    };
  }
}
