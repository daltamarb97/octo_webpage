import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropFilesComponent } from './drop-files.component';

describe('DropFilesComponent', () => {
  let component: DropFilesComponent;
  let fixture: ComponentFixture<DropFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
