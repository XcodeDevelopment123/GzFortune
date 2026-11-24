import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { forkJoin, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';

import { RewardPageTabs } from 'src/app/shared/statics/interface-helper';
import { RewardApiService } from 'src/app/core/repo/api/reward-api.service';
import { AuthService } from 'src/app/core/services/auth.service';
import {
  PartnerApiError,
  PartnerClaimResult,
  PartnerMemberOffers,
  PartnerOffer,
  PartnerPoints,
  PartnerWallet,
  toPartnerError,
} from 'src/app/core/models/partner-reward.model';

type Outcome<T> = { ok: true; value: T } | { ok: false; error: PartnerApiError };

/**
 * Rewards tab, backed only by the Warely Partner API through our backend.
 * "My Vouchers" = assets this account owns (wallet). "Points" = offers that can be claimed.
 *
 * Every load is bound to the member session it started under. A newer load cancels older requests,
 * and a response is applied only if the member session is still the same, so one member's wallet can
 * never be shown to another member (or to a guest).
 */
@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.page.html',
  styleUrls: ['./rewards.page.scss'],
  standalone: false,
})
export class RewardsPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private initialised = false;

  /** Incremented by every load; a load whose number is no longer current is ignored. */
  private loadSeq = 0;
  private inflight?: Subscription;
  /** Member session the displayed data belongs to (undefined = nothing loaded yet). */
  private activeSession: string | null | undefined = undefined;

  selectedTab: RewardPageTabs = 'voucher';

  signedIn = false;
  offers: PartnerOffer[] = [];
  points: PartnerPoints | null = null;
  wallet: PartnerWallet | null = null;
  offersLoaded = false;
  walletLoaded = false;
  offersError: string | null = null;
  walletError: string | null = null;
  highlightAssetId: string | null = null;

  constructor(
    private rewardApi: RewardApiService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private navCtrl: NavController,
  ) {}

  ngOnInit() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const tab = params['tab'];
      if (tab === 'voucher' || tab === 'point') this.selectedTab = tab;
    });
    // Sign-out, login as another member or an expired session: drop the old data immediately.
    this.authService.memberSessionChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => this.load());
    this.load().finally(() => (this.initialised = true));
  }

  ionViewWillEnter() {
    // Re-check the session and re-read points/wallet when coming back (e.g. after login or a POS sale).
    if (this.initialised) this.load();
  }

  changeTab(tab: RewardPageTabs) {
    this.selectedTab = tab;
  }

  /** Clears everything that belongs to a member session. */
  private resetMemberState() {
    this.offers = [];
    this.points = null;
    this.wallet = null;
    this.highlightAssetId = null;
    this.offersError = null;
    this.walletError = null;
    this.offersLoaded = false;
    this.walletLoaded = false;
  }

  async load(): Promise<void> {
    const seq = ++this.loadSeq;
    this.inflight?.unsubscribe();
    this.inflight = undefined;

    const session = await this.authService.getMemberSession();
    if (seq !== this.loadSeq) return; // a newer load started while reading the session

    if (session !== this.activeSession) {
      this.resetMemberState();
      this.activeSession = session;
    }
    this.signedIn = !!session;
    this.offersError = null;
    this.walletError = null;

    if (!session) {
      // Guests: public offers only. No wallet request at all.
      this.wallet = null;
      this.points = null;
      this.highlightAssetId = null;
      this.walletLoaded = true;
      return this.run(seq, session, outcome(this.rewardApi.getGuestOffers()).pipe(map((offers) => ({ offers }))), (r) => {
        if (r.offers.ok) {
          this.offers = r.offers.value;
        } else {
          this.offers = [];
          this.offersError = r.offers.error.message;
        }
        this.offersLoaded = true;
      });
    }

    return this.run(
      seq,
      session,
      forkJoin({
        offers: outcome(this.rewardApi.getMemberOffers()),
        wallet: outcome(this.rewardApi.getMyWallet()),
      }),
      (r) => {
        const expired = [r.offers, r.wallet].some((x) => !x.ok && x.error.code === 'member_session_required');
        if (expired) {
          // Only remove the session these requests were made with; a newer login is kept.
          // (removal emits memberSessionChanged$, which triggers a fresh guest load)
          this.authService.removeMemberSessionIfCurrent(session);
          this.resetMemberState();
          this.signedIn = false;
          this.walletLoaded = true;
          return;
        }

        if (r.offers.ok) {
          this.offers = r.offers.value.offers;
          this.points = r.offers.value.points;
        } else {
          this.offers = [];
          this.points = null;
          this.offersError = r.offers.error.message;
        }
        this.offersLoaded = true;

        if (r.wallet.ok) {
          this.wallet = r.wallet.value;
        } else {
          this.wallet = null; // never keep showing a wallet we could not confirm
          this.walletError = r.wallet.error.message;
        }
        this.walletLoaded = true;
      },
    );
  }

  /**
   * Subscribes to `source` for load `seq`, applies the result only if that load is still current and
   * the stored member session is still the one it started with. Resolves when the load settles.
   */
  private run<T>(seq: number, session: string | null, source: Observable<T>, apply: (value: T) => void): Promise<void> {
    return new Promise<void>((resolve) => {
      let settled = false;
      const done = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };
      const sub = source.pipe(takeUntil(this.destroy$)).subscribe({
        next: async (value) => {
          const current = await this.authService.getMemberSession();
          if (seq === this.loadSeq && current === session) {
            apply(value);
          } else if (seq === this.loadSeq) {
            // Session changed while this request was in flight: discard and load for the new session.
            this.load();
          }
          done();
        },
        error: () => done(),
        complete: () => done(),
      });
      sub.add(done); // cancelled by a newer load
      this.inflight = sub;
    });
  }

  /** After a successful points claim: show refreshed points + wallet, then go to My Vouchers. */
  async onClaimed(result: PartnerClaimResult) {
    // The claim was made under the displayed session; ignore it if the member has changed since.
    const current = await this.authService.getMemberSession();
    if (!current || current !== this.activeSession) {
      this.load();
      return;
    }
    if (result.points) this.points = result.points;
    if (result.wallet) this.wallet = result.wallet;
    this.highlightAssetId = result.asset.assetId;
    this.selectedTab = 'voucher';
    this.router.navigate(['/rewards'], { queryParams: { tab: 'voucher' }, replaceUrl: true });
    // Re-read from Warely in any case (authoritative). Same session, so the highlight is kept.
    await this.load();
  }

  onSignInRequested() {
    this.navCtrl.navigateForward('/auth/login');
  }

  doRefresh(event: any) {
    this.load().finally(() => event.target.complete());
  }

  ngOnDestroy() {
    this.inflight?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}

function outcome<T>(source: Observable<T>): Observable<Outcome<T>> {
  return source.pipe(
    map((value) => ({ ok: true as const, value })),
    catchError((err) => of({ ok: false as const, error: toPartnerError(err) })),
  );
}
