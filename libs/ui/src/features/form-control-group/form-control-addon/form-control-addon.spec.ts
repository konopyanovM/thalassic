import { Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Input as InputComponent } from '../../form/input';
import { Select } from '../../form/select';
import { FormControlGroup } from '../form-control-group';
import { FormControlAddon } from './form-control-addon';

describe('FormControlAddon', () => {
  let component: FormControlAddon;
  let fixture: ComponentFixture<FormControlAddon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormControlAddon],
    }).compileComponents();

    fixture = TestBed.createComponent(FormControlAddon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should carry the block class', () => {
    expect(fixture.nativeElement.classList).toContain('tls-form-control-addon');
  });

  it('should not draw a divider by default', () => {
    expect(fixture.nativeElement.classList).not.toContain('tls-form-control-addon--divider');
  });

  it('should reflect the divider input onto the host', async () => {
    fixture.componentRef.setInput('divider', true);
    await fixture.whenStable();

    expect(fixture.nativeElement.classList).toContain('tls-form-control-addon--divider');

    fixture.componentRef.setInput('divider', false);
    await fixture.whenStable();

    expect(fixture.nativeElement.classList).not.toContain('tls-form-control-addon--divider');
  });

  it('should treat a bare attribute as enabled', async () => {
    fixture.componentRef.setInput('divider', '');
    await fixture.whenStable();

    expect(fixture.nativeElement.classList).toContain('tls-form-control-addon--divider');
  });

  it('should not throw when clicked outside a group', () => {
    expect(() => fixture.nativeElement.click()).not.toThrow();
  });
});

describe('FormControlAddon focus forwarding', () => {
  @Component({
    imports: [FormControlGroup, FormControlAddon],
    template: `
      <tls-form-control-group>
        <tls-form-control-addon>
          <svg data-testid="icon"><circle /></svg>
        </tls-form-control-addon>
        <input class="tls-form-control" [disabled]="disabled()" />
        <tls-form-control-addon [focusControl]="forwards()">
          <button data-testid="action" type="button">Go</button>
        </tls-form-control-addon>
      </tls-form-control-group>
    `,
  })
  class HostComponent {
    public readonly disabled: WritableSignal<boolean> = signal(false);
    public readonly forwards: WritableSignal<boolean> = signal(true);
  }

  let fixture: ComponentFixture<HostComponent>;

  const addons = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('tls-form-control-addon'));
  const input = (): HTMLInputElement => fixture.nativeElement.querySelector('input');
  const query = (testId: string): HTMLElement =>
    fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('should focus the control when the addon is clicked', () => {
    addons()[0].click();

    expect(document.activeElement).toBe(input());
  });

  it('should focus the control when projected artwork is clicked', () => {
    query('icon').dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.activeElement).toBe(input());
  });

  it('should leave a click on the addon own control alone', () => {
    query('action').click();

    expect(document.activeElement).not.toBe(input());
  });

  it('should not forward when focusControl is off', async () => {
    fixture.componentInstance.forwards.set(false);
    await fixture.whenStable();

    addons()[1].click();

    expect(document.activeElement).not.toBe(input());
  });

  it('should not focus a disabled control', async () => {
    fixture.componentInstance.disabled.set(true);
    await fixture.whenStable();

    addons()[0].click();

    expect(document.activeElement).not.toBe(input());
  });
});

describe('FormControlAddon handing over a projected control', () => {
  @Component({
    imports: [FormControlGroup, FormControlAddon, Select],
    template: `
      <tls-form-control-group>
        <tls-form-control-addon data-testid="icon">@</tls-form-control-addon>
        <tls-select [options]="options" placeholder="+1" />
      </tls-form-control-group>
    `,
  })
  class SelectHostComponent {
    public readonly options: string[] = ['+1', '+44'];
  }

  let fixture: ComponentFixture<SelectHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SelectHostComponent] }).compileComponents();

    fixture = TestBed.createComponent(SelectHostComponent);
    await fixture.whenStable();
  });

  it('should open the panel, not merely focus the trigger', async () => {
    const addon: HTMLElement = fixture.nativeElement.querySelector('[data-testid="icon"]');
    const select: HTMLElement = fixture.nativeElement.querySelector('tls-select');
    const trigger: HTMLElement = fixture.nativeElement.querySelector('.tls-select__trigger');

    addon.click();
    await fixture.whenStable();

    expect(document.activeElement).toBe(trigger);
    expect(select.classList).toContain('tls-select--open');
  });
});

describe('FormControlAddon with a named control', () => {
  @Component({
    imports: [FormControlGroup, FormControlAddon, InputComponent],
    template: `
      <tls-form-control-group>
        <tls-input #first placeholder="first" />
        <tls-input #second placeholder="second" />
        <tls-form-control-addon [control]="first" data-testid="named">go</tls-form-control-addon>
      </tls-form-control-group>
    `,
  })
  class NamedHostComponent {}

  let fixture: ComponentFixture<NamedHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NamedHostComponent] }).compileComponents();

    fixture = TestBed.createComponent(NamedHostComponent);
    await fixture.whenStable();
  });

  it('should hand over the named control rather than the nearest one', () => {
    const inputs: HTMLInputElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('tls-input input'),
    );

    fixture.nativeElement.querySelector('[data-testid="named"]').click();

    expect(document.activeElement).toBe(inputs[0]);
    expect(document.activeElement).not.toBe(inputs[1]);
  });
});
