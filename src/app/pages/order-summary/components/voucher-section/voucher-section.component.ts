import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { VoucherDelivery, VoucherDeliveryList } from 'src/app/core/models/delivery.model';
import { Voucher, VoucherType } from 'src/app/core/models/voucher.model';
import { typeToClassMap } from 'src/app/shared/constants/voucher-tag';
import { ModalHelperService } from 'src/app/shared/services/modal-helper.service';

@Component({
  selector: 'app-voucher-section',
  templateUrl: './voucher-section.component.html',
  styleUrls: ['./voucher-section.component.scss'],
  standalone: false,
})
export class VoucherSectionComponent implements OnInit {
  @Input() deliveryVoucher: VoucherDeliveryList | null = null;
  @Output() voucherSelected = new EventEmitter<VoucherDelivery>();
  @Output() voucherRemoved = new EventEmitter<void>();
  selectedVoucher: VoucherDelivery | null = null;

  constructor(private modalHelper: ModalHelperService) {}

  ngOnInit() {}

  async open() {
    if (!this.deliveryVoucher) return;

    var modal = await this.modalHelper.createSelectVoucherModal(this.deliveryVoucher);
    await modal.present();

    const { role, data } = await modal.onWillDismiss<{ voucher: VoucherDelivery }>();

    if (data) {
      console.log(data);
      this.selectedVoucher = data.voucher;
      this.voucherSelected.emit(data.voucher);
    }
  }

  removeVoucher() {
    this.selectedVoucher = null;
    this.voucherRemoved.emit();
  }

  getTagClass(type: VoucherType): string {
    return 'tag-' + typeToClassMap[type];
  }
}
