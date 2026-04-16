import { TestBed } from '@angular/core/testing';

import { ModalHelperService } from './modal-helper.service';

describe('ModalHelperService', () => {
  let service: ModalHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
