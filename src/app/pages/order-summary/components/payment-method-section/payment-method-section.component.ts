import { Component } from '@angular/core';
import { paymentMethods } from 'src/app/shared/constants/payment-method';
import {
  PaymentMethod,
  SelectedPaymentResult,
  SubPaymentOption,
} from 'src/app/shared/models/payment.model';
import { ModalHelperService } from 'src/app/shared/services/modal-helper.service';
@Component({
  selector: 'app-payment-method-section',
  templateUrl: './payment-method-section.component.html',
  styleUrls: ['./payment-method-section.component.scss'],
  standalone: false,
})
export class PaymentMethodSectionComponent {
  private _selectedMethod: PaymentMethod | null = null;
  private _selectedSubOption: SubPaymentOption | null = null;

  private _showError: boolean = false;

  constructor(private modalHelper: ModalHelperService) {}

  get isShowError(): boolean {
    return this._showError;
  }

  get paymentMethod(): string | null {
    if (!this._selectedMethod) return null;

    return this._selectedMethod.key;
  }

  get selectedPaymentDisplay(): { label: string; img?: string } | null {
    if (!this._selectedMethod) return null;

    return {
      label: this._selectedSubOption?.name || this._selectedMethod.label,
      img: this._selectedSubOption?.img || this._selectedMethod.icon,
    };
  }

  /**
   * Validates the component state, typically ensuring that a payment method is selected.
   *
   * Calling this method will perform validation and return `true` if the component is in a valid state,
   * or `false` if not. If the `showError` parameter is `true` and validation fails, an error flag will be
   * set to trigger visual feedback such as an error animation or message.
   *
   * @param {boolean} [showError=false] Whether to trigger visual error feedback on validation failure.
   * @returns {boolean} `true` if valid, `false` otherwise
   */
  validate(showError: boolean = false): boolean {
    const isValid = !!this.paymentMethod;

    this._showError = !isValid && showError;
    return isValid;
  }

  async openSelectModal() {
    var modal = await this.modalHelper.createSelectPaymentMethodModal(
      this._selectedMethod?.key ?? null,
      this._selectedSubOption,
    );
    await modal.present();

    const { role, data } = await modal.onWillDismiss<SelectedPaymentResult>();
    if (data) {
      this._selectedMethod = paymentMethods.find((m) => m.key === data.method) || null;
      this._selectedSubOption = data.subOption || null;
    }
  }
}
