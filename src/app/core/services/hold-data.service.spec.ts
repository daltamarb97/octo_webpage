import { TestBed } from '@angular/core/testing';

import { HoldDataService } from './hold-data.service';

describe('HoldDataService', () => {
  let service: HoldDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HoldDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
