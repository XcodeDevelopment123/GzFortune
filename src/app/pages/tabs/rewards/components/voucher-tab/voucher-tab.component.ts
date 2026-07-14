import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Voucher } from 'src/app/core/models/voucher.model';
import { SelectOption } from 'src/app/shared/statics/interface-helper';
import { ModalHelperService } from 'src/app/shared/services/modal-helper.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { AlertHelperService } from 'src/app/shared/services/alert-helper.service';
import { StateSessionService } from 'src/app/shared/services/state-session.service';
import { firstValueFrom, take } from 'rxjs';

@Component({
  selector: 'app-voucher-tab',
  templateUrl: './voucher-tab.component.html',
  styleUrls: ['./voucher-tab.component.scss'],
  standalone: false,
})
export class VoucherTabComponent implements OnInit {
  @Input() voucherList: Voucher[] = [];
  @Input() userPhoneNumber: string = '';
  @Input() Loaded: boolean = false;

  filteredVoucherList: Voucher[] = [];


  // 三个分类列表
  usedVoucherList: Voucher[] = [];
  activeVoucherList: Voucher[] = [];
  expiredVoucherList: Voucher[] = [];
  readyRedeemVoucherList: Voucher[] = [];
  
  // 下拉框选项
  options: SelectOption[] = [
    { label: 'Active', value: 'Active' },
    { label: 'Used', value: 'Used' },
    { label: 'Expired', value: 'Expired' },
    { label: 'Ready to Redeem', value: 'Ready' },
  ];

  // 当前显示的类型
  showedLists: string[] = ['Active', 'Used', 'Expired', 'Ready'];

  constructor(
    private modalHelper: ModalHelperService,
    private auth: AuthService,
    private router: Router,
    private alertHelper: AlertHelperService,
    private stateSession: StateSessionService,
  ) {}

  ngOnInit() {
    this.filterVoucherType();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['voucherList']) {
      this.filterVoucherType();
    }
  }

  /** 只取 type == 'Voucher' 并分类成 used / active / expired */
  filterVoucherType() {
    const onlyVoucher = this.voucherList;
    const now = new Date();

    this.usedVoucherList = onlyVoucher.filter((v) => v.status === 'Used');
    this.readyRedeemVoucherList = onlyVoucher.filter(
      (v) => v.type?.toLowerCase() === 'reward' && v.status === 'Active',
    );
    this.activeVoucherList = onlyVoucher.filter(
      (v) =>
        v.status === 'Active' &&
        new Date(v.expireDate) > now &&
        (v.type?.toLowerCase() === 'voucher' || !v.type),
    );
    this.expiredVoucherList = onlyVoucher.filter((v) => v.status === 'Expired' || new Date(v.expireDate) <= now);
  }


  /** 当用户选择 Active / Used / Expired */
  onCategoryChange(selected: string[]) {
    // 如果没选，默认全显示
    this.showedLists = selected.length > 0 ? selected : ['Active', 'Used', 'Expired', 'Ready'];
  }

  async openQrModal(voucher: Voucher) {
    const alert = await this.alertHelper.createBasicAlert(
      'Redeem',
      'Please redeem at the counter during checkout!',
    );
    await alert.present();
  }

  goToVoucherDetail(voucher: Voucher) {
    const id = voucher.id || voucher.rewardId || voucher.voucherNo;
    this.router.navigate(['/voucher-detail', id], {
      state: { voucherDetail: voucher }
    });
  }
}
