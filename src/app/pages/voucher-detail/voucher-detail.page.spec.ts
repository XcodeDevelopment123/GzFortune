import { VoucherDetailPage } from './voucher-detail.page';
import { FakeAuth, FakeRewardApi, asset, fail, respond, settle, walletOf } from 'src/app/core/testing/partner-fakes';

describe('VoucherDetailPage (session-checked asset and codes)', () => {
  const ASSET = '10000000-0000-4000-8000-000000000010';
  let auth: FakeAuth;
  let api: FakeRewardApi;
  let page: VoucherDetailPage;

  beforeEach(() => {
    auth = new FakeAuth();
    api = new FakeRewardApi(auth);
    page = new VoucherDetailPage(
      { snapshot: { paramMap: { get: () => ASSET } } } as any,
      api as any,
      auth as any,
      { navigateForward: jasmine.createSpy('navigateForward') } as any,
    );
    page.ngOnInit();
  });

  afterEach(() => {
    page.ngOnDestroy();
    history.replaceState(null, '');
  });

  const code = { assetId: ASSET, qrPayload: 'QR-A', barcodePayload: 'BAR-A' };

  async function enterWithCodes(session: string) {
    auth.session = session;
    page.ionViewWillEnter();
    await settle();
    respond(api.walletCalls[api.walletCalls.length - 1], walletOf(asset(ASSET, session)));
    await settle();
  }

  it('guests request nothing and see the login prompt, even with an asset in router state', async () => {
    history.replaceState({ partnerAsset: asset(ASSET, 'A') }, '');
    page.ionViewWillEnter();
    await settle();

    expect(page.sessionChecked).toBeTrue();
    expect(page.signedIn).toBeFalse();
    expect(page.partnerAsset).toBeUndefined();
    expect(api.walletCalls.length).toBe(0);
    expect(api.assetCodeCalls.length).toBe(0);
    expect(api.memberCodeCalls.length).toBe(0);
  });

  it('shows nothing until the current wallet confirms the asset id, then fetches codes by asset id', async () => {
    history.replaceState({ partnerAsset: asset(ASSET, 'A') }, '');
    auth.session = 'A';
    page.ionViewWillEnter();
    await settle();
    expect(page.partnerAsset).toBeUndefined(); // router state is not trusted

    respond(api.walletCalls[0], walletOf(asset(ASSET, 'A')));
    await settle();
    expect(page.partnerAsset!.assetId).toBe(ASSET);
    expect(api.assetCodeCalls[0].args).toEqual([ASSET]);
  });

  it('an asset missing from the current wallet is not shown and no code is requested', async () => {
    auth.session = 'A';
    page.ionViewWillEnter();
    await settle();
    respond(api.walletCalls[0], walletOf(asset('another-asset', 'A')));
    await settle();

    expect(page.partnerAsset).toBeUndefined();
    expect(page.partnerError).toContain('not in your account');
    expect(api.assetCodeCalls.length).toBe(0);
  });

  it('session expiry while loading codes clears everything and shows the guest prompt', async () => {
    await enterWithCodes('A');
    respond(api.memberCodeCalls[0], { qrPayload: 'MEMBER-A' });
    fail(api.assetCodeCalls[0], 401, 'member_session_required');
    await settle();

    expect(auth.session).toBeNull();
    expect(page.signedIn).toBeFalse();
    expect(page.partnerAsset).toBeUndefined();
    expect(page.assetCode).toBeNull();
    expect(page.memberQr).toBeNull();
  });

  it('session expiry on the member-code request also shows the guest prompt', async () => {
    await enterWithCodes('A');
    fail(api.memberCodeCalls[0], 401, 'member_session_required');
    respond(api.assetCodeCalls[0], code);
    await settle();

    expect(page.signedIn).toBeFalse();
    expect(page.assetCode).toBeNull();
    expect(page.memberQr).toBeNull();
  });

  it('switching accounts ignores the old member wallet even if it arrives last', async () => {
    auth.session = 'A';
    page.ionViewWillEnter();
    await settle();
    const aWallet = api.walletCalls[0];

    auth.setSession('B'); // B does not own the asset
    await settle();
    const bWallet = api.walletCalls[1];
    expect(bWallet.session).toBe('B');

    respond(bWallet, walletOf(asset('b-only-asset', 'B')));
    await settle();
    respond(aWallet, walletOf(asset(ASSET, 'A'))); // late, out of order
    await settle();

    expect(page.partnerAsset).toBeUndefined();
    expect(api.assetCodeCalls.length).toBe(0);
    expect(page.assetCode).toBeNull();
  });

  it('late code responses from a previous member are ignored after switching', async () => {
    await enterWithCodes('A');
    const aCode = api.assetCodeCalls[0];
    const aMember = api.memberCodeCalls[0];

    auth.setSession('B');
    await settle();
    expect(page.partnerAsset).toBeUndefined();

    respond(aMember, { qrPayload: 'MEMBER-A' });
    respond(aCode, code);
    await settle();

    expect(page.assetCode).toBeNull();
    expect(page.memberQr).toBeNull();
  });

  it('leaving the page clears codes and ignores responses that arrive afterwards', async () => {
    await enterWithCodes('A');
    respond(api.memberCodeCalls[0], { qrPayload: 'MEMBER-A' });
    respond(api.assetCodeCalls[0], code);
    await settle();
    expect(page.assetCode!.qrPayload).toBe('QR-A');

    page.loadCodes(); // a refresh in flight when the member leaves
    page.ionViewWillLeave();
    expect(page.partnerAsset).toBeUndefined();
    expect(page.assetCode).toBeNull();
    expect(page.memberQr).toBeNull();
  });

  it('re-checks the session each time the page becomes visible', async () => {
    await enterWithCodes('A');
    page.ionViewWillLeave();

    auth.session = null; // signed out elsewhere
    page.ionViewWillEnter();
    await settle();

    expect(page.signedIn).toBeFalse();
    expect(api.walletCalls.length).toBe(1); // no new wallet request for a guest
  });
});
