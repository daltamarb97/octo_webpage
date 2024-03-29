import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappComponent} from './whatsapp.component';

describe('ComunicationsComponent', () => {
  let component: WhatsappComponent;
  let fixture: ComponentFixture<WhatsappComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhatsappComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatsappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
