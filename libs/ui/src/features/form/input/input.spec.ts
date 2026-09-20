import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Input } from './input';

describe('Input', () => {
  let component: Input;
  let fixture: ComponentFixture<Input>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Input]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Input);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carries the outlined variant class by default', () => {
    const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(inputElement.classList).toContain('tls-form-control--outlined');
  });

  it('switches to the plain variant class', async () => {
    fixture.componentRef.setInput('variant', 'plain');
    await fixture.whenStable();

    const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(inputElement.classList).toContain('tls-form-control--plain');
    expect(inputElement.classList).not.toContain('tls-form-control--outlined');
  });

  it('hands a length limit to the native field, and none when unset', async () => {
    const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(inputElement.hasAttribute('maxlength')).toBe(false);

    fixture.componentRef.setInput('maxLength', 80);
    await fixture.whenStable();

    expect(inputElement.getAttribute('maxlength')).toBe('80');
  });

  it('carries the autosize class only when asked to size to its content', async () => {
    const inputElement: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(inputElement.classList).not.toContain('tls-form-control--autosize');

    fixture.componentRef.setInput('autosize', true);
    await fixture.whenStable();

    expect(inputElement.classList).toContain('tls-form-control--autosize');
  });
});
