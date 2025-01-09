import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupUsersOnlineComponent } from './popup-users-online.component';

describe('PopupUsersOnlineComponent', () => {
  let component: PopupUsersOnlineComponent;
  let fixture: ComponentFixture<PopupUsersOnlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupUsersOnlineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PopupUsersOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
