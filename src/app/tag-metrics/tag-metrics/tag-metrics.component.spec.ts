import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagMetricsComponent } from './tag-metrics.component';

describe('TagMetricsComponent', () => {
  let component: TagMetricsComponent;
  let fixture: ComponentFixture<TagMetricsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagMetricsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
