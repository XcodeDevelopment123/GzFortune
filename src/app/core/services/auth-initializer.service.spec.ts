import { TestBed } from '@angular/core/testing';

import { AuthInitializerService } from './auth-initializer.service';

describe('AuthInitializerService', () => {
  let service: AuthInitializerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthInitializerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
