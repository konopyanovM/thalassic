import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Input as InputComponent } from '../form/input';
import { Select } from '../form/select';
import { FormControlAddon } from './form-control-addon';
import { FormControlGroup } from './form-control-group';

describe('FormControlGroup', () => {
  let component: FormControlGroup;
  let fixture: ComponentFixture<FormControlGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormControlGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(FormControlGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should do nothing when it wraps no control', () => {
    expect(() => component.activateControl()).not.toThrow();
  });
});

describe('FormControlGroup activateControl', () => {
  @Component({
    imports: [FormControlGroup, FormControlAddon],
    template: `
      <tls-form-control-group>
        <tls-form-control-addon><button type="button" data-testid="addon">i</button></tls-form-control-addon>
        <input class="tls-form-control" data-testid="control" />
        <input class="tls-form-control" data-testid="second" />
      </tls-form-control-group>
    `,
  })
  class HostComponent {}

  let fixture: ComponentFixture<HostComponent>;

  const query = (testId: string): HTMLElement =>
    fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('should focus the first control that is not part of an addon', () => {
    const group = fixture.debugElement.children[0].componentInstance as FormControlGroup;

    group.activateControl();

    expect(document.activeElement).toBe(query('control'));
    expect(document.activeElement).not.toBe(query('addon'));
  });
});

describe('FormControlGroup activateControl with several controls', () => {
  @Component({
    imports: [FormControlGroup, FormControlAddon],
    template: `
      <tls-form-control-group>
        <tls-form-control-addon data-testid="leading">@</tls-form-control-addon>
        <select data-testid="first"><option>+1</option></select>
        <tls-form-control-addon data-testid="middle">/</tls-form-control-addon>
        <input data-testid="second" />
        <tls-form-control-addon data-testid="trailing">USD</tls-form-control-addon>
      </tls-form-control-group>
    `,
  })
  class HostComponent {}

  let fixture: ComponentFixture<HostComponent>;

  const query = (testId: string): HTMLElement =>
    fixture.nativeElement.querySelector(`[data-testid="${testId}"]`);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('should focus the control after a leading addon', () => {
    query('leading').click();

    expect(document.activeElement).toBe(query('first'));
  });

  it('should focus the control before a trailing addon', () => {
    query('trailing').click();

    expect(document.activeElement).toBe(query('second'));
  });

  it('should prefer the following control when an addon sits between two', () => {
    query('middle').click();

    expect(document.activeElement).toBe(query('second'));
  });

  it('should skip a disabled neighbour and reach the next control', async () => {
    query('second').setAttribute('disabled', '');
    await fixture.whenStable();

    query('trailing').click();

    expect(document.activeElement).toBe(query('first'));
  });
});

describe('FormControlGroup with a control inside an addon', () => {
  @Component({
    imports: [FormControlGroup, FormControlAddon, InputComponent, Select],
    template: `
      <tls-form-control-group>
        <tls-input placeholder="amount" />
        <tls-form-control-addon>
          <tls-select [options]="options" placeholder="USD" />
        </tls-form-control-addon>
        <tls-form-control-addon data-testid="trailing">.00</tls-form-control-addon>
      </tls-form-control-group>
    `,
  })
  class HostComponent {
    public readonly options: string[] = ['USD', 'EUR'];
  }

  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  // A control can decorate the field rather than hold its value. Being nearer to the
  // clicked addon must not make it the thing handed over.
  it('should pass over a control that decorates the field', async () => {
    fixture.nativeElement.querySelector('[data-testid="trailing"]').click();
    await fixture.whenStable();

    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('tls-input input'));
    expect(fixture.nativeElement.querySelector('tls-select').classList).not.toContain(
      'tls-select--open',
    );
  });
});
