import { Component, Input, OnInit } from '@angular/core';
import { ModalHelperService } from '../../services/modal-helper.service';
import { PaymentMethod, SelectedPaymentResult, SubPaymentOption } from '../../models/payment.model';
import { paymentMethods } from '../../constants/payment-method';
import { NavController } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { UserApiService } from 'src/app/core/repo/api/user-api.service';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-select-payment-method-modal',
  templateUrl: './select-payment-method-modal.component.html',
  styleUrls: ['./select-payment-method-modal.component.scss'],
  standalone: false,
})
export class SelectPaymentMethodModalComponent implements OnInit {
  @Input() selectedPaymentMethod: string = '';
  @Input() selectedSubOption: { [key: string]: SubPaymentOption } = {};

  paymentMethods = paymentMethods;
  previousPaymentMethod: string = '';

  isModalShowed: boolean = false;
  walletAmount: number = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private modalHelper: ModalHelperService,
    private navCtrl: NavController,
    private userApiService: UserApiService,
    private userStateService: UserStateService,
  ) {}

  ngOnInit() {
    this.userStateService.walletInfo.pipe(takeUntil(this.destroy$)).subscribe((wallet) => {
      this.walletAmount = wallet?.balance ?? 0;
    });
  }

  apply() {
    const result: SelectedPaymentResult = {
      method: this.selectedPaymentMethod,
      subOption: this.selectedSubOption[this.selectedPaymentMethod] || null,
    };

    this.modalHelper.dismissModal(result);
  }

  toTopupPage() {
    this.modalHelper.dismissModal();
    this.navCtrl.navigateRoot('wallet');
  }

  async onSelectMethod(method: PaymentMethod) {
    this.previousPaymentMethod = this.selectedPaymentMethod;

    if (this.isModalShowed) {
      //prevent double click
      return;
    }

    if (method.requiresSubSelection) {
      this.isModalShowed = true;

      const modal = await this.modalHelper.createSubPaymentSelectorModal(method.key);

      await modal.present();

      const { role, data } = await modal.onWillDismiss<{
        selected: SubPaymentOption;
      }>();

      this.isModalShowed = false;
      if (data?.selected) {
        this.selectedSubOption[method.key] = data.selected;
        this.selectedPaymentMethod = method.key;
        this.clearAllSubOptionsExcept(method.key);
      } else {
        this.selectedPaymentMethod = this.previousPaymentMethod;
      }
    } else {
      this.selectedPaymentMethod = method.key;
      this.clearAllSubOptionsExcept(method.key);
    }
  }

  clearAllSubOptionsExcept(currentKey: string) {
    Object.keys(this.selectedSubOption).forEach((key) => {
      if (key !== currentKey) {
        delete this.selectedSubOption[key];
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
