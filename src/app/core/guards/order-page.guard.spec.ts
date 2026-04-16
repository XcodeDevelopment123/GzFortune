import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { orderPageGuard } from './order-page.guard';

describe('historyTypeGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => orderPageGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
