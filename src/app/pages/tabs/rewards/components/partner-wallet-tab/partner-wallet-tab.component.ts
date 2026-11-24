import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { PartnerWallet, PartnerWalletAsset } from 'src/app/core/models/partner-reward.model';
import { AuthService } from 'src/app/core/services/auth.service';
import {
  VoucherCodeModalComponent,
  VoucherCodeModalResult,
} from '../voucher-code-modal/voucher-code-modal.component';

export const VOUCHER_CODE_MODAL_ID = 'partner-voucher-code-modal';

/**
 * "My Vouchers" on the Warely Partner flow. Shows ONLY items this account owns (wallet assets),
 * never claimable definitions. The wallet from Warely is the source of truth.
 */
@Component({
  selector: 'app-partner-wallet-tab',
  templateUrl: './partner-wallet-tab.component.html',
  styleUrls: ['./partner-wallet-tab.component.scss'],
  standalone: false,
})
export class PartnerWalletTabComponent implements OnDestroy {
  @Input() wallet: PartnerWallet | null = null;
  @Input() loaded = false;
  @Input() signedIn = false;
  @Input() errorMessage: string | null = null;
  /** Asset just claimed; highlighted so the member sees it arrived. */
  @Input() highlightAssetId: string | null = null;

  @Output() signInRequested = new EventEmitter<void>();
  /** The wallet changed while a code was shown (e.g. used at POS); the parent should re-read it. */
  @Output() walletChanged = new EventEmitter<void>();

  /** The open (or opening) code modal; at most one at a time. */
  private codeModal: HTMLIonModalElement | null = null;
  private opening = false;
  private destroyed = false;

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private authService: AuthService,
  ) {}

  ngOnDestroy() {
    this.destroyed = true;
    this.codeModal?.dismiss(null, 'destroy').catch(() => undefined);
    this.codeModal = null;
  }

  get isEmpty(): boolean {
    const w = this.wallet;
    return !!w && w.available.length === 0 && w.unavailable.length === 0;
  }

  typeLabel(a: PartnerWalletAsset): string {
    if (a.type === 'cash_voucher') return 'Cash Voucher';
    if (a.type === 'pass') return 'Pass';
    return 'Reward';
  }

  detailLine(a: PartnerWalletAsset): string {
    if (a.type === 'cash_voucher' && a.remainingValue) {
      return `Balance: ${a.currency ?? ''} ${a.remainingValue}`.trim();
    }
    if (a.remainingUses != null && a.remainingUses > 1) return `${a.remainingUses} uses left`;
    return '';
  }

  statusLabel(a: PartnerWalletAsset): string {
    switch (a.availability) {
      case 'available':
        return 'SHOW CODE';
      case 'used':
        return 'USED';
      case 'expired':
        return 'EXPIRED';
      default:
        return 'UNAVAILABLE';
    }
  }

  /**
   * SHOW CODE: opens the voucher QR over My Vouchers (no navigation, so the route, tab and scroll
   * position stay put). Only for available vouchers; repeated taps while opening/open are ignored.
   */
  async showCode(asset: PartnerWalletAsset, event?: Event) {
    event?.stopPropagation();
    if (!asset.isAvailable || asset.availability !== 'available') return;
    if (!this.signedIn || this.opening || this.codeModal) return;
    this.opening = true;
    try {
      const session = await this.authService.getMemberSession();
      if (!session || this.destroyed) return;
      const modal = await this.modalCtrl.create({
        component: VoucherCodeModalComponent,
        componentProps: { asset, session, modalId: VOUCHER_CODE_MODAL_ID },
        id: VOUCHER_CODE_MODAL_ID,
        cssClass: 'voucher-code-modal',
        backdropDismiss: true,
      });
      // The member may have changed while the modal was being created: never show it then.
      if (this.destroyed || (await this.authService.getMemberSession()) !== session) return;
      this.codeModal = modal;
      modal.onDidDismiss<VoucherCodeModalResult>().then(({ data }) => {
        if (this.codeModal === modal) this.codeModal = null;
        if (data?.walletChanged && !this.destroyed) this.walletChanged.emit();
      });
      await modal.present();
    } finally {
      this.opening = false;
    }
  }

  /** Card tap: the full voucher detail page (description, member QR + voucher code). */
  open(asset: PartnerWalletAsset) {
    // Route parameter is the wallet asset id (never the reward definition id). No codes in the URL.
    this.router.navigate(['/voucher-detail', asset.assetId], {
      state: { partnerAsset: asset },
    });
  }

  trackByAsset(_: number, a: PartnerWalletAsset) {
    return a.assetId;
  }
}
