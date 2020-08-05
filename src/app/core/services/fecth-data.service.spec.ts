import { TestBed } from '@angular/core/testing';

import { FecthDataService } from './fecth-data.service';

describe('FecthDataService', () => {
  let service: FecthDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FecthDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
