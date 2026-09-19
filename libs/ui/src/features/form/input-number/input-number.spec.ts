import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputNumber } from './input-number';

describe('InputNumber', () => {
  let component: InputNumber;
  let fixture: ComponentFixture<InputNumber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputNumber],
    }).compileComponents();

    fixture = TestBed.createComponent(InputNumber);
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
});
