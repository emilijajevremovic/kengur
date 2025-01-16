import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameInfComponent } from './game-inf.component';

describe('GameInfComponent', () => {
  let component: GameInfComponent;
  let fixture: ComponentFixture<GameInfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameInfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameInfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
