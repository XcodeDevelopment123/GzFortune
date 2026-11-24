import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AuthService } from '../../services/auth.service';
import {
  PartnerAssetCode,
  PartnerClaimRequest,
  PartnerClaimResult,
  PartnerMemberCode,
  PartnerMemberOffers,
  PartnerOffer,
  PartnerPoints,
  PartnerWallet,
} from '../../models/partner-reward.model';

/**
 * Rewards, vouchers and points via our backend's /PartnerRewards endpoints (Warely Partner API).
 * The member is identified by the X-Member-Session header only; no phone/contactId/externalId is sent.
 */
@Injectable({ providedIn: 'root' })
export class RewardApiService {
  private baseApi = inject(BaseApiService);
  private authService = inject(AuthService);

  private partnerCtrl: string = '/PartnerRewards';

  /** Available offers a guest may browse (rewards and vouchers; not owned items). */
  getGuestOffers(): Observable<PartnerOffer[]> {
    return this.baseApi.get<PartnerOffer[]>(`${this.partnerCtrl}/offers`);
  }

  /** Offers this member can claim with points now + spendable points. */
  getMemberOffers(): Observable<PartnerMemberOffers> {
    return this.baseApi.get<PartnerMemberOffers>(`${this.partnerCtrl}/me/offers`);
  }

  /** Member offers when signed in, otherwise guest offers (points = null). */
  getOffersForCurrentUser(): Observable<PartnerMemberOffers & { signedIn: boolean }> {
    return from(this.authService.getMemberSession()).pipe(
      switchMap((session) =>
        session
          ? this.getMemberOffers().pipe(map((r) => ({ ...r, signedIn: true })))
          : this.getGuestOffers().pipe(map((offers) => ({ offers, points: null as any, signedIn: false }))),
      ),
    );
  }

  getPartnerPoints(): Observable<PartnerPoints> {
    return this.baseApi.get<PartnerPoints>(`${this.partnerCtrl}/me/points`);
  }

  /** "My Vouchers": assets this account owns (Partner wallet, all pages). */
  getMyWallet(): Observable<PartnerWallet> {
    return this.baseApi.get<PartnerWallet>(`${this.partnerCtrl}/me/wallet`);
  }

  /** Points claim (POST .../issue with issue_method=points on the backend). Retry with the SAME claimId. */
  claimReward(req: PartnerClaimRequest): Observable<PartnerClaimResult> {
    return this.baseApi.post<PartnerClaimResult>(`${this.partnerCtrl}/me/claims`, req);
  }

  /** QR + Code 128 payloads of one owned asset. assetId is the wallet asset id, never a reward id. */
  getAssetCode(assetId: string): Observable<PartnerAssetCode> {
    return this.baseApi.get<PartnerAssetCode>(
      `${this.partnerCtrl}/me/wallet/${encodeURIComponent(assetId)}/code`,
    );
  }

  /** Member QR: scanned at the counter before the benefit code. */
  getMemberCode(): Observable<PartnerMemberCode> {
    return this.baseApi.get<PartnerMemberCode>(`${this.partnerCtrl}/me/member-code`);
  }
}
