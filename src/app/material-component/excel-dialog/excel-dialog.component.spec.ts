import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelDialogComponent } from './excel-dialog.component';

describe('ExcelDialogComponent', () => {
  let component: ExcelDialogComponent;
  let fixture: ComponentFixture<ExcelDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExcelDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
