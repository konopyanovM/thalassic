import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Step } from './step';
import { Stepper } from './stepper';
import { stepperLabelPosition, StepperSelectEvent } from './stepper.types';

@Component({
  imports: [Stepper, Step],
  template: `
    <tls-stepper
      [active]="active()"
      (activeChange)="active.set($event)"
      [linear]="linear()"
      [completed]="completed()"
      [labelPosition]="labelPosition()"
      (stepSelect)="selections.push($event)"
      ariaLabel="Checkout steps"
    >
      <ng-template #stepCompletedIcon>✓</ng-template>
      <tls-step value="account" label="Account">Account content</tls-step>
      <tls-step value="profile" label="Profile" [invalid]="profileInvalid()">Profile content</tls-step>
      <tls-step value="payment" label="Payment">Payment content</tls-step>
      <tls-step value="review" label="Review">Review content</tls-step>
      <ng-template #completedTemplate>All steps completed!</ng-template>
    </tls-stepper>
  `,
})
class HostComponent {
  readonly active = signal('account');
  readonly linear = signal(false);
  readonly completed = signal(false);
  readonly labelPosition = signal<stepperLabelPosition>('end');
  readonly profileInvalid = signal(false);
  readonly selections: StepperSelectEvent[] = [];
}

describe('Stepper', () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  const items = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.tls-stepper-header__item'));
  const buttons = (): HTMLButtonElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.tls-stepper-header-button'));

  it('renders a tab per step and marks the active one', () => {
    expect(buttons().length).toBe(4);
    expect(items()[0].classList).toContain('tls-stepper-header__item--active');
    expect(items()[1].classList).not.toContain('tls-stepper-header__item--active');
  });

  it('selects a clicked step, updating the model and emitting stepSelect', async () => {
    buttons()[2].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.active()).toBe('payment');
    expect(component.selections).toEqual([{ index: 2, value: 'payment' }]);
    expect(items()[2].classList).toContain('tls-stepper-header__item--active');
  });

  it('marks steps before the active one completed and shows their state text', async () => {
    component.active.set('payment');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(items()[0].classList).toContain('tls-stepper-header__item--completed');
    expect(items()[1].classList).toContain('tls-stepper-header__item--completed');
    expect(items()[2].classList).not.toContain('tls-stepper-header__item--completed');

    const stateTexts = items().map(item => {
      const state = item.querySelector('.tls-stepper-header-button__state');
      return state === null ? null : state.textContent;
    });
    expect(stateTexts).toEqual(['Completed', 'Completed', null, null]);
  });

  it('disables steps beyond the next one in linear mode', async () => {
    component.linear.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(buttons().map(button => button.getAttribute('aria-disabled'))).toEqual([
      'false',
      'false',
      'true',
      'true',
    ]);
    expect(items()[2].classList).toContain('tls-stepper-header__item--unreachable');
  });

  it('reflects an invalid step with the class and state text', async () => {
    component.profileInvalid.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(items()[1].classList).toContain('tls-stepper-header__item--invalid');

    const state = items()[1].querySelector('.tls-stepper-header-button__state');
    if (state === null) throw new Error('state text not rendered');
    expect(state.textContent).toBe('Invalid');
  });

  it('marks every step completed and swaps content for the completed template', async () => {
    component.completed.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    for (const item of items()) {
      expect(item.classList).toContain('tls-stepper-header__item--completed');
    }

    const content: HTMLElement = fixture.nativeElement.querySelector(
      '.tls-stepper-content__template',
    );
    expect(content.textContent).toContain('All steps completed!');
  });

  it('reflects the label position as a host class', async () => {
    const host = (): HTMLElement => fixture.nativeElement.querySelector('tls-stepper');

    expect(host().classList).toContain('tls-stepper--label-end');

    component.labelPosition.set('bottom');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host().classList).toContain('tls-stepper--label-bottom');
    expect(host().classList).not.toContain('tls-stepper--label-end');
  });

  it('renders the stepper-level completed icon for completed steps', async () => {
    component.active.set('profile');
    fixture.detectChanges();
    await fixture.whenStable();

    const index = items()[0].querySelector('.tls-stepper-header-button__index');
    if (index === null || index.textContent === null) throw new Error('index not rendered');
    expect(index.textContent.trim()).toBe('✓');
  });
});
