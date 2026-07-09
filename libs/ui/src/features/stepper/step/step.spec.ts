import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepperService } from '../stepper.service';
import { Step } from './step';

describe('Step', () => {
  let component: Step;
  let fixture: ComponentFixture<Step>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Step],
      providers: [StepperService],
    }).compileComponents();

    fixture = TestBed.createComponent(Step);
    fixture.componentRef.setInput('value', 'step-1');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
