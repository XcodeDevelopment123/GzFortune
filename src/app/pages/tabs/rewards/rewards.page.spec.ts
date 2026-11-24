import { of } from 'rxjs';
import { RewardsPage } from './rewards.page';
import { FakeAuth, FakeRewardApi, asset, fail, respond, settle, walletOf } from 'src/app/core/testing/partner-fakes';

describe('RewardsPage (member session isolation)', () => {
  let auth: FakeAuth;
  let api: FakeRewardApi;
  let page: RewardsPage;
  const points = (available: string) => ({ available, balance: available, reserved: '0', tier: 'Gold' });

  beforeEach(() => {
    auth = new FakeAuth();
    api = new FakeRewardApi(auth);
    page = new RewardsPage(
      api as any,
      { queryParams: of({}) } as any,
      auth as any,
      { navigate: jasmine.createSpy('navigate') } as any,
      { navigateForward: jasmine.createSpy('navigateForward') } as any,
    );
  });

  afterEach(() => page.ngOnDestroy());

  async function signInAndLoad(session: string, walletAssetId: string) {
    auth.setSession(session);
    await settle();
    const w = api.walletCalls[api.walletCalls.length - 1];
    const o = api.memberOfferCalls[api.memberOfferCalls.length - 1];
    respond(o, { offers: [], points: points(session === 'A' ? '100' : '5') });
    respond(w, walletOf(asset(walletAssetId, session)));
    await settle();
  }

  it('guests never request or see member wallet data', async () => {
    page.ngOnInit();
    await settle();

    expect(api.walletCalls.length).toBe(0);
    expect(api.memberOfferCalls.length).toBe(0);
    expect(api.guestOfferCalls.length).toBe(1);
    expect(page.signedIn).toBeFalse();
    expect(page.wallet).toBeNull();
    expect(page.points).toBeNull();
  });

  it('switching members clears the previous wallet, points, highlight and errors immediately', async () => {
    page.ngOnInit();
    await settle();
    await signInAndLoad('A', 'asset-A');
    page.highlightAssetId = 'asset-A';
    expect(page.wallet!.available[0].assetId).toBe('asset-A');

    auth.setSession('B');
    await settle();

    expect(page.wallet).toBeNull();
    expect(page.points).toBeNull();
    expect(page.offers).toEqual([]);
    expect(page.highlightAssetId).toBeNull();
    expect(page.walletLoaded).toBeFalse(); // loading state for B, not A's data
    expect(page.walletError).toBeNull();
  });

  it('ignores responses that complete out of order after an account switch', async () => {
    page.ngOnInit();
    await settle();
    auth.setSession('A');
    await settle();
    const aWallet = api.walletCalls[api.walletCalls.length - 1];
    const aOffers = api.memberOfferCalls[api.memberOfferCalls.length - 1];

    auth.setSession('B');
    await settle();
    const bWallet = api.walletCalls[api.walletCalls.length - 1];
    const bOffers = api.memberOfferCalls[api.memberOfferCalls.length - 1];
    expect(bWallet.session).toBe('B');

    // B finishes first, then A's late responses arrive.
    respond(bOffers, { offers: [], points: points('5') });
    respond(bWallet, walletOf(asset('asset-B', 'B')));
    await settle();
    respond(aOffers, { offers: [], points: points('100') });
    respond(aWallet, walletOf(asset('asset-A', 'A')));
    await settle();

    expect(page.wallet!.available.map((a) => a.assetId)).toEqual(['asset-B']);
    expect(page.points!.available).toBe('5');
  });

  it('discards a response when the session changed while it was in flight', async () => {
    page.ngOnInit();
    await settle();
    auth.setSession('A');
    await settle();
    const aWallet = api.walletCalls[api.walletCalls.length - 1];
    const aOffers = api.memberOfferCalls[api.memberOfferCalls.length - 1];

    auth.session = 'B'; // changed in storage without a change event
    respond(aOffers, { offers: [], points: points('100') });
    respond(aWallet, walletOf(asset('asset-A', 'A')));
    await settle();

    expect(page.wallet).toBeNull();
    expect(api.walletCalls[api.walletCalls.length - 1].session).toBe('B'); // reloaded for B
  });

  it('does not keep showing the previous wallet when a wallet request fails', async () => {
    page.ngOnInit();
    await settle();
    await signInAndLoad('A', 'asset-A');

    const reload = page.load();
    await settle();
    respond(api.memberOfferCalls[api.memberOfferCalls.length - 1], { offers: [], points: points('100') });
    fail(api.walletCalls[api.walletCalls.length - 1], 503, 'partner_unavailable');
    await reload;
    await settle();

    expect(page.wallet).toBeNull();
    expect(page.walletError).toBe('partner_unavailable');
  });

  it('an expired session falls back to the guest view without wallet data', async () => {
    page.ngOnInit();
    await settle();
    await signInAndLoad('A', 'asset-A');

    page.load();
    await settle();
    respond(api.memberOfferCalls[api.memberOfferCalls.length - 1], { offers: [], points: points('100') });
    fail(api.walletCalls[api.walletCalls.length - 1], 401, 'member_session_required');
    await settle();

    expect(auth.session).toBeNull();
    expect(page.signedIn).toBeFalse();
    expect(page.wallet).toBeNull();
    expect(page.points).toBeNull();
    expect(api.guestOfferCalls.length).toBeGreaterThan(0);
  });

  it('a late session-expired response does not sign out a member who logged in since', async () => {
    page.ngOnInit();
    await settle();
    auth.setSession('A');
    await settle();
    const aWallet = api.walletCalls[api.walletCalls.length - 1];
    const aOffers = api.memberOfferCalls[api.memberOfferCalls.length - 1];
    auth.setSession('B');
    await settle();

    respond(aOffers, { offers: [], points: points('100') });
    fail(aWallet, 401, 'member_session_required');
    await settle();

    expect(auth.session).toBe('B');
  });
});
