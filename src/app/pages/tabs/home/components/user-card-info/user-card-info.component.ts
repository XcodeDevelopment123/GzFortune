import { Component, Input, OnInit } from '@angular/core';
import { Member } from 'src/app/core/models/member.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { ModalHelperService } from 'src/app/shared/services/modal-helper.service';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AlertHelperService } from 'src/app/shared/services/alert-helper.service';

@Component({
  selector: 'app-user-card-info',
  templateUrl: './user-card-info.component.html',
  styleUrls: ['./user-card-info.component.scss'],
  standalone: false,
})
export class UserCardInfoComponent implements OnInit {
  // @Input() memberInfo: Member | null = null;
  private _memberInfo: Member | null = null;
  @Input() isLoaded: boolean = false;
  @Input()
  set memberInfo(v: Member | null) {
    this._memberInfo = v;
    console.log('[UserCardInfo] memberInfo SET ->', v);
    // 如果是 OnPush 组件，记得：
    // this.cdr.markForCheck();
  }
  get memberInfo(): Member | null {
    return this._memberInfo;
  }
  constructor(
    private modalHelper: ModalHelperService,
    private auth: AuthService,
    private router: Router,
    private alertHelper: AlertHelperService,
  ) {}

  ngOnInit() {}

  async showQrModal() {
    const isAuth = await firstValueFrom(this.auth.isAuthenticated$.pipe(take(1)));
    if (!isAuth) {
      const alert = await this.alertHelper.createConfirmAlert(
        'Login required',
        'Please login to view your member QR code.',
      );
      await alert.present();
      const { role } = await alert.onDidDismiss();
      if (role === 'confirm') {
        await this.router.navigate(['/auth/login'], {
          queryParams: { redirect: this.router.url },
        });
      }
      return;
    }

    const phone = this.memberInfo?.phoneNumber!;
    const modal = await this.modalHelper.createQrCodeModal(phone, phone);
    await modal.present();
  }

  async GoLogin() {
    if (this.memberInfo?.name != null  || this.isLoaded != true) {
      return;
    }
    await this.router.navigate(['/auth/login'], {
      queryParams: { redirect: this.router.url },
    });
  }

  getProgressValue(i: Member): number {
    if (!i.indicatorMax || i.indicatorMax <= 0) return 0;

    const progress = i.point / i.indicatorMax;
    return Math.min(progress, 1);
  }
}
