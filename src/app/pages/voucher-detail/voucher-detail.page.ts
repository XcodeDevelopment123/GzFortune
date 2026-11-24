import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { forkJoin, of, Subject, Subscription } from 'rxjs';
import { catchError, take, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { RewardApiService } from 'src/app/core/repo/api/reward-api.service';
import {
  PartnerAssetCode,
  PartnerWalletAsset,
  toPartnerError,
} from 'src/app/core/models/partner-reward.model';

/**
 * Detail of one OWNED wallet asset; the route id is the wallet asset_id.
 *
 * Nothing is shown until the CURRENT member's wallet has been re-read and contains that asset_id.
 * The session is re-checked every time the page becomes visible and whenever it changes; older
 * wallet/code requests are cancelled and their late responses ignored. Asset, member QR, voucher QR
 * and barcode are cleared on leave, sign-out, account switch and session expiry.
 */
@Component({
  selector: 'app-voucher-detail',
  templateUrl: './voucher-detail.page.html',
  styleUrls: ['./voucher-detail.page.scss'],
  standalone: false,
})
export class VoucherDetailPage implements OnInit, OnDestroy {
  /** False for guests: no wallet asset or code is requested or displayed. */
  signedIn = false;
  /** True once the session has been read at least once (avoids flashing the guest prompt). */
  sessionChecked = false;
  partnerAsset?: PartnerWalletAsset;
  partnerLoading = false;
  partnerError: string | null = null;
  /** Sensitive payloads: rendered only, never logged, cleared on leave. */
  assetCode: PartnerAssetCode | null = null;
  memberQr: string | null = null;
  codesLoading = false;
  codesError: string | null = null;
  qrScale = 6;

  private assetId: string | null = null;
  /** Incremented by every refresh / clear; responses from an older generation are dropped. */
  private seq = 0;
  /** Session the current requests were made with. */
  private requestSession: string | null = null;
  private walletSub?: Subscription;
  private codeSub?: Subscription;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private rewardApi: RewardApiService,
    private authService: AuthService,
    private navCtrl: NavController,
  ) {}

  ngOnInit() {
    this.assetId = this.route.snapshot.paramMap.get('id');
    this.qrScale = window.innerWidth > 400 ? 7 : 6;
    // Sign-out, account switch or expiry while the page is open.
    this.authService.memberSessionChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => this.refresh());
  }

  ionViewWillEnter() {
    this.refresh();
  }

  ionViewWillLeave() {
    this.clear();
  }

  ngOnDestroy() {
    this.clear();
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToLogin() {
    this.navCtrl.navigateForward('/auth/login');
  }

  /** Cancels outstanding requests and wipes everything member-specific. */
  clear() {
    this.seq++;
    this.walletSub?.unsubscribe();
    this.codeSub?.unsubscribe();
    this.walletSub = undefined;
    this.codeSub = undefined;
    this.partnerAsset = undefined;
    this.assetCode = null;
    this.memberQr = null;
    this.partnerLoading = false;
    this.codesLoading = false;
    this.partnerError = null;
    this.codesError = null;
  }

  /** Re-checks the session, re-reads the wallet and only then shows the asset and fetches its codes. */
  async refresh(): Promise<void> {
    this.clear();
    const seq = this.seq;
    const session = await this.authService.getMemberSession();
    if (seq !== this.seq) return;

    this.requestSession = session;
    this.signedIn = !!session;
    this.sessionChecked = true;
    if (!session) return; // guest: no wallet or code request

    if (!this.assetId) {
      this.partnerError = 'Something went wrong. Please try again later.';
      return;
    }
    this.loadPartnerAsset(this.assetId, seq, session);
  }

  private async isStale(seq: number, session: string): Promise<boolean> {
    if (seq !== this.seq) return true;
    const current = await this.authService.getMemberSession();
    if (seq !== this.seq) return true;
    if (current !== session) {
      this.refresh(); // the member changed while the request was in flight
      return true;
    }
    return false;
  }

  private async sessionExpired(session: string) {
    this.clear();
    this.signedIn = false;
    // Only drop the session the failed request used; a newer login is kept (and re-shown via refresh).
    await this.authService.removeMemberSessionIfCurrent(session);
  }

  private loadPartnerAsset(assetId: string, seq: number, session: string) {
    this.partnerLoading = true;
    this.walletSub = this.rewardApi
      .getMyWallet()
      .pipe(take(1))
      .subscribe({
        next: async (wallet) => {
          if (await this.isStale(seq, session)) return;
          this.partnerLoading = false;
          const asset = [...wallet.available, ...wallet.unavailable].find((a) => a.assetId === assetId);
          if (!asset) {
            this.partnerAsset = undefined;
            this.partnerError = 'This voucher is not in your account.';
            return;
          }
          this.partnerAsset = asset;
          if (asset.isAvailable) this.loadCodes(seq, session);
        },
        error: async (err) => {
          if (seq !== this.seq) return;
          const e = toPartnerError(err);
          if (e.code === 'member_session_required') return this.sessionExpired(session);
          if (await this.isStale(seq, session)) return;
          this.partnerLoading = false;
          this.partnerAsset = undefined;
          this.partnerError = e.message;
        },
      });
  }

  /** Member QR (scanned first) and the benefit QR/Code 128 (scanned second), fetched by asset_id. */
  loadCodes(seq: number = this.seq, session: string | null = this.requestSession) {
    if (!this.partnerAsset?.isAvailable || !session || seq !== this.seq) return;
    const assetId = this.partnerAsset.assetId;
    this.codesLoading = true;
    this.codesError = null;
    this.assetCode = null;
    this.memberQr = null;
    this.codeSub?.unsubscribe();

    let memberExpired = false;
    this.codeSub = forkJoin({
      code: this.rewardApi.getAssetCode(assetId),
      member: this.rewardApi.getMemberCode().pipe(
        catchError((err) => {
          memberExpired = toPartnerError(err).code === 'member_session_required';
          return of(null);
        }),
      ),
    }).subscribe({
      next: async ({ code, member }) => {
        if (memberExpired) return this.sessionExpired(session);
        if (await this.isStale(seq, session)) return;
        if (this.partnerAsset?.assetId !== assetId) return;
        this.assetCode = code;
        this.memberQr = member?.qrPayload ?? null;
        this.codesLoading = false;
      },
      error: async (err) => {
        if (seq !== this.seq) return;
        const e = toPartnerError(err);
        if (e.code === 'member_session_required') return this.sessionExpired(session);
        if (await this.isStale(seq, session)) return;
        this.codesLoading = false;
        this.assetCode = null;
        this.memberQr = null;
        this.codesError = e.message;
        // 409 asset_unavailable: the wallet changed (e.g. used at POS) — re-read it so the page reflects reality.
        if (e.code === 'asset_unavailable') this.refresh();
      },
    });
  }

  partnerTypeLabel(a: PartnerWalletAsset): string {
    if (a.type === 'cash_voucher') return 'Cash Voucher';
    if (a.type === 'pass') return 'Pass';
    return 'Reward';
  }

  partnerUnavailableLabel(a: PartnerWalletAsset): string {
    switch (a.availability) {
      case 'used':
        return 'USED';
      case 'expired':
        return 'EXPIRED';
      default:
        return 'UNAVAILABLE';
    }
  }
}
