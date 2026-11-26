import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IonicModule, ModalController } from '@ionic/angular';
import { QRCodeComponent } from 'angularx-qrcode';
import { AuthService } from 'src/app/core/services/auth.service';
import { RewardApiService } from 'src/app/core/repo/api/reward-api.service';
import { FakeAuth, FakeRewardApi, asset, fail, respond, settle } from 'src/app/core/testing/partner-fakes';
import { Code128BarcodeComponent } from 'src/app/shared/components/code128-barcode/code128-barcode.component';
import { VoucherCodeModalComponent } from './voucher-code-modal.component';

describe('VoucherCodeModalComponent (on-demand member QR + voucher code)', () => {
  const ASSET = '10000000-0000-4000-8000-000000000010';
  const MODAL_ID = 'test-voucher-code-modal';
  let auth: FakeAuth;
  let api: FakeRewardApi;
  let modalCtrl: { dismiss: jasmine.Spy };
  let modal: VoucherCodeModalComponent;

  const code = { assetId: ASSET, qrPayload: 'QR-A', barcodePayload: 'BAR-A' };
  const member = { qrPayload: 'MEMBER-A' };

  /** Completes the n-th pair of (member QR, voucher code) requests. */
  function respondBoth(n = 0) {
    respond(api.memberCodeCalls[n], member);
    respond(api.assetCodeCalls[n], code);
  }

  function open(session = 'A', a = asset(ASSET, session)) {
    auth.session = session;
    modal = new VoucherCodeModalComponent(modalCtrl as any, api as any, auth as any);
    modal.asset = a;
    modal.session = session;
    modal.modalId = MODAL_ID;
    modal.ngOnInit();
  }

  beforeEach(() => {
    auth = new FakeAuth();
    api = new FakeRewardApi(auth);
    modalCtrl = { dismiss: jasmine.createSpy('dismiss').and.resolveTo(true) };
  });

  afterEach(() => modal?.ngOnDestroy());

  it('fetches the member QR and the code by wallet asset id on open, loading until both arrive', async () => {
    open();
    expect(api.assetCodeCalls.length).toBe(1);
    expect(api.assetCodeCalls[0].args).toEqual([ASSET]);
    expect(api.memberCodeCalls.length).toBe(1);
    expect(modal.loading).toBeTrue();
    expect(modal.code).toBeNull();

    respond(api.assetCodeCalls[0], code);
    await settle();
    expect(modal.loading).toBeTrue(); // still waiting for the member QR

    respond(api.memberCodeCalls[0], member);
    await settle();
    expect(modal.loading).toBeFalse();
    expect(modal.memberQr).toBe('MEMBER-A');
    expect(modal.code!.qrPayload).toBe('QR-A');
    expect(modal.error).toBeNull();
  });

  it('a member-QR failure still shows the voucher code, and Reload fetches both again', async () => {
    open();
    fail(api.memberCodeCalls[0], 503, 'partner_unavailable');
    respond(api.assetCodeCalls[0], code);
    await settle();
    expect(modal.code!.qrPayload).toBe('QR-A');
    expect(modal.memberQr).toBeNull();
    expect(modal.error).toBeNull();

    modal.retry();
    expect(api.memberCodeCalls.length).toBe(2);
    expect(api.assetCodeCalls.length).toBe(2);
  });

  it('shows an error with a Retry that requests the codes again (once per tap burst)', async () => {
    open();
    fail(api.assetCodeCalls[0], 503, 'partner_unavailable');
    await settle();
    expect(modal.loading).toBeFalse();
    expect(modal.error).toBe('partner_unavailable');
    expect(modal.code).toBeNull();

    modal.retry();
    modal.retry();
    modal.retry();
    expect(api.assetCodeCalls.length).toBe(2);
    expect(api.memberCodeCalls.length).toBe(2);
    expect(modal.loading).toBeTrue();
    expect(modal.error).toBeNull();

    respondBoth(1);
    await settle();
    expect(modal.code!.qrPayload).toBe('QR-A');
    expect(modal.memberQr).toBe('MEMBER-A');
    expect(modal.error).toBeNull();
  });

  it('close clears both codes and dismisses only this modal', async () => {
    open();
    respondBoth();
    await settle();

    modal.close();
    expect(modal.code).toBeNull();
    expect(modal.memberQr).toBeNull();
    expect(modal.loading).toBeFalse();
    expect(modalCtrl.dismiss).toHaveBeenCalledOnceWith({ walletChanged: false }, 'close', MODAL_ID);

    modal.close(); // double tap on Close
    expect(modalCtrl.dismiss).toHaveBeenCalledTimes(1);
  });

  it('responses arriving after close are discarded', async () => {
    open();
    modal.close();
    respondBoth();
    await settle();
    expect(modal.code).toBeNull();
    expect(modal.memberQr).toBeNull();
    modal.retry();
    expect(api.assetCodeCalls.length).toBe(1);
  });

  it('a session change while open dismisses the modal and drops the in-flight responses', async () => {
    open('A');
    auth.setSession('B');
    expect(modalCtrl.dismiss).toHaveBeenCalledOnceWith(jasmine.anything(), 'session', MODAL_ID);

    respondBoth();
    await settle();
    expect(modal.code).toBeNull();
    expect(modal.memberQr).toBeNull();
  });

  it('sign-out while the codes are shown dismisses the modal and clears them', async () => {
    open('A');
    respondBoth();
    await settle();
    expect(modal.code).not.toBeNull();

    auth.setSession(null);
    expect(modal.code).toBeNull();
    expect(modal.memberQr).toBeNull();
    expect(modalCtrl.dismiss).toHaveBeenCalledOnceWith(jasmine.anything(), 'session', MODAL_ID);
  });

  it('responses for an older session are discarded and the modal dismissed (changed without an event)', async () => {
    open('A');
    auth.session = 'B'; // e.g. replaced by another login before the response came back
    respondBoth();
    await settle();

    expect(modal.code).toBeNull();
    expect(modal.memberQr).toBeNull();
    expect(modalCtrl.dismiss).toHaveBeenCalledOnceWith(jasmine.anything(), 'session', MODAL_ID);
  });

  it('an expired session on the voucher-code request dismisses the modal and drops only that session', async () => {
    open('A');
    fail(api.assetCodeCalls[0], 401, 'member_session_required');
    await settle();

    expect(modalCtrl.dismiss).toHaveBeenCalledOnceWith(jasmine.anything(), 'session', MODAL_ID);
    expect(auth.session).toBeNull();
    expect(modal.code).toBeNull();
  });

  it('an expired session on the member-QR request also dismisses the modal', async () => {
    open('A');
    fail(api.memberCodeCalls[0], 401, 'member_session_required');
    respond(api.assetCodeCalls[0], code);
    await settle();

    expect(modalCtrl.dismiss).toHaveBeenCalledOnceWith(jasmine.anything(), 'session', MODAL_ID);
    expect(auth.session).toBeNull();
    expect(modal.code).toBeNull();
  });

  it('asset_unavailable (used at POS meanwhile) shows the error and asks My Vouchers to re-read the wallet', async () => {
    open();
    fail(api.assetCodeCalls[0], 409, 'asset_unavailable');
    await settle();
    expect(modal.error).toBe('asset_unavailable');

    modal.close();
    expect(modalCtrl.dismiss).toHaveBeenCalledOnceWith({ walletChanged: true }, 'close', MODAL_ID);
  });

  it('never requests codes for an unavailable voucher', () => {
    open('A', asset(ASSET, 'A', false));
    expect(api.assetCodeCalls.length).toBe(0);
    expect(api.memberCodeCalls.length).toBe(0);
  });

  describe('template', () => {
    let fixture: ReturnType<typeof TestBed.createComponent<VoucherCodeModalComponent>>;

    beforeEach(async () => {
      auth.session = 'A';
      await TestBed.configureTestingModule({
        declarations: [VoucherCodeModalComponent, Code128BarcodeComponent],
        imports: [IonicModule.forRoot(), QRCodeComponent],
        providers: [
          { provide: ModalController, useValue: modalCtrl },
          { provide: RewardApiService, useValue: api },
          { provide: AuthService, useValue: auth },
        ],
      }).compileComponents();
      fixture = TestBed.createComponent(VoucherCodeModalComponent);
      fixture.componentInstance.asset = { ...asset(ASSET, 'A'), name: 'FREE RM10' };
      fixture.componentInstance.session = 'A';
      fixture.detectChanges();
    });

    afterEach(() => fixture.destroy());

    const q = (css: string) => fixture.debugElement.query(By.css(css));

    it('renders the name, a spinner while loading, then Step 1 member QR before Step 2 voucher code', async () => {
      expect(q('.voucher-name').nativeElement.textContent).toContain('FREE RM10');
      expect(q('ion-spinner')).toBeTruthy();
      expect(q('qrcode')).toBeNull();
      expect(q('.close-btn').nativeElement.textContent).toContain('Close');

      respondBoth();
      await settle();
      fixture.detectChanges();
      expect(q('ion-spinner')).toBeNull();
      const steps = fixture.debugElement.queryAll(By.css('.code-step'));
      expect(steps.length).toBe(2);
      expect(steps[0].nativeElement.classList).toContain('member-step');
      expect(steps[0].query(By.css('.step-label')).nativeElement.textContent).toContain('Step 1');
      expect(steps[0].query(By.css('qrcode'))).toBeTruthy();
      expect(steps[1].nativeElement.classList).toContain('voucher-step');
      expect(steps[1].query(By.css('.step-label')).nativeElement.textContent).toContain('Step 2');
      expect(steps[1].query(By.css('qrcode'))).toBeTruthy();
      expect(steps[1].query(By.css('app-code128-barcode'))).toBeTruthy();
    });

    it('aligns the Close button with the QR card at widths above the default button limit', async () => {
      respondBoth();
      await settle();
      fixture.detectChanges();
      q('.container').nativeElement.style.width = '380px';

      const card = q('.voucher-step').nativeElement.getBoundingClientRect();
      const button = q('.close-btn').nativeElement.getBoundingClientRect();
      expect(card.width).toBeGreaterThan(300);
      expect(button.left).toBeCloseTo(card.left);
      expect(button.right).toBeCloseTo(card.right);
    });

    it('renders the error with a working Retry button', async () => {
      fail(api.assetCodeCalls[0], 503, 'partner_unavailable');
      await settle();
      fixture.detectChanges();
      expect(q('.code-error').nativeElement.textContent).toContain('partner_unavailable');
      expect(q('qrcode')).toBeNull();

      q('.code-error ion-button').nativeElement.click();
      fixture.detectChanges();
      expect(api.assetCodeCalls.length).toBe(2);
      expect(q('ion-spinner')).toBeTruthy();
      expect(q('.code-error')).toBeNull();
    });
  });
});
