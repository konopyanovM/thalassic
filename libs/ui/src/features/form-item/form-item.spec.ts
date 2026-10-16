import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Input } from '../form/input/input';
import { FormItem } from './form-item';

@Component({
  imports: [FormItem],
  template: `
    <tls-form-item label="Email">
      <ng-template #labelTemplate let-label let-required="required">
        <em class="custom-label">{{ label }}{{ required ? ' (required)' : '' }}</em>
      </ng-template>
    </tls-form-item>
  `,
})
class LabelTemplateHostComponent {}

@Component({
  imports: [FormItem],
  template: `
    <tls-form-item>
      <ng-template #labelTemplate>
        <em class="custom-label">Only a template</em>
      </ng-template>
    </tls-form-item>
  `,
})
class LabelTemplateWithoutLabelHostComponent {}

@Component({
  imports: [FormItem, Input],
  template: `
    <tls-form-item label="Bio" [maxLength]="10">
      <tls-input [(value)]="text" />
    </tls-form-item>
  `,
})
class CounterHostComponent {
  text = signal('Alex');
}

@Component({
  imports: [FormItem, Input],
  template: `
    <tls-form-item label="Password" hint="At least 8 characters">
      <tls-input [invalid]="invalid()" [touched]="true" [errors]="errors" />
    </tls-form-item>
  `,
})
class HintHostComponent {
  invalid = signal(false);
  errors = [{ kind: 'minLength', message: 'Too short' }];
}

describe('FormItem', () => {
  let component: FormItem;
  let fixture: ComponentFixture<FormItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormItem],
    }).compileComponents();

    fixture = TestBed.createComponent(FormItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('character counter', () => {
    it('should render the current length against the budget', async () => {
      const counterFixture = TestBed.createComponent(CounterHostComponent);
      counterFixture.detectChanges();
      await counterFixture.whenStable();

      const counter: HTMLElement = counterFixture.nativeElement.querySelector('.form-item-counter');
      expect(counter).not.toBeNull();
      expect(counter.textContent).toBe('4/10');
      expect(counter.classList).not.toContain('form-item-counter--over');
    });

    it('should track the value as it changes and mark the overflow', async () => {
      const counterFixture = TestBed.createComponent(CounterHostComponent);
      counterFixture.componentInstance.text.set('Alex Petrov');
      counterFixture.detectChanges();
      await counterFixture.whenStable();

      const counter: HTMLElement = counterFixture.nativeElement.querySelector('.form-item-counter');
      expect(counter.textContent).toBe('11/10');
      expect(counter.classList).toContain('form-item-counter--over');
    });

    it('should render no counter without a budget', () => {
      expect(fixture.nativeElement.querySelector('.form-item-counter')).toBeNull();
    });
  });

  describe('hint', () => {
    it('should render the hint and describe the control with it', async () => {
      const hintFixture = TestBed.createComponent(HintHostComponent);
      hintFixture.detectChanges();
      await hintFixture.whenStable();

      const hint: HTMLElement = hintFixture.nativeElement.querySelector('.form-item-hint');
      const inputElement: HTMLInputElement = hintFixture.nativeElement.querySelector('input');
      expect(hint.textContent).toBe('At least 8 characters');
      expect(inputElement.getAttribute('aria-describedby')).toBe(hint.id);
    });

    it('should give way to a displayed error', async () => {
      const hintFixture = TestBed.createComponent(HintHostComponent);
      hintFixture.componentInstance.invalid.set(true);
      hintFixture.detectChanges();
      await hintFixture.whenStable();

      const error: HTMLElement = hintFixture.nativeElement.querySelector('.form-item-error__text');
      const inputElement: HTMLInputElement = hintFixture.nativeElement.querySelector('input');
      expect(hintFixture.nativeElement.querySelector('.form-item-hint')).toBeNull();
      expect(error.textContent?.trim()).toBe('Too short');
      expect(inputElement.getAttribute('aria-describedby')).toBe(error.id);
    });
  });

  describe('custom label content', () => {
    it('should render the template inside the managed label element', async () => {
      const templateFixture = TestBed.createComponent(LabelTemplateHostComponent);
      templateFixture.detectChanges();
      await templateFixture.whenStable();

      const label: HTMLLabelElement = templateFixture.nativeElement.querySelector('.form-item-label');
      expect(label).not.toBeNull();
      expect(label.querySelector('.custom-label')?.textContent).toContain('Email');
      expect(label.querySelector('.form-item-label__text')).toBeNull();
    });

    it('should render the label element when only a template is provided', async () => {
      const templateFixture = TestBed.createComponent(LabelTemplateWithoutLabelHostComponent);
      templateFixture.detectChanges();
      await templateFixture.whenStable();

      const label: HTMLLabelElement = templateFixture.nativeElement.querySelector('.form-item-label');
      expect(label).not.toBeNull();
      expect(label.textContent).toContain('Only a template');
    });
  });
});
