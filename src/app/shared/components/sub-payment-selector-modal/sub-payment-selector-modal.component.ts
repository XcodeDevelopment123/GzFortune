import { Component, Input, OnInit } from '@angular/core';
import { ModalHelperService } from '../../services/modal-helper.service';
import { SubPaymentOption } from '../../models/payment.model';
import { EWalletSubPaymentMethods, FpxSubPaymentMethods } from '../../constants/payment-method';

@Component({
  selector: 'app-sub-payment-selector-modal',
  templateUrl: './sub-payment-selector-modal.component.html',
  styleUrls: ['./sub-payment-selector-modal.component.scss'],
  standalone: false,
})
export class SubPaymentSelectorModalComponent implements OnInit {
  @Input() type: string = '';

  subOptions: SubPaymentOption[] = [];
  constructor(private modalHelper: ModalHelperService) {}

  ngOnInit() {
    this.loadOptionsByType();
  }

  loadOptionsByType() {
    if (this.type === 'e-wallet') {
      this.subOptions = EWalletSubPaymentMethods;
    } else if (this.type === 'fpx') {
      this.subOptions = FpxSubPaymentMethods;
    }
  }

  select(opt: SubPaymentOption) {
    this.modalHelper.dismissModal({ selected: opt });
  }
}
