import { Component, Input, input, OnInit } from '@angular/core';
import { firstValueFrom, take } from 'rxjs';
import { Member } from 'src/app/core/models/member.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { ModalHelperService } from 'src/app/shared/services/modal-helper.service';
import { Router } from '@angular/router';
import { AlertHelperService } from 'src/app/shared/services/alert-helper.service';
@Component({
  selector: 'app-account-user-card',
  templateUrl: './account-user-card.component.html',
  styleUrls: ['./account-user-card.component.scss'],
  standalone: false,
})
export class AccountUserCardComponent implements OnInit {
  @Input() memberInfo: Member | null = null;

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
    if (this.memberInfo?.name != null) {
      return;
    }
    await this.router.navigate(['/auth/login'], {
      queryParams: { redirect: this.router.url },
    });
  }

  GetProgressValue(i: Member): number {
    if (!i.indicatorMax || i.indicatorMax <= 0) return 0;

    const progress = i.point / i.indicatorMax;
    return Math.min(progress, 1);
  }
}
