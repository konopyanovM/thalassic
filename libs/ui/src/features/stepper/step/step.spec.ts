import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Stepper } from '../stepper';
import { Step } from './step';

@Component({
  imports: [Stepper, Step],
  template: `
    <tls-stepper active="step-1">
      <tls-step value="step-1" label="Step 1">Content 1</tls-step>
    </tls-stepper>
  `,
})
class TestHostComponent {}

describe('Step', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: Step;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    component = fixture.debugElement.query(By.directive(Step)).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
