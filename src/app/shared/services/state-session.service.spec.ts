import { TestBed } from '@angular/core/testing';

import { StateSessionService } from './state-session.service';

describe('StateSessionService', () => {
  let service: StateSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
