import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTableProfileComponent } from './user-table-profile.component';

describe('UserTableProfileComponent', () => {
  let component: UserTableProfileComponent;
  let fixture: ComponentFixture<UserTableProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserTableProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTableProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
