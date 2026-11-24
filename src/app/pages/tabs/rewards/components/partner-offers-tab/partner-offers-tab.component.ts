import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { AlertController } from '@ionic/angular';
import {
  PartnerApiError,
  PartnerClaimResult,
  PartnerOffer,
  pointsNumber,
} from 'src/app/core/models/partner-reward.model';
import { RewardClaimService } from 'src/app/core/services/reward-claim.service';

/**
 * "Points" tab on the Warely Partner flow: claimable DEFINITIONS (not owned items).
 * Claiming always requires an explicit confirmation of the exact points cost.
 */
@Component({
  selector: 'app-partner-offers-tab',
  templateUrl: './partner-offers-tab.component.html',
  styleUrls: ['./partner-offers-tab.component.scss'],
  standalone: false,
})
export class PartnerOffersTabComponent implements OnChanges {
  @Input() offers: PartnerOffer[] = [];
  /** Spendable points as a decimal string from the backend. */
  @Input() availablePoints = '0';
  /** False for guests: offers are display-only. */
  @Input() signedIn = false;
  @Input() loaded = false;
  @Input() errorMessage: string | null = null;

  @Output() claimed = new EventEmitter<PartnerClaimResult>();
  @Output() signInRequested = new EventEmitter<void>();
  /** Ask the parent to reload offers + points (e.g. after a version conflict). */
  @Output() refreshRequested = new EventEmitter<void>();

  pendingRewardId: string | null = null;

  /**
   * Offers to render. Guests only see offers that can actually be claimed with points
   * (howToGet === 'points' and a positive, finite cost); signed-in members see the full list.
   */
  visibleOffers: PartnerOffer[] = [];

  constructor(
    private alertCtrl: AlertController,
    private claimService: RewardClaimService,
  ) {}

  ngOnChanges(): void {
    const offers = this.offers ?? [];
    this.visibleOffers = this.signedIn ? offers : offers.filter((o) => this.isClaimable(o));
  }

  get available(): number {
    return pointsNumber(this.availablePoints);
  }

  cost(offer: PartnerOffer): number {
    return pointsNumber(offer.pointsCost);
  }

  canAfford(offer: PartnerOffer): boolean {
    return this.isClaimable(offer) && this.cost(offer) <= this.available;
  }

  /** Gift-only definitions are shown as available offers but cannot be claimed with points. */
  isClaimable(offer: PartnerOffer): boolean {
    return offer.howToGet === 'points' && this.cost(offer) > 0;
  }

  typeLabel(offer: PartnerOffer): string {
    switch (offer.type) {
      case 'cash_voucher':
        return offer.value ? `${offer.currency ?? ''} ${offer.value} Cash Voucher`.trim() : 'Cash Voucher';
      case 'pass':
        return 'Pass';
      default:
        return 'Reward';
    }
  }

  trackById(_: number, o: PartnerOffer) {
    return `${o.rewardId}:${o.version}`;
  }

  async onClaimClicked(offer: PartnerOffer) {
    if (!this.isClaimable(offer)) return;
    if (!this.signedIn) {
      this.signInRequested.emit();
      return;
    }
    if (this.pendingRewardId || !this.canAfford(offer)) return;

    const remaining = this.available - this.cost(offer);
    const alert = await this.alertCtrl.create({
      header: 'Claim with points',
      message: `Use ${offer.pointsCost} points to claim "${offer.name}"? You have ${this.availablePoints} points; ${remaining} will remain.`,
      cssClass: 'juicy-alert',
      backdropDismiss: false,
      buttons: [
        { text: 'Cancel', role: 'cancel', cssClass: 'alert-button-cancel' },
        { text: `Use ${offer.pointsCost} points`, role: 'confirm', cssClass: 'alert-button-confirm' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') this.submitClaim(offer);
  }

  private submitClaim(offer: PartnerOffer) {
    if (this.pendingRewardId) return; // no double submission
    this.pendingRewardId = offer.rewardId;

    this.claimService.claim(offer).subscribe({
      next: (result) => {
        this.pendingRewardId = null;
        this.claimed.emit(result);
      },
      error: (e: PartnerApiError) => {
        this.pendingRewardId = null;
        this.showFailure(offer, e);
      },
    });
  }

  private async showFailure(offer: PartnerOffer, e: PartnerApiError) {
    if (e.code === 'member_session_required') {
      this.signInRequested.emit();
      return;
    }

    const buttons: any[] = [{ text: 'OK', role: 'cancel', cssClass: 'alert-button-cancel' }];
    if (e.retryable) {
      // Same claimId is reused automatically, so a retry cannot deduct twice.
      buttons.push({ text: 'Try again', role: 'confirm', cssClass: 'alert-button-confirm' });
    }
    const alert = await this.alertCtrl.create({
      header: e.retryable ? 'Claim not confirmed yet' : 'Claim failed',
      message: e.message + (e.traceId ? ` (Ref: ${e.traceId})` : ''),
      cssClass: 'juicy-alert',
      backdropDismiss: false,
      buttons,
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();

    if (e.retryable && role === 'confirm') {
      this.submitClaim(offer);
    } else if (!e.retryable) {
      // Costs, versions or eligibility may have changed: reload before the member tries again.
      this.refreshRequested.emit();
    }
  }
}
