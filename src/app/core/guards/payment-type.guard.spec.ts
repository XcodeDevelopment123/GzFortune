import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { paymentTypeGuard } from './payment-type.guard';

describe('paymentTypeGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => paymentTypeGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
