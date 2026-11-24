import { Component, Input, OnChanges } from '@angular/core';
import { PartnerOffer, pointsNumber } from 'src/app/core/models/partner-reward.model';

/** Home strip of Partner offers (definitions). Claiming happens on the Rewards → Points tab. */
@Component({
  selector: 'app-reward-list',
  templateUrl: './reward-list.component.html',
  styleUrls: ['./reward-list.component.scss'],
  standalone: false,
})
export class RewardListComponent implements OnChanges {
  @Input() rewards: PartnerOffer[] = [];
  /** Spendable points for the signed-in member; null for guests. */
  @Input() availablePoints: string | null = null;
  @Input() isLoaded: boolean = false;

  /**
   * Offers to render. Guests only see offers claimable with points (howToGet === 'points'
   * and a positive, finite cost); signed-in members see the full list.
   */
  visibleRewards: PartnerOffer[] = [];

  get isGuest(): boolean {
    return this.availablePoints === null;
  }

  ngOnChanges(): void {
    const rewards = this.rewards ?? [];
    this.visibleRewards = this.isGuest ? rewards.filter((o) => this.isClaimable(o)) : rewards;
  }

  isClaimable(o: PartnerOffer): boolean {
    return o.howToGet === 'points' && pointsNumber(o.pointsCost) > 0;
  }

  missingPoints(o: PartnerOffer): number {
    return Math.max(0, pointsNumber(o.pointsCost) - pointsNumber(this.availablePoints));
  }
}
