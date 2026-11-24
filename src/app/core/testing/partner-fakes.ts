import { Subject } from 'rxjs';
import { PartnerWallet, PartnerWalletAsset } from '../models/partner-reward.model';

/** Test double for AuthService's member-session API. */
export class FakeAuth {
  session: string | null = null;
  readonly changed = new Subject<string | null>();
  readonly memberSessionChanged$ = this.changed.asObservable();

  async getMemberSession() {
    return this.session;
  }

  /** Simulates login/logout: stores the session and emits the change. */
  setSession(token: string | null) {
    this.session = token;
    this.changed.next(token);
  }

  async removeMemberSession() {
    this.setSession(null);
  }

  async removeMemberSessionIfCurrent(token: string | null) {
    if (token && this.session === token) this.setSession(null);
  }
}

export interface PendingCall<T = any> {
  args: any[];
  /** Session that was active when the request was made (what the interceptor would send). */
  session: string | null;
  subject: Subject<T>;
}

/** Test double for RewardApiService; every call stays pending until the test completes it. */
export class FakeRewardApi {
  walletCalls: PendingCall<PartnerWallet>[] = [];
  memberOfferCalls: PendingCall[] = [];
  guestOfferCalls: PendingCall[] = [];
  assetCodeCalls: PendingCall[] = [];
  memberCodeCalls: PendingCall[] = [];

  constructor(private auth: FakeAuth) {}

  private pending<T>(list: PendingCall<T>[], args: any[]) {
    const subject = new Subject<T>();
    list.push({ args, session: this.auth.session, subject });
    return subject.asObservable();
  }

  getMyWallet() {
    return this.pending(this.walletCalls, []);
  }
  getMemberOffers() {
    return this.pending(this.memberOfferCalls, []);
  }
  getGuestOffers() {
    return this.pending(this.guestOfferCalls, []);
  }
  getAssetCode(assetId: string) {
    return this.pending(this.assetCodeCalls, [assetId]);
  }
  getMemberCode() {
    return this.pending(this.memberCodeCalls, []);
  }
}

export function respond<T>(call: PendingCall<T>, value: T) {
  call.subject.next(value);
  call.subject.complete();
}

export function fail(call: PendingCall, status: number, code: string) {
  call.subject.error({ status, error: { code, message: code, retryable: false } });
}

export function asset(assetId: string, owner: string, isAvailable = true): PartnerWalletAsset {
  return {
    assetId,
    rewardId: 'r-' + assetId,
    name: `${owner} voucher`,
    type: 'reward',
    status: isAvailable ? 'active' : 'redeemed',
    availability: isAvailable ? 'available' : 'used',
    isAvailable,
  };
}

export function walletOf(...assets: PartnerWalletAsset[]): PartnerWallet {
  return { available: assets.filter((a) => a.isAvailable), unavailable: assets.filter((a) => !a.isAvailable) };
}

/** Lets pending promise continuations (awaited session reads) run. */
export async function settle(times = 6) {
  for (let i = 0; i < times; i++) await new Promise((r) => setTimeout(r, 0));
}
