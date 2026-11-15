import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonDirective } from './button';
import { FormControlGroup } from './form-control-group';
import { Input } from './form/input/input';
import { Select } from './form/select/select';
import { Textarea } from './form/textarea/textarea';

@Component({
  imports: [ButtonDirective, FormControlGroup, Input, Select, Textarea],
  template: `
    <button tlsButton>Save</button>
    <tls-form-control-group>
      <tls-input />
    </tls-form-control-group>
    <tls-select />
    <tls-textarea />
  `,
})
class FreshControlsHostComponent {}

/**
 * A component's elements are created in one pass and its bindings applied in the next; styles
 * computed between the two must already see each control's block class, or a transition animates
 * the control in from a bare element. These run no change detection, so only static classes show;
 * an element inside a control-flow block is created with its bindings and has no such gap.
 */
describe('static block classes', () => {
  it('should carry every control\'s block class from creation, before any binding is applied', async () => {
    await TestBed.configureTestingModule({ imports: [FreshControlsHostComponent] }).compileComponents();

    const element: HTMLElement = TestBed.createComponent(FreshControlsHostComponent).nativeElement;
    const classesOf = (selector: string): string[] => {
      const found = element.querySelector(selector);
      return found ? Array.from(found.classList) : [];
    };

    expect(classesOf('button[tlsButton]')).toContain('tls-button');
    expect(classesOf('tls-form-control-group')).toContain('tls-form-control-group');
    expect(classesOf('tls-input input')).toContain('tls-form-control');
    expect(classesOf('tls-select')).toEqual(expect.arrayContaining(['tls-select', 'tls-form-control']));
    expect(classesOf('tls-textarea textarea')).toContain('tls-form-control');
  });
});
