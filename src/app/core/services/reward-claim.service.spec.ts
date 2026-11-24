import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { firstValueFrom, of, Subject, throwError } from 'rxjs';
import { PartnerClaimRequest, PartnerOffer, toPartnerError } from '../models/partner-reward.model';
import { RewardApiService } from '../repo/api/reward-api.service';
import { RewardClaimService } from './reward-claim.service';

describe('RewardClaimService', () => {
  const offer: PartnerOffer = {
    rewardId: '10000000-0000-4000-8000-000000000001',
    version: 3,
    name: 'Demo',
    type: 'reward',
    pointsCost: '50',
    howToGet: 'points',
  };
  let calls: PartnerClaimRequest[];
  let responder: () => any;
  let service: RewardClaimService;

  beforeEach(async () => {
    calls = [];
    await Preferences.clear();
    const api = {
      claimReward: (req: PartnerClaimRequest) => {
        calls.push(req);
        return responder();
      },
    };
    TestBed.configureTestingModule({ providers: [{ provide: RewardApiService, useValue: api }] });
    service = TestBed.inject(RewardClaimService);
  });

  const asset = { assetId: 'a-1', name: 'Demo', type: 'reward', status: 'active', availability: 'available', isAvailable: true };

  it('sends the confirmed cost, reward id and version, and forgets the claim id after success', async () => {
    responder = () => of({ claimId: 'x', asset });
    await firstValueFrom(service.claim(offer));
    expect(calls.length).toBe(1);
    expect(calls[0].rewardId).toBe(offer.rewardId);
    expect(calls[0].version).toBe(3);
    expect(calls[0].confirmedPointsCost).toBe('50');
    expect(calls[0].claimId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

    // A later, separate claim gets a new UUID.
    await firstValueFrom(service.claim(offer));
    expect(calls[1].claimId).not.toBe(calls[0].claimId);
  });

  it('reuses the SAME claim id when the outcome was unknown', async () => {
    responder = () => throwError(() => ({ status: 503, error: { code: 'claim_outcome_unknown', retryable: true } }));
    await expectAsync(firstValueFrom(service.claim(offer))).toBeRejected();
    responder = () => throwError(() => ({ status: 0, error: null })); // network drop
    await expectAsync(firstValueFrom(service.claim(offer))).toBeRejected();
    responder = () => of({ claimId: 'x', asset });
    await firstValueFrom(service.claim(offer));

    expect(calls.length).toBe(3);
    expect(new Set(calls.map((c) => c.claimId)).size).toBe(1);
  });

  it('uses a fresh claim id after a definitive failure such as insufficient points', async () => {
    responder = () =>
      throwError(() => ({ status: 409, error: { code: 'insufficient_points', message: 'Not enough points', retryable: false } }));
    const err: any = await firstValueFrom(service.claim(offer)).catch((e) => e);
    expect(err.code).toBe('insufficient_points');
    expect(err.status).toBe(409);

    responder = () => of({ claimId: 'x', asset });
    await firstValueFrom(service.claim(offer));
    expect(calls[1].claimId).not.toBe(calls[0].claimId);
  });

  it('refuses a second submission while one is pending', async () => {
    const pending = new Subject<any>();
    responder = () => pending;
    const first = firstValueFrom(service.claim(offer));
    await new Promise((r) => setTimeout(r, 0));
    expect(service.isPending(offer.rewardId)).toBeTrue();

    const second: any = await firstValueFrom(service.claim(offer)).catch((e) => e);
    expect(second.code).toBe('claim_in_progress');

    pending.next({ claimId: 'x', asset });
    pending.complete();
    await first;
    expect(calls.length).toBe(1);
    expect(service.isPending(offer.rewardId)).toBeFalse();
  });

  it('maps backend errors without treating them as success', () => {
    const e = toPartnerError({ status: 409, error: { code: 'reward_unavailable', message: 'Gone', traceId: 't-1' } });
    expect(e).toEqual(jasmine.objectContaining({ status: 409, code: 'reward_unavailable', retryable: false, traceId: 't-1' }));
    expect(toPartnerError({ status: 0, error: null }).retryable).toBeTrue();
  });
});
