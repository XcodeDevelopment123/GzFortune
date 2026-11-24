import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { RewardApiService } from 'src/app/core/repo/api/reward-api.service';
import { PartnerOffer, pointsNumber, toPartnerError } from 'src/app/core/models/partner-reward.model';

/**
 * Detail of one Partner OFFER (a definition, not an owned item). Claiming always goes through the
 * Points tab, which shows the exact cost and asks for confirmation.
 */
@Component({
  selector: 'app-reward',
  templateUrl: './reward.page.html',
  styleUrls: ['./reward.page.scss'],
  standalone: false,
})
export class RewardPage implements OnInit, OnDestroy {
  offer?: PartnerOffer;
  signedIn = false;
  availablePoints: string | null = null;
  loaded = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private rewardApi: RewardApiService,
    private navCtrl: NavController,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.offer = window.history.state?.offer; // fast first paint; re-read below
    if (!id) {
      this.error = 'Something went wrong. Please try again later.';
      this.loaded = true;
      return;
    }

    this.rewardApi
      .getOffersForCurrentUser()
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.signedIn = res.signedIn;
          this.availablePoints = res.points?.available ?? null;
          this.offer = res.offers.find((o) => o.rewardId === id);
          if (!this.offer) this.error = 'This offer is no longer available.';
          this.loaded = true;
        },
        error: (err) => {
          this.error = toPartnerError(err).message;
          this.loaded = true;
        },
      });
  }

  isClaimable(o: PartnerOffer): boolean {
    return o.howToGet === 'points' && pointsNumber(o.pointsCost) > 0;
  }

  missingPoints(o: PartnerOffer): number {
    return Math.max(0, pointsNumber(o.pointsCost) - pointsNumber(this.availablePoints));
  }

  typeLabel(o: PartnerOffer): string {
    if (o.type === 'cash_voucher') return o.value ? `${o.currency ?? ''} ${o.value} Cash Voucher`.trim() : 'Cash Voucher';
    if (o.type === 'pass') return 'Pass';
    return 'Reward';
  }

  goToClaim() {
    if (!this.signedIn) {
      this.navCtrl.navigateForward('/auth/login');
      return;
    }
    this.navCtrl.navigateForward('/rewards', { queryParams: { tab: 'point' } });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
