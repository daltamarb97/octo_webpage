import { TestBed } from '@angular/core/testing';

import { EmailVerifiedService } from './email-verified.service';

describe('EmailVerifiedService', () => {
  let service: EmailVerifiedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailVerifiedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
