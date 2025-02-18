import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupYesNoComponent } from './popup-yes-no.component';

describe('PopupYesNoComponent', () => {
  let component: PopupYesNoComponent;
  let fixture: ComponentFixture<PopupYesNoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupYesNoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PopupYesNoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
