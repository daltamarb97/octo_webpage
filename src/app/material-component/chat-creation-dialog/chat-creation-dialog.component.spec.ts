import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatCreationDialogComponent } from './chat-creation-dialog.component';

describe('ChatCreationDialogComponent', () => {
  let component: ChatCreationDialogComponent;
  let fixture: ComponentFixture<ChatCreationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatCreationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatCreationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
