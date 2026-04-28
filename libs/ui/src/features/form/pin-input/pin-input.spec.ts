import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PinInput } from './pin-input';

describe('PinInput', () => {
  let component: PinInput;
  let fixture: ComponentFixture<PinInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinInput],
    }).compileComponents();

    fixture = TestBed.createComponent(PinInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
