import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOptDialogComponent } from './editopt-dialog.component';

describe('ExcelDialogComponent', () => {
  let component: EditOptDialogComponent;
  let fixture: ComponentFixture<EditOptDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditOptDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
