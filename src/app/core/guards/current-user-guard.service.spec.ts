import { TestBed } from '@angular/core/testing';

import { CurrentUserGuard } from './current-user-guard.service';

describe('AdminGuardService', () => {
  let service: CurrentUserGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentUserGuard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
