import { TestBed } from '@angular/core/testing';

import { AlertHelperService } from './alert-helper.service';

describe('AlertHelperService', () => {
  let service: AlertHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
