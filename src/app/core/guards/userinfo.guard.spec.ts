import { TestBed } from '@angular/core/testing';

import { UserinfoGuard } from './userinfo.guard';

describe('UserinfoGuard', () => {
  let guard: UserinfoGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(UserinfoGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
