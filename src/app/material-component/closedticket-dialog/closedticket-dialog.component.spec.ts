import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosedTicketDialogComponent } from './closedticket-dialog.component';

describe('ClosedTicketDialogComponent', () => {
  let component: ClosedTicketDialogComponent;
  let fixture: ComponentFixture<ClosedTicketDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClosedTicketDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClosedTicketDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
