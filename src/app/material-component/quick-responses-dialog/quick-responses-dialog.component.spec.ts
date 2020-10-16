import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickResponsesDialogComponent } from './quick-responses-dialog.component';

describe('QuickResponsesDialogComponent', () => {
  let component: QuickResponsesDialogComponent;
  let fixture: ComponentFixture<QuickResponsesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuickResponsesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickResponsesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
