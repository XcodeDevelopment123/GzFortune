import { TestBed } from '@angular/core/testing';

import { LoadingHelperService } from './loading-helper.service';

describe('LoadingHelperService', () => {
  let service: LoadingHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
