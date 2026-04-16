import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { historyTypeGuard } from './history-type.guard';

describe('historyTypeGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => historyTypeGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
