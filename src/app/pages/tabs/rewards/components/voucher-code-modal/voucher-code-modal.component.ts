import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { forkJoin, of, Subject, Subscription } from 'rxjs';
import { catchError, take, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { RewardApiService } from 'src/app/core/repo/api/reward-api.service';
import { PartnerAssetCode, PartnerWalletAsset, toPartnerError } from 'src/app/core/models/partner-reward.model';

/** Result passed to onDidDismiss when the wallet should be re-read (e.g. the voucher was used at POS). */
export interface VoucherCodeModalResult {
  walletChanged?: boolean;
}

/**
 * Counter codes opened over My Vouchers: Step 1 member QR (scanned first), Step 2 the voucher's
 * QR + Code 128 barcode. Both are fetched on demand (voucher code by wallet asset id) for the
 * member session the modal was opened with. Same rules as the voucher-detail page: responses from
 * an older request or a changed session are dropped, and the code is cleared on close. A session
 * change (sign-out, account switch, expiry) dismisses the modal.
 */
@Component({
  selector: 'app-voucher-code-modal',
  templateUrl: './voucher-code-modal.component.html',
  styleUrls: ['./voucher-code-modal.component.scss'],
  standalone: false,
})
export class VoucherCodeModalComponent implements OnInit, OnDestroy {
  @Input() asset!: PartnerWalletAsset;
  /** Member session the modal was opened with. */
  @Input() session!: string;
  /** Id of the ion-modal hosting this component, so only this modal is dismissed. */
  @Input() modalId?: string;

  /** Sensitive payload: rendered only, never logged, cleared on close. */
  code: PartnerAssetCode | null = null;
  memberQr: string | null = null;
  loading = false;
  error: string | null = null;
  qrScale = 8;

  /** Incremented by every load / clear; responses from an older generation are dropped. */
  private seq = 0;
  private closed = false;
  private walletChanged = false;
  private codeSub?: Subscription;
  private destroy$ = new Subject<void>();

  constructor(
    private modalCtrl: ModalController,
    private rewardApi: RewardApiService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    const w = window.innerWidth;
    this.qrScale = w > 430 ? 7 : w > 380 ? 6 : 5;
    this.authService.memberSessionChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((token) => {
        if (token !== this.session) this.close('session');
      });
    this.load();
  }

  ngOnDestroy() {
    this.closed = true;
    this.clear();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Fetches both codes. Ignored while a request is already running (rapid taps on Retry). */
  load() {
    if (this.closed || this.loading || !this.asset?.isAvailable || !this.session) return;
    const seq = ++this.seq;
    const assetId = this.asset.assetId;
    this.loading = true;
    this.error = null;
    this.code = null;
    this.memberQr = null;
    this.codeSub?.unsubscribe();

    let memberExpired = false;
    this.codeSub = forkJoin({
      code: this.rewardApi.getAssetCode(assetId).pipe(take(1)),
      // A member-QR failure alone does not hide the voucher code (same as the voucher-detail page).
      member: this.rewardApi.getMemberCode().pipe(
        take(1),
        catchError((err) => {
          memberExpired = toPartnerError(err).code === 'member_session_required';
          return of(null);
        }),
      ),
    }).subscribe({
        next: async ({ code, member }) => {
          if (seq !== this.seq) return;
          if (memberExpired) return this.sessionExpired();
          if (await this.isStale(seq)) return;
          this.loading = false;
          if (code?.assetId && code.assetId !== assetId) {
            this.error = 'Something went wrong. Please try again.';
            return;
          }
          this.code = code;
          this.memberQr = member?.qrPayload ?? null;
        },
        error: async (err) => {
          if (seq !== this.seq) return;
          const e = toPartnerError(err);
          if (e.code === 'member_session_required') return this.sessionExpired();
          if (await this.isStale(seq)) return;
          this.loading = false;
          this.code = null;
          this.memberQr = null;
          this.error = e.message;
          // 409 asset_unavailable: the wallet changed (e.g. used at POS) — My Vouchers re-reads it on close.
          if (e.code === 'asset_unavailable') this.walletChanged = true;
        },
      });
  }

  retry() {
    this.load();
  }

  /** Clears the code and dismisses this modal. */
  close(role: 'close' | 'session' = 'close') {
    if (this.closed) return;
    this.closed = true;
    this.clear();
    const data: VoucherCodeModalResult = { walletChanged: this.walletChanged };
    this.modalCtrl.dismiss(data, role, this.modalId).catch(() => undefined);
  }

  private async sessionExpired() {
    this.close('session');
    // Only drop the session the failed request used; a newer login is kept.
    await this.authService.removeMemberSessionIfCurrent(this.session);
  }

  private clear() {
    this.seq++;
    this.codeSub?.unsubscribe();
    this.codeSub = undefined;
    this.code = null;
    this.memberQr = null;
    this.loading = false;
    this.error = null;
  }

  private async isStale(seq: number): Promise<boolean> {
    if (seq !== this.seq) return true;
    const current = await this.authService.getMemberSession();
    if (seq !== this.seq) return true;
    if (current !== this.session) {
      this.close('session'); // the member changed while the request was in flight
      return true;
    }
    return false;
  }
}
