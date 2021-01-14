import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosedchatsComponent} from './closedchats.component';

describe('ComunicationsComponent', () => {
  let component: ClosedchatsComponent;
  let fixture: ComponentFixture<ClosedchatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClosedchatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClosedchatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
