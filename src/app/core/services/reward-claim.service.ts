import { inject, Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { from, Observable, throwError } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import {
  PartnerClaimResult,
  PartnerOffer,
  toPartnerError,
} from '../models/partner-reward.model';
import { RewardApiService } from '../repo/api/reward-api.service';

const KEY_PREFIX = 'pendingRewardClaim:';

export function newUuid(): string {
  const c: Crypto | undefined = (globalThis as any).crypto;
  if (c && typeof (c as any).randomUUID === 'function') return (c as any).randomUUID();
  const b = new Uint8Array(16);
  c!.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/**
 * One intended points claim = one UUID. The UUID is persisted BEFORE the request and reused unchanged
 * when the outcome was unknown (timeout, app killed, 503), so the backend/Warely never deduct twice.
 * It is cleared only after a definitive result (success, or a definitive rejection).
 */
@Injectable({ providedIn: 'root' })
export class RewardClaimService {
  private rewardApi = inject(RewardApiService);
  private inFlight = new Set<string>();

  private key(offer: Pick<PartnerOffer, 'rewardId' | 'version'>): string {
    return `${KEY_PREFIX}${offer.rewardId}:${offer.version}`;
  }

  isPending(rewardId: string): boolean {
    return this.inFlight.has(rewardId);
  }

  async getOrCreateClaimId(offer: Pick<PartnerOffer, 'rewardId' | 'version'>): Promise<string> {
    const key = this.key(offer);
    const { value } = await Preferences.get({ key });
    if (value) return value;
    const id = newUuid();
    await Preferences.set({ key, value: id });
    return id;
  }

  async clearClaimId(offer: Pick<PartnerOffer, 'rewardId' | 'version'>): Promise<void> {
    await Preferences.remove({ key: this.key(offer) });
  }

  /** Call only after the member explicitly confirmed `offer.pointsCost`. */
  claim(offer: PartnerOffer): Observable<PartnerClaimResult> {
    if (this.inFlight.has(offer.rewardId)) {
      return throwError(() => ({
        status: 0,
        code: 'claim_in_progress',
        message: 'Your claim is being processed.',
        retryable: false,
      }));
    }
    this.inFlight.add(offer.rewardId);

    return from(this.getOrCreateClaimId(offer)).pipe(
      switchMap((claimId) =>
        this.rewardApi.claimReward({
          claimId,
          rewardId: offer.rewardId,
          version: offer.version,
          confirmedPointsCost: offer.pointsCost,
        }),
      ),
      switchMap((result) => from(this.clearClaimId(offer)).pipe(switchMap(() => [result]))),
      catchError((err) => {
        const e = toPartnerError(err);
        // Unknown outcome → keep the UUID for the retry. Definitive rejection → forget it.
        const keep = e.retryable || e.code === 'member_session_required';
        return from(keep ? Promise.resolve() : this.clearClaimId(offer)).pipe(
          switchMap(() => throwError(() => e)),
        );
      }),
      finalize(() => this.inFlight.delete(offer.rewardId)),
    );
  }
}
