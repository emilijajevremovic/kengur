import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameMathComponent } from './game-math.component';

describe('GameMathComponent', () => {
  let component: GameMathComponent;
  let fixture: ComponentFixture<GameMathComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameMathComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameMathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
