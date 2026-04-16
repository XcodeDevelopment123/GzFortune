import { TestBed } from '@angular/core/testing';

import { ToastHelperService } from './toast-helper.service';

describe('ToastHelperService', () => {
  let service: ToastHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
