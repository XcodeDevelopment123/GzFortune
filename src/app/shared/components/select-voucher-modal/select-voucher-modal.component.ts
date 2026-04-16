import { Component, Input, OnInit } from '@angular/core';
import { Voucher, VoucherType } from 'src/app/core/models/voucher.model';
import { ModalHelperService } from '../../services/modal-helper.service';
import { typeToClassMap } from '../../constants/voucher-tag';
import { VoucherDelivery } from 'src/app/core/models/delivery.model';

@Component({
  selector: 'app-select-voucher-modal',
  templateUrl: './select-voucher-modal.component.html',
  styleUrls: ['./select-voucher-modal.component.scss'],
  standalone: false,
})
export class SelectVoucherModalComponent implements OnInit {
  @Input() deliveryVoucher: VoucherDelivery[] = [];

  selectedVoucherId: string = '';

  constructor(private modalHelper: ModalHelperService) {}

  get voucherList() {
    return this.deliveryVoucher || []; // 假设deliveryVoucher有vouchers属性
  }

  ngOnInit() {
    console.log('Received deliveryVoucher:', this.deliveryVoucher);
  }

  selectVoucher(voucherId: string) {
    this.selectedVoucherId = voucherId;
    console.log('select voucher', this.selectedVoucherId);
  }

  use() {
    const voucher = this.voucherList.find((v: any) => v.id.toString() === this.selectedVoucherId);
    if (!voucher) return;

    this.modalHelper.dismissModal({ voucher });
  }

  isVoucherValid(voucher: any): boolean {
    const expireDate = new Date(voucher.expireDate || voucher.ExpireDate);
    const today = new Date();
    return expireDate > today && (voucher.status || voucher.Status) === 'Active';
  }

  selectedVoucherIsValid(): boolean {
    const voucher = this.voucherList.find((v: any) => v.id.toString() === this.selectedVoucherId);
    if (!voucher) {
      return false;
    }
    return this.isVoucherValid(voucher);
  }

  // use() {
  //   const voucher = this.vouchers.find((v) => v.id === this.selectedVoucherId);
  //   if (!voucher) {
  //     return;
  //   }

  //   this.modalHelper.dismissModal({ voucher });
  // }

  // getTagClass(type: VoucherType): string {
  //   return 'tag-' + typeToClassMap[type];
  // }
}
