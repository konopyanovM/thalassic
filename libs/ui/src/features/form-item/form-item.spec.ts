import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
