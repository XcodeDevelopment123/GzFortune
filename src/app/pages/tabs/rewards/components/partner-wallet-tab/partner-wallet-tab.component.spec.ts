import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { FakeAuth, asset, settle, walletOf } from 'src/app/core/testing/partner-fakes';
import { VoucherCodeModalComponent } from '../voucher-code-modal/voucher-code-modal.component';
import { PartnerWalletTabComponent, VOUCHER_CODE_MODAL_ID } from './partner-wallet-tab.component';

/** Minimal stand-in for an ion-modal element. */
class FakeModal {
  presented = 0;
  private resolveDismiss!: (v: { data?: any; role?: string }) => void;
  private dismissed = new Promise<{ data?: any; role?: string }>((r) => (this.resolveDismiss = r));
  present = jasmine.createSpy('present').and.callFake(async () => {
    this.presented++;
  });
  dismiss = jasmine.createSpy('dismiss').and.callFake(async (data?: any, role?: string) => {
    this.resolveDismiss({ data, role });
    return true;
  });
  onDidDismiss() {
    return this.dismissed;
  }
}

describe('PartnerWalletTabComponent voucher images', () => {
  it('shows the gift placeholder for vouchers without images and renders supplied images', async () => {
    await TestBed.configureTestingModule({
      declarations: [PartnerWalletTabComponent],
      imports: [CommonModule, IonicModule.forRoot()],
      providers: [provideRouter([]), { provide: AuthService, useValue: new FakeAuth() }],
    }).compileComponents();

    const fixture = TestBed.createComponent(PartnerWalletTabComponent);
    const imageUrl = 'assets/images/app-offer.jpg';
    fixture.componentRef.setInput('signedIn', true);
    fixture.componentRef.setInput('loaded', true);
    fixture.componentRef.setInput(
      'wallet',
      walletOf(
        asset('no-image', 'A'),
        { ...asset('has-image', 'A'), imageUrl },
        { ...asset('expired', 'A', false), availability: 'expired', imageUrl: '  ' },
      ),
    );
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('.reward-image-placeholder ion-icon[name="gift-outline"]').length).toBe(2);
    const images = element.querySelectorAll('img.voucher-media');
    expect(images.length).toBe(1);
    expect(images[0]?.getAttribute('src')).toBe(imageUrl);
  });
});

describe('PartnerWalletTabComponent (SHOW CODE opens the voucher QR modal)', () => {
  let auth: FakeAuth;
  let router: { navigate: jasmine.Spy };
  let modals: FakeModal[];
  let modalCtrl: { create: jasmine.Spy };
  let tab: PartnerWalletTabComponent;

  const click = () => ({ stopPropagation: jasmine.createSpy('stopPropagation') }) as any as Event;

  beforeEach(() => {
    auth = new FakeAuth();
    auth.session = 'A';
    router = { navigate: jasmine.createSpy('navigate') };
    modals = [];
    modalCtrl = {
      create: jasmine.createSpy('create').and.callFake(async () => {
        const m = new FakeModal();
        modals.push(m);
        return m;
      }),
    };
    tab = new PartnerWalletTabComponent(router as any, modalCtrl as any, auth as any);
    tab.signedIn = true;
  });

  afterEach(() => tab.ngOnDestroy());

  it('opens the code modal for that wallet asset over the page, without navigating', async () => {
    const a = asset('asset-1', 'A');
    const ev = click();
    await tab.showCode(a, ev);

    expect(ev.stopPropagation).toHaveBeenCalled(); // the card's detail navigation does not fire
    expect(router.navigate).not.toHaveBeenCalled();
    expect(modalCtrl.create).toHaveBeenCalledTimes(1);
    const opts = modalCtrl.create.calls.mostRecent().args[0];
    expect(opts.component).toBe(VoucherCodeModalComponent);
    expect(opts.id).toBe(VOUCHER_CODE_MODAL_ID);
    expect(opts.componentProps).toEqual({ asset: a, session: 'A', modalId: VOUCHER_CODE_MODAL_ID });
    expect(modals[0].presented).toBe(1);
  });

  it('a burst of taps opens one modal (and so sends one code request)', async () => {
    const a = asset('asset-1', 'A');
    await Promise.all([tab.showCode(a, click()), tab.showCode(a, click()), tab.showCode(a, click())]);
    await tab.showCode(a, click()); // tap while the modal is already open

    expect(modalCtrl.create).toHaveBeenCalledTimes(1);
    expect(modals[0].presented).toBe(1);
  });

  it('can open again after closing, and a second voucher gets its own asset id', async () => {
    await tab.showCode(asset('asset-1', 'A'), click());
    await modals[0].dismiss({ walletChanged: false }, 'close');
    await settle();

    await tab.showCode(asset('asset-2', 'A'), click());
    expect(modalCtrl.create).toHaveBeenCalledTimes(2);
    expect(modalCtrl.create.calls.mostRecent().args[0].componentProps.asset.assetId).toBe('asset-2');
  });

  it('used, expired and unavailable vouchers do not open the modal', async () => {
    const used = asset('used', 'A', false);
    const expired = { ...asset('expired', 'A', false), availability: 'expired' as const };
    const other = { ...asset('other', 'A', false), availability: 'unavailable' as any };
    for (const a of [used, expired, other]) await tab.showCode(a, click());

    expect(modalCtrl.create).not.toHaveBeenCalled();
    expect(tab.statusLabel(used)).toBe('USED');
    expect(tab.statusLabel(expired)).toBe('EXPIRED');
    expect(tab.statusLabel(other)).toBe('UNAVAILABLE');
  });

  it('guests never open the modal', async () => {
    tab.signedIn = false;
    await tab.showCode(asset('asset-1', 'A'), click());
    auth.session = null;
    tab.signedIn = true;
    await tab.showCode(asset('asset-1', 'A'), click());
    expect(modals.every((m) => m.presented === 0)).toBeTrue();
  });

  it('does not present the modal if the member changed while it was being created', async () => {
    modalCtrl.create.and.callFake(async () => {
      auth.session = 'B';
      const m = new FakeModal();
      modals.push(m);
      return m;
    });
    await tab.showCode(asset('asset-1', 'A'), click());
    expect(modals[0].presented).toBe(0);
  });

  it('asks the page to re-read the wallet when the modal reports it changed', async () => {
    const changed = jasmine.createSpy('walletChanged');
    tab.walletChanged.subscribe(changed);
    await tab.showCode(asset('asset-1', 'A'), click());
    await modals[0].dismiss({ walletChanged: true }, 'close');
    await settle();
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('card taps still open the voucher detail route', () => {
    tab.open(asset('asset-1', 'A'));
    expect(router.navigate).toHaveBeenCalledWith(['/voucher-detail', 'asset-1'], jasmine.anything());
  });

  it('dismisses an open modal when the tab is destroyed', async () => {
    await tab.showCode(asset('asset-1', 'A'), click());
    tab.ngOnDestroy();
    expect(modals[0].dismiss).toHaveBeenCalled();
  });
});
