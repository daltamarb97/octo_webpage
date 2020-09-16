import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {  OptionComponent } from './option-dialog.component';

describe('CategoryComponent', () => {
  let component: OptionComponent;
  let fixture: ComponentFixture<OptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
