import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { finalize, from, switchMap, take } from 'rxjs';
import { Member } from 'src/app/core/models/member.model';
import { UserApiService } from 'src/app/core/repo/api/user-api.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { AlertHelperService } from 'src/app/shared/services/alert-helper.service';
import { ToastHelperService } from 'src/app/shared/services/toast-helper.service';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.page.html',
  styleUrls: ['./delete-account.page.scss'],
  standalone: false,
})
export class DeleteAccountPage implements OnInit {
  confirmationText!: string;
  memberInfo!: Member;
  loading = false;

  deleteConfirmationControl = new FormControl('', [
    Validators.required,
    deleteConfirmationValidator,
  ]);

  constructor(
    private userStateService: UserStateService,
    private userApiService: UserApiService,
    private toastHelper: ToastHelperService,
    private alertHelper: AlertHelperService,
    private router: Router,
    public authService: AuthService,
    private menuCtrl: MenuController,
  ) {}

  ngOnInit() {
    this.userStateService.memberInfo.subscribe((res) => {
      if (res) {
        this.memberInfo = res;
      }
    });

    this.deleteConfirmationControl.valueChanges.subscribe((value) => {
      this.confirmationText = value || '';
    });
  }

  async onDeleteAccount() {
    if (this.deleteConfirmationControl.invalid) return;

    const alert = await this.alertHelper.createConfirmAlert(
      'Delete Account',
      `This action is irreversible. Proceed?`,
    );
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role !== 'confirm') return;

    this.loading = true;

    this.userApiService.updateAccountStatusDeactivate(this.memberInfo.phoneNumber).subscribe({
      next: async () => {
        try {
          // 1) 后端请求已成功 (注意：先按 2. 改 responseType)
          await this.authService.logout(); // 清掉 session token 的逻辑

          // 2) 清掉 user state 和持久化
          await (this.userStateService as any).clearKeepLoginRequest?.();
          (this.userStateService as any).updateMemberInfo?.(null);
          await (this.userStateService as any).reset?.();

          // 3) 关闭 menu 并跳转到 login
          await this.menuCtrl.close();
          await this.router.navigate(['/auth/login'], { replaceUrl: true });

          // 4) 强制刷新（可选但常用来避免残留）
          window.location.reload();
        } catch (e) {
          const err = await this.alertHelper.createBasicAlert('Logout failed', 'Please try again.');
          await err.present();
        }
      },
      error: async (err) => {
        const a = await this.alertHelper.createBasicAlert(
          'Delete failed',
          'Please try again later.',
        );
        await a.present();
        console.error('Delete account error:', err);
      },
    });
  }
}

function deleteConfirmationValidator(control: any) {
  const value = control.value;
  if (value && value.trim() !== 'DELETE') {
    return { notMatchDelete: true };
  }
  return null;
}
