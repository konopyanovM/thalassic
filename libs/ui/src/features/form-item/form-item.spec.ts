import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';
import { Checkbox } from '../form/checkbox/checkbox';
import { Input } from '../form/input/input';
import { FormItem } from './form-item';
import { provideFormItemConfig } from './form-item.provider';

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

@Component({
  imports: [FormItem, Input, Checkbox, FormField],
  template: `
    <tls-form-item label="Nickname" optionalText="(optional)">
      <tls-input [formField]="profile.nickname" />
    </tls-form-item>
    <tls-form-item label="Email" optionalText="(optional)">
      <tls-input [formField]="profile.email" />
    </tls-form-item>
    <tls-form-item label="Newsletter" optionalText="(optional)">
      <tls-checkbox [formField]="profile.newsletter" />
    </tls-form-item>
    <tls-form-item label="Theme" optionalText="(optional)">
      <tls-input [(value)]="theme" />
    </tls-form-item>
    <tls-form-item label="Search" optionalText="(optional)">
      <tls-input [(value)]="theme" />
      <tls-input [formField]="profile.nickname" />
    </tls-form-item>
  `,
})
class OptionalMarkerHostComponent {
  theme = signal('');
  profile = form(signal({ nickname: '', email: '', newsletter: false }), (path) => {
    required(path.email);
  });
}

@Component({
  selector: 'tls-unmarked-scope',
  imports: [FormItem, Input, FormField],
  providers: [provideFormItemConfig({ optionalText: undefined })],
  template: `
    <tls-form-item label="Nickname">
      <tls-input [formField]="profile.nickname" />
    </tls-form-item>
  `,
})
class UnmarkedScopeComponent {
  profile = form(signal({ nickname: '' }));
}

@Component({
  imports: [FormItem, Input, FormField, UnmarkedScopeComponent],
  providers: [provideFormItemConfig({ optionalText: '(optional)', reserveErrorSpace: false })],
  template: `
    <tls-form-item label="Email">
      <tls-input [formField]="profile.email" />
    </tls-form-item>
    <tls-unmarked-scope />
  `,
})
class ScopedConfigHostComponent {
  profile = form(signal({ email: '' }));
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

    it('should mark the item as carrying a hint only when one is set', async () => {
      const hintFixture = TestBed.createComponent(HintHostComponent);
      await hintFixture.whenStable();
      const item: HTMLElement = hintFixture.nativeElement.querySelector('tls-form-item');

      expect(item.classList).toContain('tls-form-item--has-hint');
      expect(fixture.nativeElement.classList).not.toContain('tls-form-item--has-hint');
    });

    it('should keep the hint mark while an error takes the hint\'s place', async () => {
      const hintFixture = TestBed.createComponent(HintHostComponent);
      hintFixture.componentInstance.invalid.set(true);
      await hintFixture.whenStable();
      const item: HTMLElement = hintFixture.nativeElement.querySelector('tls-form-item');

      expect(hintFixture.nativeElement.querySelector('.form-item-hint')).toBeNull();
      expect(item.classList).toContain('tls-form-item--has-hint');
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

  describe('optional marker', () => {
    it('should mark only form fields that may be skipped, never a required field, a toggle or a plain value', async () => {
      const markerFixture = TestBed.createComponent(OptionalMarkerHostComponent);
      markerFixture.detectChanges();
      await markerFixture.whenStable();

      const element: HTMLElement = markerFixture.nativeElement;
      const marked = Array.from(element.querySelectorAll('.form-item-label'))
        .filter((label) => label.querySelector('.form-item-label__optional'))
        .map((label) => label.querySelector('.form-item-label__text')?.textContent?.trim());

      expect(marked).toEqual(['Nickname']);
    });
  });

  describe('scoped config', () => {
    it('should layer each override on the config of the scope around it', async () => {
      const scopedFixture = TestBed.createComponent(ScopedConfigHostComponent);
      scopedFixture.detectChanges();
      await scopedFixture.whenStable();

      const element: HTMLElement = scopedFixture.nativeElement;
      const marked = Array.from(element.querySelectorAll('.form-item-label'))
        .filter((label) => label.querySelector('.form-item-label__optional'))
        .map((label) => label.querySelector('.form-item-label__text')?.textContent?.trim());

      expect(marked).toEqual(['Email']);
      // The inner scope leaves the reserved error space alone, so it keeps the outer value.
      expect(element.querySelector('.form-item-footer')).toBeNull();
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
